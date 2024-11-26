from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from sqlalchemy import func
from datetime import datetime
import uuid  # For generating shortcut IDs
from extensions import db  # Import db
import os
import json
import datetime
import secrets
import uuid
# from models import User, Shortcut, Tag

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shortcuts.db'
app.secret_key = os.getenv('SECRET_KEY')
if not app.secret_key:
    raise ValueError("No SECRET_KEY set for Flask application")
db.init_app(app)  # Initialize db with app

# Import models after initializing db
from models import User, Shortcut, Tag
import os

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Redirect to 'login' view if not authenticated

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# db = SQLAlchemy(app)

shortcut_tags = db.Table('shortcut_tags',
    db.Column('shortcut_id', db.String(36), db.ForeignKey('shortcut.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tags', methods=['GET'])
def get_tags():
    search_query = request.args.get('search', '').lower()
    tags_query = Tag.query.filter_by(user_id=current_user.id).all()

    if search_query:
        tags_query = tags_query.filter(Tag.name.ilike(f'%{search_query}%'))

    tags = tags_query.all()

    def get_tag_shortcut_count(tag):
        count = tag.shortcuts.count()
        for child in tag.children:
            count += get_tag_shortcut_count(child)
        return count

    def build_tag_tree(parent_id=None):
        tag_nodes = [tag for tag in tags if tag.parent_id == parent_id]
        result = []
        for tag in tag_nodes:
            tag_count = get_tag_shortcut_count(tag)
            tag_dict = {
                'id': tag.id,
                'name': tag.name,
                'parent_id': tag.parent_id,
                'count': tag_count,
                'children': build_tag_tree(tag.id)
            }
            result.append(tag_dict)
        return result

    tags_tree = build_tag_tree()

    return jsonify(tags_tree), 200

@app.route('/api/shortcuts', methods=['GET'])
@login_required
def get_shortcuts():
    search_query = request.args.get('search', '').lower()
    sort_by = request.args.get('sort_by', 'date_added')
    filter_tags = request.args.getlist('tags')
    favorited_first = request.args.get('favorited_first', 'false').lower() == 'true'

    shortcuts_query = Shortcut.query

    if search_query:
        shortcuts_query = shortcuts_query.filter(
            (Shortcut.name.ilike(f'%{search_query}%')) |
            (Shortcut.short_description.ilike(f'%{search_query}%')) |
            (Shortcut.link.ilike(f'%{search_query}%'))
        )

    if filter_tags:
        selected_tags = Tag.query.filter(Tag.name.in_(filter_tags)).all()
        tag_ids = set()

        def get_all_descendant_tag_ids(tag):
            tag_ids.add(tag.id)
            for child in tag.children:
                get_all_descendant_tag_ids(child)

        for tag in selected_tags:
            get_all_descendant_tag_ids(tag)

        shortcuts_query = shortcuts_query.join(Shortcut.tags).filter(Tag.id.in_(tag_ids))

    if sort_by == 'alphabetical':
        shortcuts_query = shortcuts_query.order_by(Shortcut.name.asc())
    elif sort_by == 'date_updated':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_updated.desc())
    elif sort_by == 'score':
        shortcuts_query = shortcuts_query.order_by(Shortcut.score.desc())
    elif sort_by == 'date_added':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())
    else:
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())

    shortcuts = Shortcut.query.filter_by(user_id=current_user.id).all()

    if favorited_first:
        shortcuts.sort(key=lambda x: x.favorited, reverse=True)

    pinned = [s for s in shortcuts if s.pinned]
    not_pinned = [s for s in shortcuts if not s.pinned]
    shortcuts = pinned + not_pinned

    shortcuts_list = []
    for shortcut in shortcuts:
        shortcuts_list.append({
            'id': shortcut.id,
            'name': shortcut.name,
            'link': shortcut.link,
            'tags': [tag.name for tag in shortcut.tags],
            'emojis': shortcut.emojis,
            'color_from': shortcut.color_from,
            'color_to': shortcut.color_to,
            'short_description': shortcut.short_description,
            'pinned': shortcut.pinned,
            'favorited': shortcut.favorited,
            'score': shortcut.score,
            'date_added': shortcut.date_added.isoformat(),
            'date_updated': shortcut.date_updated.isoformat()
        })

    return jsonify(shortcuts_list), 200

@app.route('/api/shortcuts/<shortcut_id>', methods=['PUT'])
@login_required
def update_shortcut(shortcut_id):
    data = request.get_json()
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()

    if not shortcut:
        return {'message': 'Shortcut not found'}, 404

    for key in ['name', 'link', 'emojis', 'color_from', 'color_to', 'short_description', 'pinned', 'favorited', 'score']:
        if key in data:
            setattr(shortcut, key, data[key])

    if 'tags' in data:
        tags = process_tags(data['tags'])
        shortcut.tags = tags

    db.session.commit()

    return jsonify({'message': 'Shortcut updated successfully'}), 200

@app.route('/api/shortcuts/<shortcut_id>', methods=['DELETE'])
@login_required
def delete_shortcut(shortcut_id):
    # shortcut = Shortcut.query.get(shortcut_id)
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()
    
    if not shortcut:
        return {'message': 'Shortcut not found'}, 404

    db.session.delete(shortcut)
    db.session.commit()

    return {'message': 'Shortcut deleted'}, 200

@app.route('/api/shortcuts', methods=['POST'])
@login_required
def add_shortcut():
    data = request.get_json()
    required_fields = ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description']

    if not all(field in data and data[field] for field in required_fields):
        return {'message': 'Missing required fields or empty values'}, 400

    tags = process_tags(data['tags'])

    shortcut = Shortcut(
        id=str(uuid.uuid4()),
        name=data['name'],
        link=data['link'],
        emojis=data['emojis'],
        color_from=data['color_from'],
        color_to=data['color_to'],
        short_description=data['short_description'],
        pinned=data.get('pinned', False),
        favorited=data.get('favorited', False),
        score=float(data.get('score', 0.0)),
        user_id=current_user.id,
        tags=tags
    )

    db.session.add(shortcut)
    db.session.commit()

    return jsonify({'message': 'Shortcut added successfully'}), 201

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# def process_tags(tag_strings):
#     tags = []
#     for tag_string in tag_strings:
#         hierarchy = [t.strip() for t in tag_string.split('>') if t.strip()]
#         parent = None
#         for tag_name in hierarchy:
#             tag = Tag.query.filter_by(name=tag_name, parent=parent).first()
#             if not tag:
#                 tag = Tag(name=tag_name, parent=parent)
#                 db.session.add(tag)
#                 db.session.flush()
#             parent = tag
#         tags.append(parent)
#     return tags


def process_tags(tag_strings):
    tags = []
    for tag_string in tag_strings:
        hierarchy = [t.strip() for t in tag_string.split('>') if t.strip()]
        parent = None
        for tag_name in hierarchy:
            tag = Tag.query.filter_by(name=tag_name, parent=parent).first()
            if not tag:
                tag = Tag(name=tag_name, parent=parent)
                db.session.add(tag)
                db.session.flush()  # Flush to get the ID
            parent = tag
        tags.append(parent)
    return tags


@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, redirect, url_for, flash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from sqlalchemy import func
from datetime import datetime
import uuid
import os
import requests
from extensions import db
from io import BytesIO
from dotenv import load_dotenv
from flask_caching import Cache

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shortcuts.db'
app.config["CACHE_DEFAULT_TIMEOUT"] = 300 
app.secret_key = os.getenv('SECRET_KEY')
if not app.secret_key:
    raise ValueError("No SECRET_KEY set for Flask application")
db.init_app(app)

app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 86400  # Cache timeout in seconds (e.g., 1 day)
cache = Cache(app)

from models import User, Shortcut, Tag

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/get_favicon')
def get_favicon():
    domain = request.args.get('domain')
    theme = request.args.get('theme', 'light')
    cache_key = f"favicon_{domain}_{theme}"
    cached_favicon = cache.get(cache_key)
    if cached_favicon:
        cached_content, cached_mimetype = cached_favicon
        return send_file(BytesIO(cached_content), mimetype=cached_mimetype)
    favicon_paths_dark = [
        '/favicon-dark.svg',
        '/favicon-dark.ico',
        '/favicon-dark.png',
        '/favicons/favicon-dark.svg',
        '/favicons/favicon-dark.png',
        '/favicon.ico',
        '/s/desktop/ef2da63d/img/logos/favicon_96x96.png',
    ]
    favicon_paths_light = [
        '/favicon.svg',
        '/favicon.ico',
        '/favicon.png',
        '/favicons/favicon.svg',
        '/favicons/favicon.png',
        '/favicon.ico',
        '/s/desktop/ef2da63d/img/logos/favicon_96x96.png',
    ]
    paths = favicon_paths_dark + favicon_paths_light if theme == 'dark' else favicon_paths_light
    for path in paths:
        url = f"https://{domain}{path}"
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                cache.set(cache_key, (response.content, response.headers.get('Content-Type', 'image/x-icon')))
                return send_file(BytesIO(response.content), mimetype=response.headers.get('Content-Type', 'image/x-icon'))
          
        except requests.RequestException:
            continue
    #set cache as local asset 'static/default', 'favicon.png'
    with open(os.path.join('static', 'default', 'favicon.png'), 'rb') as f:
        cache.set(cache_key, (f.read(), 'image/png'))
    return send_from_directory('static/default', 'favicon.png')

@app.route('/api/tags', methods=['GET'])
@login_required
def get_tags():
    # Gather filters from request
    search_query = request.args.get('search', '').lower()
    filter_tags = request.args.getlist('tags')
    favorited_first = request.args.get('favorited_first', 'false').lower() == 'true'

    # Base query for shortcuts
    shortcuts_query = Shortcut.query.filter_by(user_id=current_user.id)

    if search_query:
        shortcuts_query = shortcuts_query.filter(
            (Shortcut.name.ilike(f'%{search_query}%')) |
            (Shortcut.link.ilike(f'%{search_query}%')) |
            (Shortcut.short_description.ilike(f'%{search_query}%'))
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

    # Get IDs of filtered shortcuts
    filtered_shortcut_ids = [shortcut.id for shortcut in shortcuts_query.all()]

    # Query tags with counts based on filtered shortcuts
    tag_counts = db.session.query(
        Tag.id, Tag.name, Tag.parent_id, func.count(Shortcut.id)
    ).join(shortcut_tag).join(Shortcut).filter(
        Shortcut.id.in_(filtered_shortcut_ids)
    ).group_by(Tag.id).all()

    # Build tag hierarchy with counts
    tags_dict = {}
    for tag_id, tag_name, parent_id, count in tag_counts:
        tags_dict[tag_id] = {
            'id': tag_id,
            'name': tag_name,
            'parent_id': parent_id,
            'count': count,
            'children': []
        }

    # Organize tags into a tree
    for tag in tags_dict.values():
        parent_id = tag['parent_id']
        if parent_id and parent_id in tags_dict:
            tags_dict[parent_id]['children'].append(tag)

    root_tags = [tag for tag in tags_dict.values() if not tag['parent_id'] or tag['parent_id'] not in tags_dict]

    return jsonify(root_tags), 200

@app.route('/api/shortcuts', methods=['GET'])
@login_required
def get_shortcuts():
    search_query = request.args.get('search', '').lower()
    sort_by = request.args.get('sort_by', 'date_added')
    filter_tags = request.args.getlist('tags')
    favorited_first = request.args.get('favorited_first', 'false').lower() == 'true'

    shortcuts_query = Shortcut.query.filter_by(user_id=current_user.id)

    if search_query:
        shortcuts_query = shortcuts_query.filter(
            (Shortcut.name.ilike(f'%{search_query}%')) |
            (Shortcut.link.ilike(f'%{search_query}%')) |
            (Shortcut.short_description.ilike(f'%{search_query}%'))
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

    if favorited_first:
        shortcuts_query = shortcuts_query.order_by(Shortcut.favorited.desc())

    if sort_by == 'alphabetical':
        shortcuts_query = shortcuts_query.order_by(Shortcut.name)
    elif sort_by == 'date_updated':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_updated.desc())
    elif sort_by == 'score':
        shortcuts_query = shortcuts_query.order_by(Shortcut.score.desc())
    elif sort_by == 'date_added':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())
    else:
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())

    shortcuts = shortcuts_query.all()

    pinned = [s for s in shortcuts if s.pinned]
    not_pinned = [s for s in shortcuts if not s.pinned]
    shortcuts = pinned + not_pinned

    shortcuts_list = []
    for shortcut in shortcuts:
        shortcut_dict = {
            'id': shortcut.id,
            'name': shortcut.name,
            'link': shortcut.link,
            'emojis': shortcut.emojis,
            'color_from': shortcut.color_from,
            'color_to': shortcut.color_to,
            'short_description': shortcut.short_description,
            'pinned': shortcut.pinned,
            'favorited': shortcut.favorited,
            'score': shortcut.score,
            'tags': [tag.name for tag in shortcut.tags],
            'date_added': shortcut.date_added.isoformat() if shortcut.date_added else None,
            'date_updated': shortcut.date_updated.isoformat() if shortcut.date_updated else None
        }
        shortcuts_list.append(shortcut_dict)

    return jsonify(shortcuts_list), 200

@app.route('/api/shortcuts/<shortcut_id>', methods=['PUT'])
@login_required
def update_shortcut(shortcut_id):
    data = request.get_json()
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()

    if not shortcut:
        return jsonify({'message': 'Shortcut not found.'}), 404

    for key in ['name', 'link', 'emojis', 'color_from', 'color_to', 'short_description', 'pinned', 'favorited', 'score']:
        if key in data:
            setattr(shortcut, key, data[key])

    if 'tags' in data:
        tags = process_tags(data['tags'])
        shortcut.tags = tags

    shortcut.date_updated = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Shortcut updated successfully.'}), 200

@app.route('/api/shortcuts/<shortcut_id>', methods=['DELETE'])
@login_required
def delete_shortcut(shortcut_id):
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()

    if not shortcut:
        return jsonify({'message': 'Shortcut not found.'}), 404

    db.session.delete(shortcut)
    db.session.commit()

    return jsonify({'message': 'Shortcut deleted successfully.'}), 200

@app.route('/api/shortcuts', methods=['POST'])
@login_required
def add_shortcut():
    data = request.get_json()
    required_fields = ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description']

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

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
        tags=tags,
        date_added=datetime.utcnow(),
        date_updated=datetime.utcnow()
    )

    db.session.add(shortcut)
    db.session.commit()

    return jsonify({'message': 'Shortcut added successfully.'}), 201

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
                db.session.flush()
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
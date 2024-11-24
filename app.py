from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shortcuts.db'
db = SQLAlchemy(app)

class Shortcut(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    link = db.Column(db.String(500), nullable=False)
    tags = db.Column(db.String(500), nullable=False)
    emojis = db.Column(db.String(100), nullable=True)
    color_from = db.Column(db.String(20), nullable=False)
    color_to = db.Column(db.String(20), nullable=False)
    short_description = db.Column(db.String(500), nullable=True)
    pinned = db.Column(db.Boolean, default=False)
    favorited = db.Column(db.Boolean, default=False)
    score = db.Column(db.Float, default=0.0)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    date_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tags', methods=['GET'])
def get_tags():
    search_query = request.args.get('search', '').lower()
    tags = {}
    shortcuts = Shortcut.query.all()
    for shortcut in shortcuts:
        for tag in [t.strip() for t in shortcut.tags.split(',')]:
            if search_query in tag.lower():
                tags[tag] = tags.get(tag, 0) + 1
    tags_list = [{'name': k, 'count': v} for k, v in tags.items()]
    tags_list.sort(key=lambda x: x['count'], reverse=True)
    return jsonify(tags_list), 200

@app.route('/api/shortcuts', methods=['GET'])
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
            (Shortcut.link.ilike(f'%{search_query}%')) |
            (Shortcut.tags.ilike(f'%{search_query}%'))
        )

    if filter_tags:
        for tag in filter_tags:
            shortcuts_query = shortcuts_query.filter(Shortcut.tags.ilike(f'%{tag}%'))
    if sort_by == 'alphabetical':
        shortcuts_query = shortcuts_query.order_by(Shortcut.name.asc())
    elif sort_by == 'date_updated':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_updated.desc())
    elif sort_by == 'score':
        shortcuts_query = shortcuts_query.order_by(Shortcut.score.desc())
    elif sort_by == 'date_added':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())
    else:
        # Default sorting
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())


    shortcuts = shortcuts_query.all()

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
            'tags': [tag.strip() for tag in shortcut.tags.split(',') if tag.strip()],
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
def update_shortcut(shortcut_id):
    data = request.get_json()
    shortcut = Shortcut.query.get(shortcut_id)

    if not shortcut:
        return {'message': 'Shortcut not found'}, 404

    for key in ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description', 'pinned', 'favorited', 'score']:
        if key in data:
            if key == 'tags':
                setattr(shortcut, key, ','.join(data[key]))
            else:
                setattr(shortcut, key, data[key])

    db.session.commit()

    return jsonify({'message': 'Shortcut updated successfully'}), 200

@app.route('/api/shortcuts/<shortcut_id>', methods=['DELETE'])
def delete_shortcut(shortcut_id):
    shortcut = Shortcut.query.get(shortcut_id)

    if not shortcut:
        return {'message': 'Shortcut not found'}, 404

    db.session.delete(shortcut)
    db.session.commit()

    return {'message': 'Shortcut deleted'}, 200


@app.route('/api/shortcuts', methods=['POST'])
def add_shortcut():
    data = request.get_json()
    required_fields = ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description']

    if not all(field in data and data[field] for field in required_fields):
        return {'message': 'Missing required fields or empty values'}, 400

    shortcut = Shortcut(
        id=str(uuid.uuid4()),
        name=data['name'],
        link=data['link'],
        tags=','.join(data['tags']),
        emojis=data['emojis'],
        color_from=data['color_from'],
        color_to=data['color_to'],
        short_description=data['short_description'],
        pinned=data.get('pinned', False),
        favorited=data.get('favorited', False),
        score=float(data.get('score', 0.0))
    )

    db.session.add(shortcut)
    db.session.commit()

    return jsonify({'message': 'Shortcut added successfully'}), 201


@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory('static', filename, cache_timeout=31536000)  # Cache for 1 year

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
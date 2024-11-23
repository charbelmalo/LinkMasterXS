from flask import Flask, render_template, request, jsonify
import json
import uuid
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SHORTCUTS_FILE = 'shortcuts.json'

def load_shortcuts():
    try:
        with open(SHORTCUTS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_shortcuts(shortcuts):
    with open(SHORTCUTS_FILE, 'w') as f:
        json.dump(shortcuts, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/shortcuts', methods=['GET'])
def get_shortcuts():
    shortcuts = load_shortcuts()

    # Get query parameters
    search_query = request.args.get('search', '').lower()
    sort_by = request.args.get('sort_by', 'date_added')
    filter_tags = request.args.getlist('tags')
    favorited_first = request.args.get('favorited_first', 'false').lower() == 'true'

    # Filter by search query
    if search_query:
        shortcuts = [s for s in shortcuts if search_query in s['name'].lower() or search_query in s['short_description'].lower()]

    # Filter by tags
    if filter_tags:
        def has_tags(shortcut):
            return any(tag in shortcut['tags'] for tag in filter_tags)
        shortcuts = [s for s in shortcuts if has_tags(s)]

    # Sort shortcuts
    if sort_by == 'alphabetical':
        shortcuts.sort(key=lambda x: x['name'].lower())
    elif sort_by == 'recently_updated':
        shortcuts.sort(key=lambda x: x.get('date_updated', x['date_added']), reverse=True)
    elif sort_by == 'score':
        shortcuts.sort(key=lambda x: x.get('score', 0), reverse=True)
    else:  # Default: recently created
        shortcuts.sort(key=lambda x: x['date_added'], reverse=True)

    # Pinned links always on top
    pinned = [s for s in shortcuts if s.get('pinned', False)]
    not_pinned = [s for s in shortcuts if not s.get('pinned', False)]
    shortcuts = pinned + not_pinned

    # Favorited links at the top if toggled
    if favorited_first:
        favorited = [s for s in shortcuts if s.get('favorited', False)]
        not_favorited = [s for s in shortcuts if not s.get('favorited', False)]
        shortcuts = favorited + not_favorited

    return jsonify(shortcuts), 200

@app.route('/api/shortcuts', methods=['POST'])
def add_shortcut():
    data = request.get_json()
    required_fields = ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description']

    if not all(field in data and data[field] for field in required_fields):
        return {'message': 'Missing required fields or empty values'}, 400

    shortcut = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'link': data['link'],
        'tags': data['tags'],
        'emojis': data['emojis'],
        'color_from': data['color_from'],
        'color_to': data['color_to'],
        'short_description': data['short_description'],
        'pinned': data.get('pinned', False),
        'favorited': data.get('favorited', False),
        'score': data.get('score', 0.0),
        'date_added': datetime.utcnow().isoformat(),
        'date_updated': datetime.utcnow().isoformat()
    }

    shortcuts = load_shortcuts()
    shortcuts.append(shortcut)
    save_shortcuts(shortcuts)

    return jsonify(shortcut), 201

@app.route('/api/shortcuts/<shortcut_id>', methods=['PUT'])
def update_shortcut(shortcut_id):
    data = request.get_json()
    shortcuts = load_shortcuts()
    updated = False

    for shortcut in shortcuts:
        if shortcut['id'] == shortcut_id:
            # Update fields
            for key in ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description', 'pinned', 'favorited', 'score']:
                if key in data:
                    shortcut[key] = data[key]
            shortcut['date_updated'] = datetime.utcnow().isoformat()
            updated = True
            break

    if updated:
        save_shortcuts(shortcuts)
        return jsonify(shortcut), 200
    else:
        return {'message': 'Shortcut not found'}, 404

@app.route('/api/shortcuts/<shortcut_id>', methods=['DELETE'])
def delete_shortcut(shortcut_id):
    shortcuts = load_shortcuts()
    new_shortcuts = [s for s in shortcuts if s['id'] != shortcut_id]
    if len(shortcuts) == len(new_shortcuts):
        return {'message': 'Shortcut not found'}, 404
    save_shortcuts(new_shortcuts)
    return {'message': 'Shortcut deleted'}, 200

if __name__ == '__main__':
    app.run(debug=True)
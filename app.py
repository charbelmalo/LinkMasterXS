from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, redirect, url_for, flash, session
from flask_session import Session 
# frop
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
from urllib.parse import urlparse
from bs4 import BeautifulSoup

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

from models import User, Shortcut, Tag, shortcut_tag

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# @app.context_processor
# def inject_csrf_token():
#     from flask_wtf.csrf import generate_csrf
#     return dict(csrf_token=generate_csrf())
# app.py

@app.route('/')
@login_required
def index():
    domains = get_domains().get_json()
    theme = session.get('theme', 'light')
    return render_template('index.html', domains=domains, theme=theme)


@app.route('/set_theme', methods=['POST'])
def set_theme():
    data = request.get_json()
    theme = data.get('theme')

    if theme not in ['dark', 'light']:
        return jsonify({'error': 'Invalid theme preference'}), 400

    # Store the theme in the session
    session['theme'] = theme

    # Optionally, you can store it in a database or a file

    return jsonify({'theme': theme}), 200


@app.route('/get_favicon')
def get_favicon():
    domain = request.args.get('domain')
    theme = request.args.get('theme', session.get('theme', 'light'))
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
            if response.status_code == 200 and 'image' in response.headers.get('Content-Type', ''):
                cache.set(cache_key, (response.content, response.headers.get('Content-Type')))
                return send_file(BytesIO(response.content), mimetype=response.headers.get('Content-Type'))
        except requests.RequestException:
            continue
    # domain = request.args.get('domain')
    cache_key = f"favicon_{domain}"
    cached_favicon = cache.get(cache_key)
    if cached_favicon:
        cached_content, cached_mimetype = cached_favicon
        return send_file(BytesIO(cached_content), mimetype=cached_mimetype)

    try:
        response = requests.get(f"https://{domain}", timeout=2)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            icon_links = soup.find_all('link', rel=lambda x: x and 'icon' in x.lower())

            for link in icon_links:
                href = link.get('href')
                if href:
                    if href.startswith('//'):
                        icon_url = 'https:' + href
                    elif href.startswith('http'):
                        icon_url = href
                    else:
                        icon_url = f'https://{domain}/{href.lstrip("/")}'
                    try:
                        icon_response = requests.get(icon_url, timeout=2)
                        if icon_response.status_code == 200:
                            content_type = icon_response.headers.get('Content-Type', 'image/x-icon')
                            cache.set(cache_key, (icon_response.content, content_type))
                            return send_file(BytesIO(icon_response.content), mimetype=content_type)
                    except requests.RequestException:
                        continue
    except requests.RequestException:
        pass

    # Fallback to default favicon
    with open(os.path.join('static', 'default', 'favicon.png'), 'rb') as f:
        content = f.read()
        cache.set(cache_key, (content, 'image/png'))
        return send_file(BytesIO(content), mimetype='image/png')



# @app.route('/get_favicon')
# def get_favicon():
#     domain = request.args.get('domain')
#     cache_key = f"favicon_{domain}"
#     cached_favicon = cache.get(cache_key)
#     if cached_favicon:
#         cached_content, cached_mimetype = cached_favicon
#         return send_file(BytesIO(cached_content), mimetype=cached_mimetype)

#     try:
#         response = requests.get(f"https://{domain}", timeout=2)
#         if response.status_code == 200:
#             soup = BeautifulSoup(response.content, 'html.parser')
#             icon_links = soup.find_all('link', rel=lambda x: x and 'icon' in x.lower())

#             for link in icon_links:
#                 href = link.get('href')
#                 if href:
#                     if href.startswith('//'):
#                         icon_url = 'https:' + href
#                     elif href.startswith('http'):
#                         icon_url = href
#                     else:
#                         icon_url = f'https://{domain}/{href.lstrip("/")}'
#                     try:
#                         icon_response = requests.get(icon_url, timeout=2)
#                         if icon_response.status_code == 200:
#                             content_type = icon_response.headers.get('Content-Type', 'image/x-icon')
#                             cache.set(cache_key, (icon_response.content, content_type))
#                             return send_file(BytesIO(icon_response.content), mimetype=content_type)
#                     except requests.RequestException:
#                         continue
#     except requests.RequestException:
#         pass

#     # Fallback to default favicon
#     with open(os.path.join('static', 'default', 'favicon.png'), 'rb') as f:
#         content = f.read()
#         cache.set(cache_key, (content, 'image/png'))
#         return send_file(BytesIO(content), mimetype='image/png')
    

@app.route('/api/tags', methods=['GET'])
@login_required
def get_tags():
    def build_tag_tree(parent_id=None):
        tags = Tag.query.filter_by(parent_id=parent_id).all()
        tags_data = []
        for tag in tags:
            count = get_tag_shortcut_count(tag)
            tags_data.append({
                'id': tag.id,
                'name': tag.name,
                'count': get_tag_shortcut_count(tag),
                'children': build_tag_tree(tag.id)
            })
        return tags_data

    tag_tree = build_tag_tree()
    return jsonify(tag_tree)

def get_tag_shortcut_count(tag):
    # Get all descendant tag IDs
    def get_descendant_ids(tag):
        ids = [tag.id]
        for child in tag.children:
            ids.extend(get_descendant_ids(child))
        return ids

    tag_ids = get_descendant_ids(tag)
    count = Shortcut.query.join(Shortcut.tags).filter(
        Shortcut.user_id == current_user.id,
        Tag.id.in_(tag_ids)
    ).count()
    return count


def get_descendant_tag_ids(tag):
    ids = [tag.id]
    for child in tag.children:
        ids.extend(get_descendant_tag_ids(child))
    return ids


@app.route('/api/shortcuts', methods=['GET'])
@login_required
def get_shortcuts():
    search_query = request.args.get('search', '').lower()
    sort_by = request.args.get('sort_by', 'date_added')
    filter_tag_ids = request.args.getlist('tags', type=int)
    domain_filter = request.args.get('domain', '').lower()
    favorited_first = request.args.get('favorited_first', 'false').lower() == 'true'

    # Start building the query
    shortcuts_query = Shortcut.query.filter(Shortcut.user_id == current_user.id)

    # Apply search filter
    if search_query:
        search_pattern = f"%{search_query}%"
        shortcuts_query = shortcuts_query.outerjoin(Shortcut.tags).filter(
            db.or_(
                func.lower(Shortcut.name).like(search_pattern),
                func.lower(Shortcut.link).like(search_pattern),
                func.lower(Shortcut.short_description).like(search_pattern),
                func.lower(Tag.name).like(search_pattern)
            )
        )

    # Apply domain filter
    if domain_filter:
        domain_pattern = f"%{domain_filter}%"
        shortcuts_query = shortcuts_query.filter(func.lower(Shortcut.link).like(domain_pattern))

    # Apply tag filters
    if filter_tag_ids:
        shortcuts_query = shortcuts_query.join(Shortcut.tags).filter(Tag.id.in_(filter_tag_ids))

    # Remove duplicates caused by joins
    shortcuts_query = shortcuts_query.distinct()

    # Apply sorting
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

    # Fetch the shortcuts
    shortcuts = shortcuts_query.all()

    # Handle pinned shortcuts
    pinned = [s for s in shortcuts if s.pinned]
    not_pinned = [s for s in shortcuts if not s.pinned]
    shortcuts = pinned + not_pinned

    # Optionally bring favorited items to the top
    if favorited_first:
        favorited = [s for s in shortcuts if s.favorited]
        not_favorited = [s for s in shortcuts if not s.favorited]
        shortcuts = favorited + not_favorited

    # Build the list to return
    shortcuts_list = [shortcut.to_dict() for shortcut in shortcuts]

    return jsonify(shortcuts_list)

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
    return tags  # Moved 'return tags' outside the loops to process all tags

@app.route('/api/domains', methods=['GET'])
@login_required
def get_domains():
    shortcuts = Shortcut.query.filter_by(user_id=current_user.id).all()
    domain_counts = {}
    for shortcut in shortcuts:
        parsed_url = urlparse(shortcut.link)
        domain = parsed_url.netloc
        if domain.startswith('www.'):
            domain = domain[4:]
        if domain in domain_counts:
            domain_counts[domain]['count'] += 1
            domain_counts[domain]['emojis'] += shortcut.emojis or ''
        else:
            domain_counts[domain] = {
                'count': 1,
                'emojis': shortcut.emojis or ''
            }
    domains = [{'domain': domain, 'count': data['count'], 'emojis': data['emojis']} for domain, data in domain_counts.items()]
    return jsonify(domains)
            
@app.route('/static/<path:filename>')            
def custom_static(filename):    
    return send_from_directory('static', filename)

if __name__ == '__main__':    
    with app.app_context():        
        db.create_all()
        # seed_database() 
        app.run(debug=True)
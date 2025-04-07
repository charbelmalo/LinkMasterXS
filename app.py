# app.py
from flask import Flask, request, send_file, session, make_response
from flask_session import Session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_caching import Cache
from extensions import db
import os
import requests
import logging
from io import BytesIO
from bs4 import BeautifulSoup
from sqlalchemy import func
from datetime import datetime
from dotenv import load_dotenv
from flask_caching import Cache
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import urllib.parse
load_dotenv()

# Create Flask application
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shortcuts.db'
app.config["CACHE_DEFAULT_TIMEOUT"] = 300 
app.secret_key = os.getenv('SECRET_KEY')
if not app.secret_key:
    raise ValueError("No SECRET_KEY set for Flask application")

db.init_app(app)
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 86400  # Cache timeout
cache = Cache(app)

favicon_dir = os.path.join('static', 'favicons')
if not os.path.exists(favicon_dir):
    os.makedirs(favicon_dir)
from models import User

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register Blueprints
from blueprints.main import main_bp
from blueprints.auth import auth_bp
# from blueprints.get_favicons import favicons_bp
from blueprints.api_shortcuts import shortcuts_bp
from blueprints.api_tags import tags_bp

app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(shortcuts_bp, url_prefix='/api')
# app.register_blueprint(favicons_bp, url_prefix='/favicons')
app.register_blueprint(tags_bp, url_prefix='/api')
from blueprints.api_stats import stats_bp
app.register_blueprint(stats_bp, url_prefix='/api')
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Define a directory for local caching of favicons
LOCAL_CACHE_DIR = 'static/default/favicons'

# Ensure the directory exists
if not os.path.exists(LOCAL_CACHE_DIR):
    os.makedirs(LOCAL_CACHE_DIR)

# For theme persistence, we will rely on session or user model updates
@app.route('/set_theme', methods=['POST'])
def set_theme():
    from flask import request, session, jsonify
    data = request.get_json()
    theme = data.get('theme')

    if theme not in ['dark', 'light']:
        return jsonify({'error': 'Invalid theme preference'}), 400

    session['theme'] = theme
    return jsonify({'theme': theme}), 200

@app.route('/favicons/get_favicon')
def get_favicon():
    domain = request.args.get('domain')
    theme = request.args.get('theme', session.get('theme', 'light'))
    cache_key = f"favicon_{domain}_{theme}"
    cached_favicon = cache.get(cache_key)

    # Check in-memory cache
    if cached_favicon:
        cached_content, cached_mimetype = cached_favicon
        return send_file(BytesIO(cached_content), mimetype=cached_mimetype)

    # Check local filesystem cache
    local_cache_file = os.path.join(LOCAL_CACHE_DIR, f"{secure_filename(cache_key)}.png")
    if os.path.exists(local_cache_file):
        with open(local_cache_file, 'rb') as f:
            content = f.read()
            return send_file(BytesIO(content), mimetype='image/png')

    # Fallback paths for favicons
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
        '/favicon.svg',
        '/images/favicon.ico',
        '/images/logo/favicon.ico',
        '/s/desktop/ef2da63d/img/logos/favicon_96x96.png',
    ]
    paths = favicon_paths_dark if theme == 'dark' else favicon_paths_light

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }

    # Try predefined paths
    for path in paths:
        url = f"https://{domain}{path}"
        try:
            response = requests.get(url, headers=headers, timeout=2, verify=True)
            content_type = response.headers.get('Content-Type', '')
            if response.status_code == 200 and content_type.startswith('image/'):
                # Cache in-memory
                cache.set(cache_key, (response.content, content_type))
                # Cache locally
                with open(local_cache_file, 'wb') as f:
                    f.write(response.content)
                return send_file(BytesIO(response.content), mimetype=content_type)
        except requests.RequestException as e:
            logging.debug(f"Failed to fetch favicon at {url}: {str(e)}")
            continue

    # If not found in predefined paths, parse HTML for icons
    try:
        response = requests.get(f"https://{domain}", headers=headers, timeout=2)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            icon_links = soup.find_all('link', rel=lambda x: x and ('icon' in x.lower() or 'apple-touch-icon' in x.lower()))
            logging.debug(f"Found potential favicon links: {[link['href'] for link in icon_links if link.has_attr('href')]}")

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
                        icon_response = requests.get(icon_url, headers=headers, timeout=2)
                        content_type = icon_response.headers.get('Content-Type', '')
                        if icon_response.status_code == 200 and content_type.startswith('image/'):
                            # Cache in-memory
                            cache.set(cache_key, (icon_response.content, content_type))
                            # Cache locally
                            with open(local_cache_file, 'wb') as f:
                                f.write(icon_response.content)
                            return send_file(BytesIO(icon_response.content), mimetype=content_type)
                    except requests.RequestException as e:
                        logging.debug(f"Failed to fetch favicon from {icon_url}: {str(e)}")
                        continue
    except requests.RequestException as e:
        logging.debug(f"Failed to fetch main page for domain {domain}: {str(e)}")

    # Fallback to Google S2 API
    try:
        favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=32"
        response = requests.get(favicon_url, timeout=2)
        if response.status_code == 200:
            content = response.content
            # Cache in-memory
            cache.set(cache_key, (content, 'image/png'))
            # Cache locally
            with open(local_cache_file, 'wb') as f:
                f.write(content)
            return send_file(BytesIO(content), mimetype='image/png')
    except requests.RequestException as e:
        logging.error(f"Error fetching favicon for {domain}: {str(e)}")

    # Fallback to default favicon
    fallback_path = os.path.join('static', 'default', 'favicon.png')
    with open(fallback_path, 'rb') as f:
        content = f.read()
        # Cache in-memory
        cache.set(cache_key, (content, 'image/png'))
        # Cache locally
        with open(local_cache_file, 'wb') as f:
            f.write(content)
        return send_file(BytesIO(content), mimetype='image/png')
    with open(os.path.join('static', 'default', 'favicon.png'), 'rb') as f:
        content = f.read() 
        cache.set(cache_key, (content, 'image/png')) 
        return send_file(BytesIO(content), mimetype='image/png')
   

with app.app_context():
    db.create_all()
    # Check if at least one user exists. If not, seed the database.
    user_count = User.query.count()
    if user_count == 0:
        from seeder import seed_database
        seed_database()
        
if __name__ == '__main__':
    app.run(debug=True)


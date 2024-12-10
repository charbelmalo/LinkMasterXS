# blueprints/get_favicons.py
from flask import Blueprint, request, jsonify, send_file, session, current_app, send_from_directory
import os
import requests
from io import BytesIO
from bs4 import BeautifulSoup
from flask_cors import CORS
from sqlalchemy import func
from datetime import datetime
from dotenv import load_dotenv
from flask_caching import Cache


favicons_bp = Blueprint('favicons', __name__)

CORS(favicons_bp)


@favicons_bp.route('/get_favicon', methods=['GET'])
def get_favicon():
    cache = Cache(current_app)  # Access cache from current_app
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

    # If not found via predefined paths, try parsing the HTML page
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
                        if icon_response.status_code == 200 and 'image' in icon_response.headers.get('Content-Type',''):
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

    
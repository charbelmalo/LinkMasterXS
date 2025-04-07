# blueprints/api_shortcuts.py
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Shortcut, Tag, db
from sqlalchemy import func
from datetime import datetime
from .utils import process_tags  # Create a utils.py for shared functions if needed
import logging
import requests
import urllib.parse

from bs4 import BeautifulSoup

shortcuts_bp = Blueprint('shortcuts', __name__)

@shortcuts_bp.route('/shortcuts', methods=['GET'])
@login_required
def get_shortcuts():
    search_query = request.args.get('search', '').lower()
    sort_by = request.args.get('sort_by', 'date_added')
    filter_tag_ids = request.args.getlist('tags', type=int)
    domain_filters = [d.lower() for d in request.args.getlist('domain') if d]
    favorited_first = request.args.get('favorited_only', 'false').lower() == 'true'
    pinned_only = request.args.get('pinned_only', 'false').lower() == 'true'

    shortcuts_query = Shortcut.query.filter(Shortcut.user_id == current_user.id)

    if search_query:
        from sqlalchemy import func
        search_pattern = f"%{search_query}%"
        shortcuts_query = shortcuts_query.outerjoin(Shortcut.tags).filter(
            db.or_(
                func.lower(Shortcut.name).like(search_pattern),
                func.lower(Shortcut.link).like(search_pattern),
                func.lower(Tag.name).like(search_pattern)
            )
        )

    if domain_filters:
        from sqlalchemy import func
        conditions = []
        for domain in domain_filters:
            domain_pattern = f"%{domain}%"
            conditions.append(func.lower(Shortcut.link).like(domain_pattern))
        shortcuts_query = shortcuts_query.filter(db.or_(*conditions))

    if filter_tag_ids:
        shortcuts_query = shortcuts_query.join(Shortcut.tags).filter(Tag.id.in_(filter_tag_ids))

    # Apply filtering if requested
    if favorited_first:
        # shortcuts_query = shortcuts_query.filter(Shortcut.favorited == True)
        shortcuts_query = shortcuts_query.order_by(Shortcut.favorited.desc())
    if pinned_only:
        # shortcuts_query = shortcuts_query.filter(Shortcut.pinned == True)
        shortcuts_query = shortcuts_query.order_by(Shortcut.pinned.desc())

    # Distinct to avoid duplicates
    shortcuts_query = shortcuts_query.distinct()

    # Sorting
    if sort_by == 'alphabetical':
        shortcuts_query = shortcuts_query.order_by(Shortcut.name)
    elif sort_by == 'date_updated':
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_updated.desc())
    elif sort_by == 'score':
        shortcuts_query = shortcuts_query.order_by(Shortcut.score.desc())
    else:
        shortcuts_query = shortcuts_query.order_by(Shortcut.date_added.desc())

    shortcuts = shortcuts_query.all()

    # No re-ordering needed if we are strictly filtering. If we just wanted to reorder by favorites/pinned
    # without filtering, we would handle that differently. Since user complains about "not filtering",
    # we assume we must actually filter. So we skip the previous pinned/favorited reorder logic.

    return jsonify([s.to_dict() for s in shortcuts])

@shortcuts_bp.route('/shortcuts/<shortcut_id>', methods=['PUT'])
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

@shortcuts_bp.route('/shortcuts/<shortcut_id>', methods=['DELETE'])
@login_required
def delete_shortcut(shortcut_id):
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()

    if not shortcut:
        return jsonify({'message': 'Shortcut not found.'}), 404

    db.session.delete(shortcut)
    db.session.commit()

    return jsonify({'message': 'Shortcut deleted successfully.'}), 200

@shortcuts_bp.route('/shortcuts', methods=['POST'])
@login_required
def add_shortcut():
    data = request.get_json()
    required_fields = ['name', 'link', 'tags', 'emojis', 'color_from', 'color_to', 'short_description']

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    tags = process_tags(data['tags'])
    from uuid import uuid4
    shortcut = Shortcut(
        id=str(uuid4()),
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

    return jsonify({'message': 'Shortcut added successfully.'}), 201

@shortcuts_bp.route('/shortcuts/<shortcut_id>/click', methods=['POST'])
@login_required
def increment_click(shortcut_id):
    shortcut = Shortcut.query.filter_by(id=shortcut_id, user_id=current_user.id).first()
    if not shortcut:
        return jsonify({'error': 'Not found'}), 404
    shortcut.click_count = (shortcut.click_count or 0) + 1
    db.session.commit()
    return jsonify({'message': 'Click count incremented', 'click_count': shortcut.click_count}), 200

 
from PIL import Image
from colorthief import ColorThief
import tempfile

@shortcuts_bp.route('/autofill', methods=['GET'])
@login_required
def autofill():
    link = request.args.get('url')
    if not link or not (link.startswith('http://') or link.startswith('https://')):
        return jsonify({"error": "Invalid URL"}), 400

    try:
        # Fetch page
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(link, headers=headers, timeout=3)
        if r.status_code != 200:
            return jsonify({"error": "Cannot access URL"}), 400

        # Parse for metadata
        soup = BeautifulSoup(r.text, 'html.parser')
        # Try to get title
        title = soup.title.string.strip() if soup.title else 'Untitled'
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        short_description = meta_desc['content'].strip() if meta_desc and meta_desc.has_attr('content') else ""

        # Try favicon
        domain = urllib.parse.urlparse(link).hostname
        # Get favicon from our existing route
        favicon_url = f"http://localhost:5000/favicons/get_favicon?domain={domain}&theme=light"
        fav_r = requests.get(favicon_url, timeout=3)
        if fav_r.status_code == 200:
            # Extract dominant colors
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                tmp.write(fav_r.content)
                tmp.flush()
                color_thief = ColorThief(tmp.name)
                # Get dominant palette
                palette = color_thief.get_palette(color_count=2)
                # Convert to hex
                def rgb_to_hex(rgb):
                    return '#%02x%02x%02x' % rgb
                if len(palette) < 2:
                    # Just duplicate the same color if we can't find two distinct
                    palette.append(palette[0])
                color_from_hex = rgb_to_hex(palette[0])
                color_to_hex = rgb_to_hex(palette[1])
        else:
            # Default colors
            color_from_hex = "#ffffff"
            color_to_hex = "#ffffff"

        data = {
            "name": title,
            "emoji": "📟",
            "colorFrom": color_from_hex,
            "colorTo": color_to_hex,
            "short_description": short_description
        }
        return jsonify(data), 200

    except Exception as e:
        logging.error(f"Autofill error: {e}")
        return jsonify({"error": "Failed to autofill"}), 500

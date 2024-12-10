# blueprints/main.py
from flask import Blueprint, render_template, session
from flask_login import login_required, current_user
from models import Shortcut
from urllib.parse import urlparse
from datetime import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@login_required
def index():
    from models import User
    # Calculate user initials and hue
    username = current_user.username
    initials = ''.join([name[0].upper() for name in username.split(' ')[:2]])
    total = sum(ord(c) for c in username)
    hue = total % 360

    theme = session.get('theme', 'light')

    # We'll fetch domains as before, but now we do it in a helper function or inline
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
    domains = [{'domain': d, 'count': data['count'], 'emojis': data['emojis']} for d, data in domain_counts.items()]

    return render_template(
        'index.html',
        domains=domains,
        theme=theme,
        username=username,
        initials=initials,
        hue=hue
    )
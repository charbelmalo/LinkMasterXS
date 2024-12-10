from flask import Blueprint, jsonify
from flask_login import current_user, login_required
from models import Shortcut, db

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    # Calculate total clicks for current_user:
    total_clicks = db.session.query(db.func.sum(Shortcut.click_count)).filter(Shortcut.user_id == current_user.id).scalar()
    if total_clicks is None:
        total_clicks = 0
    return jsonify({"total_clicks": total_clicks})

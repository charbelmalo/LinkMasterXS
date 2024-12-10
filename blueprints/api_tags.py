# blueprints/api_tags.py
from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from models import Tag, Shortcut

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('/tags', methods=['GET'])
@login_required
def get_tags():
    def build_tag_tree(parent_id=None):
        tags = Tag.query.filter_by(parent_id=parent_id).all()
        
        tags = sorted(tags, key=lambda x: get_tag_shortcut_count(x), reverse=True)
        tags_data = []
        for tag in tags:
            count = get_tag_shortcut_count(tag)
            tags_data.append({
                'id': tag.id,
                'name': tag.name,
                'count': count,
                'children': build_tag_tree(tag.id)
            })
        return tags_data

    tag_tree = build_tag_tree()
    return jsonify(tag_tree)

def get_tag_shortcut_count(tag):
    def get_descendant_ids(t):
        ids = [t.id]
        for child in t.children:
            ids.extend(get_descendant_ids(child))
        return ids
    tag_ids = get_descendant_ids(tag)
    count = Shortcut.query.join(Shortcut.tags).filter(
        Shortcut.user_id == current_user.id,
        Tag.id.in_(tag_ids)
    ).count()
    return count
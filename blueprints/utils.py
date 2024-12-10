# blueprints/utils.py
from models import Tag, db

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
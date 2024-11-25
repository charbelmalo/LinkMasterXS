import json
from app import db, Shortcut, Tag
from sqlalchemy.orm import joinedload

def export_shortcuts_to_json(filename='shortcuts_export.json'):
    # Query all shortcuts with their associated tags
    shortcuts = Shortcut.query.options(joinedload(Shortcut.tags)).all()
    
    # Prepare data for JSON serialization
    data = []
    for shortcut in shortcuts:
        shortcut_data = {
            'id': shortcut.id,
            'name': shortcut.name,
            'link': shortcut.link,
            'emojis': shortcut.emojis,
            'color_from': shortcut.color_from,
            'color_to': shortcut.color_to,
            'short_description': shortcut.short_description,
            'pinned': shortcut.pinned,
            'favorited': shortcut.favorited,
            'score': shortcut.score,
            'date_added': shortcut.date_added.isoformat(),
            'date_updated': shortcut.date_updated.isoformat(),
            'tags': [tag.name for tag in shortcut.tags]
        }
        data.append(shortcut_data)
    
    # Write data to JSON file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f'Data successfully exported to {filename}')

if __name__ == '__main__':
    from app import app
    with app.app_context():
        export_shortcuts_to_json()
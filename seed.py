from app import db, Shortcut, Tag, process_tags
import uuid
import datetime

def seed_database():
    # Original Sample Data
    shortcuts_data = [
        {
            'name': 'Google',
            'link': 'https://www.google.com',
            'tags': ['Search Engine', 'Tech > Internet'],
            'emojis': '🔍',
            'color_from': 'rgba(66, 133, 244, 1)',
            'color_to': 'rgba(219, 68, 55, 1)',
            'short_description': "The world's most popular search engine.",
            'pinned': False,
            'favorited': True,
            'score': 9.5,
            'date_added': datetime.datetime.utcnow(),
            'date_updated': datetime.datetime.utcnow()
        },
        {
            'name': 'GitHub',
            'link': 'https://github.com',
            'tags': ['Development > Code Hosting', 'Tech'],
            'emojis': '🐙',
            'color_from': 'rgba(36, 41, 46, 1)',
            'color_to': 'rgba(22, 27, 34, 1)',
            'short_description': 'Where the world builds software.',
            'pinned': True,
            'favorited': False,
            'score': 9.0,
            'date_added': datetime.datetime.utcnow(),
            'date_updated': datetime.datetime.utcnow()
        },
        {
            'name': 'Stack Overflow',
            'link': 'https://stackoverflow.com',
            'tags': ['Development > Q&A', 'Community'],
            'emojis': '🖥️',
            'color_from': 'rgba(244, 128, 36, 1)',
            'color_to': 'rgba(244, 159, 10, 1)',
            'short_description': 'A public platform for developers to learn and share knowledge.',
            'pinned': False,
            'favorited': True,
            'score': 8.8,
            'date_added': datetime.datetime.utcnow(),
            'date_updated': datetime.datetime.utcnow()
        },
        # Additional Items Provided by User
        {
            "id": "d6ebff0a-25b2-44c9-8898-aab122c1a4f9",
            "name": "xVault Toolkit - chat",
            "link": "https://chatgpt.com/share/6742cb4f-3404-8000-9ca4-d42c0acae0ed",
            "emojis": "👨🏻‍💻✍🏼",
            "color_from": "rgba(148, 71, 195, 1)",
            "color_to": "rgba(74, 28, 120, 1)",
            "short_description": "Has all dependencies information + improvement plan",
            "pinned": False,
            "favorited": True,
            "score": 8.2,
            "date_added": "2024-11-24T06:47:14.926698",
            "date_updated": "2024-11-24T06:47:14.926761",
            "tags": []
        },
        {
            "id": "ffda249b-3057-4129-a3d3-346433146a98",
            "name": "4k Image Generator",
            "link": "https://huggingface.co/spaces/charbel-malo/UltraPixel-demo",
            "emojis": "🌝🦋",
            "color_from": "rgba(251, 210, 31, 1)",
            "color_to": "rgba(252, 161, 3, 1)",
            "short_description": "UltraPixel Space - Needs GPU hardware switch",
            "pinned": False,
            "favorited": False,
            "score": 9.2,
            "date_added": "2024-11-24T07:07:20.366501",
            "date_updated": "2024-11-24T07:07:20.366560",
            "tags": []
        },
        {
            "id": "93aa19de-1a1b-4c67-bbb3-bdceeb4ebe02",
            "name": "Test",
            "link": "https://www.example.com",
            "emojis": "😎",
            "color_from": "rgba(255, 0, 0, 1)",
            "color_to": "rgba(0, 0, 0, 1)",
            "short_description": "asdda",
            "pinned": False,
            "favorited": True,
            "score": 3.0,
            "date_added": "2024-11-22T20:58:50.150567",
            "date_updated": "2024-11-22T20:58:50.150591",
            "tags": []
        },
        {
            "id": "71e4b458-f41f-4575-a7f7-c3afc3674467",
            "name": "GPT Links",
            "link": "https://chat.openai",
            "emojis": "😎😎",
            "color_from": "rgba(54, 98, 231, 1)",
            "color_to": "rgba(118, 140, 249, 1)",
            "short_description": "sadad",
            "pinned": False,
            "favorited": False,
            "score": 9.6,
            "date_added": "2024-11-22T20:59:48.141141",
            "date_updated": "2024-11-22T20:59:48.141168",
            "tags": []
        },
        {
            "id": "2c4056ae-9fd2-4c14-a900-85ac29e775f9",
            "name": "WEM Guidelines",
            "link": "https://example.com",
            "emojis": "🌈",
            "color_from": "rgba(102, 133, 204, 1)",
            "color_to": "rgba(32, 151, 46, 1)",
            "short_description": "Lorem",
            "pinned": False,
            "favorited": False,
            "score": 6.2,
            "date_added": "2024-11-22T23:17:54.152845",
            "date_updated": "2024-11-22T23:17:54.152870",
            "tags": []
        },
        {
            "id": "aafae719-9bdf-4c9d-ab1a-865cb220a99d",
            "name": "Realtime FLUX + Enhancer",
            "link": "https://huggingface.co/spaces/KingNish/Realtime-FLUX",
            "emojis": "🏎️💨",
            "color_from": "rgba(251, 210, 31, 1)",
            "color_to": "rgba(250, 156, 11, 1)",
            "short_description": "Very fast and enhancer seems useful",
            "pinned": False,
            "favorited": False,
            "score": 5.4,
            "date_added": "2024-11-23T00:28:32.457071",
            "date_updated": "2024-11-23T00:28:32.457128",
            "tags": []
        },
        {
            "id": "6c6985ab-5d89-4c0f-aa3a-91de0a6af2b4",
            "name": "UNPAUSE DimensionX",
            "link": "https://huggingface.co/spaces/charbel-malo/DimensionX/settings",
            "emojis": "🕷️",
            "color_from": "rgba(93, 39, 39, 1)",
            "color_to": "rgba(204, 133, 11, 1)",
            "short_description": "Fix gradio",
            "pinned": False,
            "favorited": False,
            "score": 8.8,
            "date_added": "2024-11-23T03:47:14.550457",
            "date_updated": "2024-11-23T03:47:14.550484",
            "tags": []
        },
        {
            "id": "1dfcbe50-650b-4f75-a993-70724b1ad706",
            "name": "UNPAUSE Pyramid Flow FLux",
            "link": "https://huggingface.co/spaces/charbel-malo/pyramid-vid/settings",
            "emojis": "🕷️",
            "color_from": "rgba(65, 26, 25, 1)",
            "color_to": "rgba(155, 99, 15, 1)",
            "short_description": "try stable diffusion xl",
            "pinned": False,
            "favorited": False,
            "score": 0.0,
            "date_added": "2024-11-23T03:48:40.349634",
            "date_updated": "2024-11-23T03:48:40.349690",
            "tags": []
        },
        {
            "id": "fff56715-cbb7-43ce-8bf4-60c46a9e8720",
            "name": "Serpentine Desire",
            "link": "https://www.youtube.com/watch?v=FKBMFxCfU7c&list=LL&index=10&t=1832s&ab_channel=AimToHeadMix",
            "emojis": "🔥🍆",
            "color_from": "rgba(252, 3, 3, 1)",
            "color_to": "rgba(255, 41, 198, 1)",
            "short_description": "Hottest playlist to ever exist",
            "pinned": False,
            "favorited": True,
            "score": 10.0,
            "date_added": "2024-11-23T22:11:30.032563",
            "date_updated": "2024-11-23T22:11:30.032607",
            "tags": []
        },
        {
            "id": "81b23b0a-83a5-4b9a-9326-47862bed7d5c",
            "name": "Updated App Chat",
            "link": "https://chatgpt.com/share/6742cb4f-3e50-8000-9e40-dd55849c16d8",
            "emojis": "🐥",
            "color_from": "rgba(255, 255, 255, 1)",
            "color_to": "rgba(255, 255, 255, 1)",
            "short_description": "lol",
            "pinned": False,
            "favorited": False,
            "score": 0.0,
            "date_added": "2024-11-24T11:39:04.719430",
            "date_updated": "2024-11-24T11:39:04.719435",
            "tags": []
        }
    ]

    with app.app_context():
        for data in shortcuts_data:
            # Process tags if any
            tags = process_tags(data['tags']) if 'tags' in data and data['tags'] else []
            
            # Handle date fields
            if isinstance(data.get('date_added'), str):
                date_added = datetime.datetime.fromisoformat(data['date_added'])
            else:
                date_added = data.get('date_added', datetime.datetime.utcnow())
            
            if isinstance(data.get('date_updated'), str):
                date_updated = datetime.datetime.fromisoformat(data['date_updated'])
            else:
                date_updated = data.get('date_updated', datetime.datetime.utcnow())
            
            # Create Shortcut instance
            shortcut = Shortcut(
                id=data.get('id', str(uuid.uuid4())),
                name=data['name'],
                link=data['link'],
                emojis=data.get('emojis', ''),
                color_from=data['color_from'],
                color_to=data['color_to'],
                short_description=data.get('short_description', ''),
                pinned=data.get('pinned', False),
                favorited=data.get('favorited', False),
                score=float(data.get('score', 0.0)),
                tags=tags,
                date_added=date_added,
                date_updated=date_updated
            )
            db.session.add(shortcut)
        
        db.session.commit()
        print('Database seeded successfully.')

if __name__ == '__main__':
    from app import app  # Import the app instance
    with app.app_context():
        db.create_all()
        seed_database()  # Call the seeding function
    app.run(debug=True)
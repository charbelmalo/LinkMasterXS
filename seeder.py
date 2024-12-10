# seeder.py
import uuid
import datetime
import json
import os
from dotenv import load_dotenv

from models import User, Shortcut, Tag, shortcut_tag

load_dotenv()

EXPORT_FILENAME = 'shortcuts_export.json'

def clear_database():
    """Function to clear all data from the database tables."""
    from app import db, app
    with app.app_context():
        try:
            db.session.execute(shortcut_tag.delete())
            Shortcut.query.delete()
            Tag.query.delete()
            User.query.delete()
            db.session.commit()
            print("Database cleared successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing database: {e}")

def seed_database():
    """Seeds the database either from exported JSON data if available,
    or from predefined sample data."""
    
    from app import db, app
    from blueprints.utils import process_tags
    clear_database()

    test_username = 'test'
    test_email = 'test@test.com'
    test_password = 'test'

    with app.app_context():
        # Create a new test user
        test_user = User(username=test_username, email=test_email)
        test_user.set_password(test_password)
        db.session.add(test_user)
        db.session.commit()
        print("Test user created.")

        # If an export file exists, use it. Otherwise, use sample data.
        if os.path.exists(EXPORT_FILENAME):
            print(f"Found {EXPORT_FILENAME}, importing shortcuts from it...")
            with open(EXPORT_FILENAME, 'r', encoding='utf-8') as f:
                imported_data = json.load(f)
            sample_shortcuts = imported_data
        else:
            print(f"No export file found. Using fallback sample data.")
            sample_shortcuts = [
                {
                    "id": "d6ebff0a-25b2-44c9-8898-aab122c1a4f9",
                    "name": "xVault Toolkit - chat",
                    "link": "https://chatgpt.com/share/6742cb4f-3404-8000-9ca4-d42c0acae0ed",
                    "emojis": "👨🏻‍💻✍🏼",
                    "color_from": "#9447c3",
                    "color_to": "#4a1c78",
                    "short_description": "Has all dependencies information + improvement plan",
                    "pinned": False,
                    "favorited": True,
                    "score": 8.2,
                    "date_added": "2024-11-24T06:47:14.926698",
                    "date_updated": "2024-11-24T06:47:14.926761",
                    "tags": [],
                    "click_count": 0
                },
                {
                    "id": "ffda249b-3057-4129-a3d3-346433146a98",
                    "name": "4k Image Generator",
                    "link": "https://huggingface.co/spaces/charbel-malo/UltraPixel-demo",
                    "emojis": "🌝🦋",
                    "color_from": "#fbd21f",
                    "color_to": "#fca103",
                    "short_description": "UltraPixel Space - Needs GPU hardware switch",
                    "pinned": False,
                    "favorited": False,
                    "score": 9.2,
                    "date_added": "2024-11-24T07:07:20.366501",
                    "date_updated": "2024-11-24T07:07:20.366560",
                    "tags": [],
                    "click_count": 0
                },
                {
                    "id": "93aa19de-1a1b-4c67-bbb3-bdceeb4ebe02",
                    "name": "Test",
                    "link": "https://www.example.com",
                    "emojis": "😎",
                    "color_from": "#ff0000",
                    "color_to": "#000000",
                    "short_description": "asdda",
                    "pinned": False,
                    "favorited": True,
                    "score": 3.0,
                    "date_added": "2024-11-22T20:58:50.150567",
                    "date_updated": "2024-11-22T20:58:50.150591",
                    "tags": ["Grower", "Master"],
                    "click_count": 0
                },
                {
                    "id": "71e4b458-f41f-4575-a7f7-c3afc3674467",
                    "name": "GPT Links",
                    "link": "https://chat.openai",
                    "emojis": "😎😎",
                    "color_from": "#3662e7",
                    "color_to": "#768cf9",
                    "short_description": "sadad",
                    "pinned": False,
                    "favorited": False,
                    "score": 9.6,
                    "date_added": "2024-11-22T20:59:48.141141",
                    "date_updated": "2024-11-22T20:59:48.141168",
                    "tags": ["GPT", "Main"],
                    "click_count": 0
                },
                {
                    "id": "2c4056ae-9fd2-4c14-a900-85ac29e775f9",
                    "name": "WEM Guidelines",
                    "link": "https://example.com",
                    "emojis": "🌈",
                    "color_from": "#6685cc",
                    "color_to": "#20972e",
                    "short_description": "Lorem",
                    "pinned": False,
                    "favorited": False,
                    "score": 6.2,
                    "date_added": "2024-11-22T23:17:54.152845",
                    "date_updated": "2024-11-22T23:17:54.152870",
                    "tags": ["WEM Automation", "GPT", "Design guidelines"],
                    "click_count": 0
                },
                {
                    "id": "aafae719-9bdf-4c9d-ab1a-865cb220a99d",
                    "name": "Realtime FLUX + Enhancer",
                    "link": "https://huggingface.co/spaces/KingNish/Realtime-FLUX",
                    "emojis": "🏎️💨",
                    "color_from": "#fbd21f",
                    "color_to": "#fa9c0b",
                    "short_description": "Very fast and enhancer seems useful",
                    "pinned": False,
                    "favorited": False,
                    "score": 5.4,
                    "date_added": "2024-11-23T00:28:32.457071",
                    "date_updated": "2024-11-23T00:28:32.457128",
                    "tags": ["Hugging Face Space", "FLUX", "FastAI", "Enhance Image"],
                    "click_count": 0
                },
                {
                    "id": "6c6985ab-5d89-4c0f-aa3a-91de0a6af2b4",
                    "name": "UNPAUSE DimensionX",
                    "link": "https://huggingface.co/spaces/charbel-malo/DimensionX/settings",
                    "emojis": "🕷️",
                    "color_from": "#5d2727",
                    "color_to": "#cc850b",
                    "short_description": "Fix gradio",
                    "pinned": False,
                    "favorited": False,
                    "score": 8.8,
                    "date_added": "2024-11-23T03:47:14.550457",
                    "date_updated": "2024-11-23T03:47:14.550484",
                    "tags": ["Hugging Face", "To Fix", "Unpause"],
                    "click_count": 0
                },
                {
                    "id": "1dfcbe50-650b-4f75-a993-70724b1ad706",
                    "name": "UNPAUSE Pyramid Flow FLux",
                    "link": "https://huggingface.co/spaces/charbel-malo/pyramid-vid/settings",
                    "emojis": "🕷️",
                    "color_from": "#411a19",
                    "color_to": "#9b630f",
                    "short_description": "try stable diffusion xl",
                    "pinned": False,
                    "favorited": False,
                    "score": 0.0,
                    "date_added": "2024-11-23T03:48:40.349634",
                    "date_updated": "2024-11-23T03:48:40.349690",
                    "tags": ["Hugging Face", "To Fix", "Unpause"],
                    "click_count": 0
                },
                {
                    "id": "fff56715-cbb7-43ce-8bf4-60c46a9e8720",
                    "name": "Serpentine Desire",
                    "link": "https://www.youtube.com/watch?v=FKBMFxCfU7c&list=LL&index=10&t=1832s&ab_channel=AimToHeadMix",
                    "emojis": "🔥🍆",
                    "color_from": "#fc0303",
                    "color_to": "#ff29c6",
                    "short_description": "Hottest playlist to ever exist",
                    "pinned": False,
                    "favorited": True,
                    "score": 10.0,
                    "date_added": "2024-11-23T22:11:30.032563",
                    "date_updated": "2024-11-23T22:11:30.032607",
                    "tags": ["Music", "Hot"],
                    "click_count": 0
                },
                {
                    "id": "81b23b0a-83a5-4b9a-9326-47862bed7d5c",
                    "name": "Updated App Chat",
                    "link": "https://chatgpt.com/share/6742cb4f-3e50-8000-9e40-dd55849c16d8",
                    "emojis": "🐥",
                    "color_from": "#ffffff",
                    "color_to": "#ffffff",
                    "short_description": "lol",
                    "pinned": False,
                    "favorited": False,
                    "score": 0.0,
                    "date_added": "2024-11-24T11:39:04.719430",
                    "date_updated": "2024-11-24T11:39:04.719435",
                    "tags": [],
                    "click_count": 0
                },
                {
                    "id": "7e902392-e611-4414-a349-04d6d5ea2b87",
                    "name": "Google",
                    "link": "https://www.google.com",
                    "emojis": "🌐",
                    "color_from": "#87ff5c",
                    "color_to": "#42f0a5",
                    "short_description": "Search Engine",
                    "pinned": False,
                    "favorited": True,
                    "score": 5.0,
                    "date_added": "2024-11-29T08:32:06.535022",
                    "date_updated": "2024-12-06T00:16:32.048044",
                    "tags": [
                        "Internet/Search"
                    ],
                    "click_count": 0
                },
                {
                    "id": "04eb19d1-d712-4025-8bb7-32cdca9075c1",
                    "name": "YouTubes",
                    "link": "https://www.youtube.com",
                    "emojis": "🎥",
                    "color_from": "#f03838",
                    "color_to": "#642b2b",
                    "short_description": "Video Platform",
                    "pinned": True,
                    "favorited": False,
                    "score": 4.5,
                    "date_added": "2024-11-29T08:32:06.536782",
                    "date_updated": "2024-12-05T14:09:00.147997",
                    "tags": [
                        "Entertainment/Video"
                    ],
                    "click_count": 0
                },
                {
                    "id": "84c7cbcc-dee8-40b7-b400-205c78247d87",
                    "name": "Adobe Color Wheel",
                    "link": "https://color.adobe.com/create/color-wheel/?guid=d4ba9fca-19ff-49ae-95e8-43f325a27a42&location=Apps:all:AppCard&product=Creative%20Cloud%20Desktop&mv=product&mv2=accc",
                    "emojis": "🌈🎡",
                    "color_from": "#ff61d5",
                    "color_to": "#ffba24",
                    "short_description": "Video Platform",
                    "pinned": False,
                    "favorited": True,
                    "score": 4.5,
                    "date_added": "2024-11-30T23:28:37.404155",
                    "date_updated": "2024-12-05T14:08:45.387095",
                    "tags": [
                        "Entertainment/Video"
                    ],
                    "click_count": 0
                },
                {
                    "id": "83def1e5-b5e9-4d4e-8018-fea35f9e9050",
                    "name": "Grower Staging",
                    "link": "https://staging.the-grower.com/",
                    "emojis": "🔨👨🏻‍💻",
                    "color_from": "#007bff",
                    "color_to": "#c800ff",
                    "short_description": "Staging Link for Grower Platform",
                    "pinned": True,
                    "favorited": False,
                    "score": 10.0,
                    "date_added": "2024-12-06T00:16:07.316315",
                    "date_updated": "2024-12-07T21:05:02.138887",
                    "tags": [
                        "Internet/Search",
                        "Grower"
                    ],
                    "click_count": 12
                },
                {
                    "id": "23c1127f-082b-4110-837a-0baae55e1eb4",
                    "name": "Eleven Labs - Audio Haus",
                    "link": "https://elevenlabs.io/app/voice-lab",
                    "emojis": "🔊",
                    "color_from": "#cf2bfd",
                    "color_to": "#00eb3b",
                    "short_description": "Can this be any more magical?",
                    "pinned": True,
                    "favorited": True,
                    "score": 10.0,
                    "date_added": "2024-12-07T10:27:37.275337",
                    "date_updated": "2024-12-07T11:12:43.262432",
                    "tags": [
                        "Portfolio"
                    ],
                    "click_count": 0
                },
                {
                    "id": "6514550d-a366-45c2-ac8b-574c024dd10c",
                    "name": "HuggingFace Profile",
                    "link": "https://huggingface.co/charbel-malo",
                    "emojis": "🤗",
                    "color_from": "#ffcb0f",
                    "color_to": "#ffc96b",
                    "short_description": "HuggingFace profile",
                    "pinned": False,
                    "favorited": False,
                    "score": 0.0,
                    "date_added": "2024-12-07T23:08:48.589262",
                    "date_updated": "2024-12-07T23:24:38.794774",
                    "tags": [
                        "Internet/Search",
                        "Socials",
                        "Hotlinks"
                    ],
                    "click_count": 0
                }
            ]


        for shortcut_data in sample_shortcuts:
            # Extract tags from data
            tag_strings = shortcut_data.pop('tags', [])
            tags = process_tags(tag_strings)

            # Handle click_count, default if not present
            click_count = shortcut_data.get('click_count', 0)

            shortcut = Shortcut(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                tags=tags,
                name=shortcut_data['name'],
                link=shortcut_data['link'],
                emojis=shortcut_data.get('emojis', ''),
                color_from=shortcut_data['color_from'],
                color_to=shortcut_data['color_to'],
                short_description=shortcut_data.get('short_description', ''),
                pinned=shortcut_data.get('pinned', False),
                favorited=shortcut_data.get('favorited', False),
                score=float(shortcut_data.get('score', 0.0)),
                click_count=click_count,
                date_added=datetime.datetime.now(datetime.timezone.utc),
                date_updated=datetime.datetime.now(datetime.timezone.utc)
            )

            db.session.add(shortcut)
            print(f"Added shortcut: {shortcut.name}")

        db.session.commit()
        print('Database seeded successfully.')

if __name__ == '__main__':
    seed_database()
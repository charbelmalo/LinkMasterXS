# seed.py
from app import db, Shortcut, app
from datetime import datetime

data = [
    {
        "id": "93aa19de-1a1b-4c67-bbb3-bdceeb4ebe02",
        "name": "Test",
        "link": "https://www.example.com",
        "tags": [
            "Grower",
            "Master"
        ],
        "emojis": "😎",
        "color_from": "rgba(255, 0, 0, 1)",
        "color_to": "rgba(0, 0, 0, 1)",
        "short_description": "asdda",
        "pinned": False,
        "favorited": True,
        "score": 3,
        "date_added": "2024-11-22T20:58:50.150567",
        "date_updated": "2024-11-22T20:58:50.150591"
    },
    {
        "id": "71e4b458-f41f-4575-a7f7-c3afc3674467",
        "name": "GPT Links",
        "link": "https://chat.openai",
        "tags": [
            "GPT",
            "Main"
        ],
        "emojis": "😎😎",
        "color_from": "rgba(54, 98, 231, 1)",
        "color_to": "rgba(118, 140, 249, 1)",
        "short_description": "sadad",
        "pinned": False,
        "favorited": False,
        "score": 9.6,
        "date_added": "2024-11-22T20:59:48.141141",
        "date_updated": "2024-11-22T20:59:48.141168"
    },
    {
        "id": "2c4056ae-9fd2-4c14-a900-85ac29e775f9",
        "name": "WEM Guidelines",
        "link": "https://example.com",
        "tags": [
            "WEM Automation",
            "GPT",
            "Design guidelines"
        ],
        "emojis": "🌈",
        "color_from": "rgba(102, 133, 204, 1)",
        "color_to": "rgba(32, 151, 46, 1)",
        "short_description": "Lorem",
        "pinned": False,
        "favorited": False,
        "score": 6.2,
        "date_added": "2024-11-22T23:17:54.152845",
        "date_updated": "2024-11-22T23:17:54.152870"
    },
    {
        "id": "aafae719-9bdf-4c9d-ab1a-865cb220a99d",
        "name": "Realtime FLUX + Enhancer",
        "link": "https://huggingface.co/spaces/KingNish/Realtime-FLUX",
        "tags": [
            "Hugging Face Space",
            "FLUX",
            "FastAI",
            "Enhance Image"
        ],
        "emojis": "🏎️💨",
        "color_from": "rgba(251, 210, 31, 1)",
        "color_to": "rgba(250, 156, 11, 1)",
        "short_description": "Very fast and enhancer seems useful",
        "pinned": False,
        "favorited": False,
        "score": 5.4,
        "date_added": "2024-11-23T00:28:32.457071",
        "date_updated": "2024-11-23T00:28:32.457128"
    },
    {
        "id": "6c6985ab-5d89-4c0f-aa3a-91de0a6af2b4",
        "name": "UNPAUSE DimensionX",
        "link": "https://huggingface.co/spaces/charbel-malo/DimensionX/settings",
        "tags": [
            "Hugging Face",
            "To Fix",
            "Unpause"
        ],
        "emojis": "🕷️",
        "color_from": "rgba(93, 39, 39, 1)",
        "color_to": "rgba(204, 133, 11, 1)",
        "short_description": "Fix gradio",
        "pinned": False,
        "favorited": False,
        "score": 8.8,
        "date_added": "2024-11-23T03:47:14.550457",
        "date_updated": "2024-11-23T03:47:14.550484"
    },
    {
        "id": "1dfcbe50-650b-4f75-a993-70724b1ad706",
        "name": "UNPAUSE Pyramid Flow FLux",
        "link": "https://huggingface.co/spaces/charbel-malo/pyramid-vid/settings",
        "tags": [
            "Hugging Face",
            "To Fix",
            "Unpause"
        ],
        "emojis": "🕷️",
        "color_from": "rgba(65, 26, 25, 1)",
        "color_to": "rgba(155, 99, 15, 1)",
        "short_description": "try stable diffusion xl",
        "pinned": False,
        "favorited": False,
        "score": 0,
        "date_added": "2024-11-23T03:48:40.349634",
        "date_updated": "2024-11-23T03:48:40.349690"
    },
    {
        "id": "fff56715-cbb7-43ce-8bf4-60c46a9e8720",
        "name": "Serpentine Desire",
        "link": "https://www.youtube.com/watch?v=FKBMFxCfU7c&list=LL&index=10&t=1832s&ab_channel=AimToHeadMix",
        "tags": [
            "Music",
            "Hot"
        ],
        "emojis": "🔥🍆",
        "color_from": "rgba(252, 3, 3, 1)",
        "color_to": "rgba(255, 41, 198, 1)",
        "short_description": "Hottest playlist to ever exist",
        "pinned": False,
        "favorited": True,
        "score": 10,
        "date_added": "2024-11-23T22:11:30.032563",
        "date_updated": "2024-11-23T22:11:30.032607"
    }
]

with app.app_context():
    for item in data:
        shortcut = Shortcut(
            id=item["id"],
            name=item["name"],
            link=item["link"],
            tags=",".join(item["tags"]),
            emojis=item["emojis"],
            color_from=item["color_from"],
            color_to=item["color_to"],
            short_description=item["short_description"],
            pinned=item["pinned"],
            favorited=item["favorited"],
            score=item["score"],
            date_added=datetime.fromisoformat(item["date_added"]),
            date_updated=datetime.fromisoformat(item["date_updated"])
        )
        db.session.add(shortcut)
    db.session.commit()
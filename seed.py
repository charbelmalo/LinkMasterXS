# seeder.py
from app import db, app, process_tags
import uuid
import datetime
from models import User, Shortcut, Tag, shortcut_tag
import os
from dotenv import load_dotenv

load_dotenv()

def clear_database():
    """Function to clear all data from the database tables."""
    with app.app_context():
        try:
            # Clear the association table first
            db.session.execute(shortcut_tag.delete())
            # Delete all records from tables
            Shortcut.query.delete()
            Tag.query.delete()
            User.query.delete()
            db.session.commit()
            print("Database cleared successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing database: {e}")


def seed_database():
    # First clear the database
    clear_database()
    # Define the test user credentials
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

        # Sample Data
        sample_shortcuts = [
        {
            'name': 'Google',
            'link': 'https://www.google.com',
            'emojis': '🌐',
            'color_from': '#4285F4',
            'color_to': '#34A853',
            'short_description': 'Search Engine',
            'pinned': False,
            'favorited': True,
            'score': 5.0,
            'tags': ['Internet/Search']
        },
        {
            'name': 'YouTube',
            'link': 'https://www.youtube.com',
            'emojis': '🎥',
            'color_from': '#FF0000',
            'color_to': '#FF0000',
            'short_description': 'Video Platform',
            'pinned': True,
            'favorited': True,
            'score': 4.5,
            'tags': ['Entertainment/Video']
        },
        ]
        for shortcut_data in sample_shortcuts:
            # Process tags and get Tag objects
            tag_strings = shortcut_data.pop('tags', [])
            tags = process_tags(tag_strings)  # Ensure tags are processed correctly

            # Create a new Shortcut
        
            # Check if the shortcut already exists to prevent duplicates
            # existing_shortcut = Shortcut.query.filter_by(id=tags.get('id')).first()
            # if existing_shortcut:
            #     print(f"Shortcut with ID {tags.get('id')} already exists. Skipping.")
            #     continue

            # Create Shortcut instance
            shortcut = Shortcut(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                tags=tags,  # Ensure tags is a list
                name=shortcut_data['name'],
                link=shortcut_data['link'],
                emojis=shortcut_data.get('emojis', ''),
                color_from=shortcut_data['color_from'],
                color_to=shortcut_data['color_to'],
                short_description=shortcut_data.get('short_description', ''),
                pinned=shortcut_data.get('pinned', False),
                favorited=shortcut_data.get('favorited', False),
                score=float(shortcut_data.get('score', 0.0)),
                date_added=shortcut_data.get('date_added', datetime.datetime.utcnow()),
                date_updated=shortcut_data.get('date_updated', datetime.datetime.utcnow())
            )
            db.session.add(shortcut)
            print(f"Added shortcut: {shortcut.name}")

        db.session.commit()
        print('Database seeded successfully.')

if __name__ == '__main__':

        seed_database() 
        # db.create_all() # Call the seeding function
    # Optionally, you can remove or comment out the following line
    # app.run(debug=True)
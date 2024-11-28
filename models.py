# models.py
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db  # Import db from extensions.py
from datetime import datetime

class User(db.Model, UserMixin):
    __tablename__ = 'user'  # Explicitly name the table (optional)

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    shortcuts = db.relationship('Shortcut', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shortcut(db.Model):
    __tablename__ = 'shortcut'

    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    name = db.Column(db.String(150), nullable=False)
    link = db.Column(db.String(500), nullable=False)
    emojis = db.Column(db.String(50))
    color_from = db.Column(db.String(50))
    color_to = db.Column(db.String(50))
    short_description = db.Column(db.String(500))
    pinned = db.Column(db.Boolean, default=False)
    favorited = db.Column(db.Boolean, default=False)
    score = db.Column(db.Float, default=0.0)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    date_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tags = db.relationship('Tag', secondary='shortcut_tag', backref=db.backref('shortcuts', lazy='dynamic'))

class Tag(db.Model):
    __tablename__ = 'tag'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=True)
    children = db.relationship('Tag', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

# Association Table for Many-to-Many Relationship
shortcut_tag = db.Table('shortcut_tag',
    db.Column('shortcut_id', db.String(36), db.ForeignKey('shortcut.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)
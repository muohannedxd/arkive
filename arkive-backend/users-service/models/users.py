from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from database import db


class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text)
    role = db.Column(db.String(20), nullable=False, default="User")
    position = db.Column(db.String(100))
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=True)
    department = db.relationship("Department", back_populates="users")
    phone = db.Column(db.String(50))
    status = db.Column(db.String(50), default="Active")
    hire_date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )

    def __init__(self, name, email, password, role="User", **kwargs):
        self.name = name
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.role = role
        for key, value in kwargs.items():
            setattr(self, key, value)

    @staticmethod
    def register_user_if_not_exist(user):
        if User.query.filter_by(email=user.email).first():
            return False
        db.session.add(user)
        db.session.commit()
        return True

    @staticmethod
    def get_by_email(email):
        return User.query.filter(User.email == email).first()

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "position": self.position,
            "department": self.department.name if self.department else None,
            "phone": self.phone,
            "status": self.status,
            "hire_date": (
                self.hire_date.strftime("%Y-%m-%d") if self.hire_date else None
            ),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

    def __repr__(self):
        return f"<User {self.name}>"


def apply_filter(user, key, value):
    """Apply a single filter to a user dictionary"""
    if isinstance(user, dict):
        return user.get(key) == value
    return getattr(user, key, None) == value


def filter_users(users, filters):
    """Filter a list of user dictionaries based on filter criteria"""
    if not filters:
        return [user.to_dict() if hasattr(user, 'to_dict') else user for user in users]

    filtered_users = []
    for user in users:
        user_dict = user.to_dict() if hasattr(user, 'to_dict') else user
        if all(apply_filter(user_dict, k, v) for k, v in filters.items()):
            filtered_users.append(user_dict)

    return filtered_users


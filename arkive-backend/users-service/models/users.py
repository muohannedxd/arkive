import operator
from faker import Faker
import random
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from database import db

# Initialize Faker
fake = Faker()

# Sample Data
sample_positions = [
    "Software Engineer",
    "Senior Software Engineer",
    "Lead Developer",
    "Full Stack Developer",
    "Product Manager",
    "Senior Product Manager",
    "Product Owner",
    "Product Director",
    "UX Designer",
    "UI/UX Designer",
    "Senior Designer",
    "Design Lead",
    "Data Analyst",
    "Data Scientist",
    "Data Engineer",
    "Analytics Lead",
]

sample_statuses = ["Active", "On Leave", "Remote", "Inactive", "Probation", "Contract"]
sample_roles = ["Admin", "User"]
sample_departments = [
    "Information Technology",
    "Sales",
    "Marketing",
    "Human Resources",
    "Legal",
    "Finance",
    "Operations",
    "Customer Support",
    "Quality Assurance",
    "Research and Development",
]

# Filtering Operators
OPERATORS = {
    "eq": operator.eq,  # Equal
    "ne": operator.ne,  # Not Equal
    "gt": operator.gt,  # Greater Than
    "lt": operator.lt,  # Less Than
    "ge": operator.ge,  # Greater Than or Equal
    "le": operator.le,  # Less Than or Equal
    "contains": lambda x, y: y.lower() in x.lower(),  # Case-insensitive contains
    "startswith": lambda x, y: x.lower().startswith(
        y.lower()
    ),  # Case-insensitive starts with
    "endswith": lambda x, y: x.lower().endswith(
        y.lower()
    ),  # Case-insensitive ends with
    "in": lambda x, y: x in y,  # In list
}


class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text)
    role = db.Column(db.String(20), nullable=False, default="User")
    position = db.Column(db.String(100))
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Active")
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
            "department": self.department,
            "phone": self.phone,
            "status": self.status,
            "hire_date": (
                self.hire_date.strftime("%Y-%m-%d") if self.hire_date else None
            ),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

    def __repr__(self):
        return f"<User {self.name}>"


def generate_dummy_users(total_users=1000):
    users = []
    for i in range(total_users):
        user = {
            "id": i + 1,
            "name": fake.name(),
            "email": fake.email(),
            "role": random.choice(sample_roles),
            "position": random.choice(sample_positions),
            "department": random.choice(sample_departments),
            "phone": fake.phone_number(),
            "status": random.choice(sample_statuses),
            "hire_date": fake.date_between(start_date="-5y", end_date="today").strftime(
                "%Y-%m-%d"
            ),
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        }
        users.append(user)
    return users


def apply_filter(user, key, value):
    return user.get(key) == value


def filter_users(users, filters):
    if not filters:
        return users

    filtered_users = users
    for key, value in filters.items():  # Iterate over key-value pairs
        filtered_users = [
            user for user in filtered_users if apply_filter(user, key, value)
        ]

    return filtered_users

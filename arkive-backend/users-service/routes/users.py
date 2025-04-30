from flask import Blueprint, request, jsonify
import math
import threading
from models import User, generate_dummy_users, filter_users
from database import db

users_bp = Blueprint("/api/users", __name__)

# Store users
users_storage = []

# Prevent race conditions
users_lock = threading.Lock()

# Function to initialize users
def initialize_users():
    global users_storage
    with users_lock:
        if not users_storage:
            users_storage = generate_dummy_users(689)

# Initialize users when the server starts
initialize_users()

@users_bp.route("/", methods=["GET"])
def get_users():
    global users_storage

    # Pagination parameters
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search_query = request.args.get("search", "").strip().lower()

    # Extract filters from query parameters
    filters = {
        "role": request.args.get("role"),
        "status": request.args.get("status"),
        "department": request.args.get("department"),
    }
    filters = {k: v for k, v in filters.items() if v}  # Remove empty filters

    print(f"Filters received: {filters}")

    # Apply filters
    filtered_users = filter_users(users_storage, filters)

    # Apply search
    if search_query:
        filtered_users = [
            user
            for user in filtered_users
            if search_query in user["name"].lower()
            or search_query in user["email"].lower()
        ]

    # Calculate pagination
    total_users = len(filtered_users)
    total_pages = math.ceil(total_users / per_page)
    page = max(1, min(page, total_pages)) if total_pages > 0 else 1

    # Get paginated subset
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_users = filtered_users[start_idx:end_idx]

    return jsonify(
        {
            "status": "success",
            "data": paginated_users,
            "total": total_users,
            "pagination": {
                "total_records": total_users,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
            "filters": filters,
            "search_query": search_query,
        }
    )
    
@users_bp.route("/populate", methods=["POST"])
def populate_users():
    try:
        count = int(request.args.get("count", 500))
        users = generate_dummy_users(count)

        for user in users:
            if not User.get_by_email(user.email):  # avoid duplicates
                db.session.add(user)

        db.session.commit()
        return jsonify({"status": "success", "message": f"{count} users added."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


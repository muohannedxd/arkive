from flask import Blueprint, request, jsonify
import math
from models import User, filter_users
from database import db
from datetime import datetime
from sqlalchemy.exc import IntegrityError


users_bp = Blueprint("/api/users", __name__)

# Get all users
@users_bp.route("/", methods=["GET"])
def get_users():
    try:
        users_storage = [user.to_dict() for user in User.query.all()]
        
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search_query = request.args.get("search", "").strip().lower()
        
        filters = {
            "role": request.args.get("role"),
            "status": request.args.get("status"),
            "department": request.args.get("department"),
        }
        filters = {k: v for k, v in filters.items() if v}  # Remove empty filters
        
        filtered_users = filter_users(users_storage, filters)
        
        if search_query:
            filtered_users = [
                user
                for user in filtered_users
                if search_query in user["name"].lower()
                or search_query in user["email"].lower()
            ]
        
        total_users = len(filtered_users)
        total_pages = math.ceil(total_users / per_page) if total_users > 0 else 1
        page = max(1, min(page, total_pages))
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_users = filtered_users[start_idx:end_idx]
        
        response_data = {
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
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    
# Get user by ID
@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        return jsonify({"status": "success", "data": user.to_dict()})
        
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    

# Create a new user
@users_bp.route("/", methods=["POST"])
def create_user():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "User")
        position = data.get("position")
        department = data.get("department")
        phone = data.get("phone")
        status = data.get("status", "Active")
        hire_date_str = data.get("hire_date")

        if not all([name, email, password]):
            return jsonify({"status": "error", "message": "Name, email, and password are required."}), 400

        # Check if user with this email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({"status": "error", "message": "User with this email already exists."}), 409

        hire_date = None
        if hire_date_str:
            try:
                hire_date = datetime.strptime(hire_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"status": "error", "message": "Invalid date format. Use YYYY-MM-DD."}), 400

        user = User(
            name=name,
            email=email,
            password=password,
            role=role,
            position=position,
            department=department,
            phone=phone,
            status=status,
            hire_date=hire_date
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({"status": "success", "data": user.to_dict()}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Email must be unique. User creation failed."}), 409

    except Exception as e:
        print(f"Error in create_user: {str(e)}")
        return jsonify({"status": "error", "message": "An unexpected error occurred while creating the user."}), 500


# Delete a user
@users_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"status": "success", "message": "User deleted"}), 200

    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

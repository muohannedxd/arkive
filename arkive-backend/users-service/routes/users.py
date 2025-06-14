from flask import Blueprint, request, jsonify
from models import User, filter_users, Department
from database import db
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
import math


users_bp = Blueprint("/api/users", __name__)

# Get all users


@users_bp.route("/", methods=["GET"])
def get_users():
    try:
        users_storage = [user.to_dict() for user in User.query.order_by(
            User.created_at.desc()).all()]

        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search_query = request.args.get("search", "").strip().lower()

        filters = {
            "role": request.args.get("role"),
            "status": request.args.get("status"),
            "department": request.args.get("department"),
        }
        # Remove empty filters
        filters = {k: v for k, v in filters.items() if v}

        filtered_users = filter_users(users_storage, filters)

        if search_query:
            filtered_users = [
                user
                for user in filtered_users
                if search_query in user["name"].lower()
                or search_query in user["email"].lower()
            ]

        total_users = len(filtered_users)
        total_pages = math.ceil(
            total_users / per_page) if total_users > 0 else 1
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
        department_ids = data.get("department_ids", [])  # Get array of department IDs
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
            phone=phone,
            status=status,
            hire_date=hire_date
        )

        # Add departments to the user
        if department_ids:
            departments = Department.query.filter(Department.id.in_(department_ids)).all()
            if len(departments) != len(department_ids):
                return jsonify({"status": "error", "message": "One or more department IDs are invalid."}), 400
            user.departments = departments

        db.session.add(user)
        db.session.commit()

        return jsonify({"status": "success", "data": user.to_dict()}), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Integrity error occurred. Email must be unique."}), 409

    except Exception as e:
        db.session.rollback()
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

# Update an existing user


@users_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    try:
        data = request.get_json()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        if "password" in data and data["password"]:
            user.password_hash = generate_password_hash(data["password"])
        user.role = data.get("role", user.role)
        user.position = data.get("position", user.position)
        user.phone = data.get("phone", user.phone)
        user.status = data.get("status", user.status)

        # Update departments if provided
        department_ids = data.get("department_ids")
        if department_ids is not None:
            # Clear existing departments and add new ones
            departments = Department.query.filter(Department.id.in_(department_ids)).all()
            if len(departments) != len(department_ids):
                return jsonify({"status": "error", "message": "One or more department IDs are invalid."}), 400
            user.departments = departments

        hire_date_str = data.get("hire_date")
        if hire_date_str:
            try:
                user.hire_date = datetime.strptime(
                    hire_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"status": "error", "message": "Invalid hire date format. Use YYYY-MM-DD."}), 400

        db.session.commit()
        return jsonify({"status": "success", "data": user.to_dict()})

    except Exception as e:
        db.session.rollback()
        print(f"Error in update_user: {str(e)}")
        return jsonify({"status": "error", "message": "An error occurred while updating the user."}), 500


@users_bp.route("/validate", methods=["POST"])
def validate_user_credentials():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email:
            return jsonify({"status": "error", "message": "Email is required."}), 400
        if not password:
            return jsonify({"status": "error", "message": "Password is required."}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"status": "error", "message": "Email does not exist."}), 404

        if not check_password_hash(user.password_hash, password):
            return jsonify({"status": "error", "message": "Incorrect password."}), 401

        return jsonify({
            "status": "success",
            "data": user.to_dict()
        }), 200

    except Exception as e:
        print(f"Error in validate_user_credentials: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

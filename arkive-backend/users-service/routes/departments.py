from flask import Blueprint, jsonify, request
from models import Department
from database import db

departments_bp = Blueprint("/api/departments", __name__)

# Get all departments
@departments_bp.route("/", methods=["GET"])
def get_departments():
    departments = Department.query.all()
    return jsonify([department.to_dict() for department in departments]), 200

# Get department by ID
@departments_bp.route("/<int:department_id>", methods=["GET"])
def get_department_by_id(department_id):
    department = Department.query.get(department_id)
    if not department:
        return jsonify({"error": "Department not found"}), 404
    return jsonify(department.to_dict()), 200


# Add a new department
@departments_bp.route("/", methods=["POST"])
def add_department():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if Department.query.filter_by(name=name).first():
        return jsonify({"error": "Department already exists"}), 409

    new_department = Department(name=name)
    db.session.add(new_department)
    db.session.commit()
    return jsonify(new_department.to_dict()), 201


# Delete a department by ID
@departments_bp.route("/<int:department_id>", methods=["DELETE"])
def delete_department(department_id):
    department = Department.query.get(department_id)
    if not department:
        return jsonify({"error": "Department not found"}), 404

    db.session.delete(department)
    db.session.commit()
    return jsonify({"message": "Department deleted"}), 200
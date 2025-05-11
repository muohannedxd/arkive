import unittest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from app import app
from database import db
from models.user import User
from models.department import Department

class UsersApiTests(unittest.TestCase):
    """Test cases for the users API endpoints"""
    
    def setUp(self):
        """Set up test client and mocked database"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Create a test database
        self.mock_db_session_patcher = patch('routes.users.db.session')
        self.mock_db_session = self.mock_db_session_patcher.start()
        
    def tearDown(self):
        """Clean up after tests"""
        self.mock_db_session_patcher.stop()
    
    def test_get_users(self):
        """Test GET /api/users endpoint"""
        # Setup mock users
        mock_user1 = MagicMock()
        mock_user1.to_dict.return_value = {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "Admin",
            "position": "Manager",
            "department_id": 1,
            "department": "IT",
            "phone": "123-456-7890",
            "status": "Active",
            "hire_date": "2023-01-01"
        }
        
        mock_user2 = MagicMock()
        mock_user2.to_dict.return_value = {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "role": "User",
            "position": "Developer",
            "department_id": 1,
            "department": "IT",
            "phone": "098-765-4321",
            "status": "Active",
            "hire_date": "2023-02-15"
        }
        
        # Configure mock database query
        mock_query = self.mock_db_session.query.return_value
        mock_query.all.return_value = [mock_user1, mock_user2]
        
        # Make the request
        response = self.app.get('/api/users/')
        
        # Assert the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertEqual(len(data["data"]), 2)
        self.assertEqual(data["data"][0]["name"], "John Doe")
        self.assertEqual(data["data"][1]["name"], "Jane Smith")
    
    def test_get_user_by_id(self):
        """Test GET /api/users/:id endpoint"""
        # Setup mock user
        mock_user = MagicMock()
        mock_user.to_dict.return_value = {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "Admin"
        }
        
        # Configure mock database query
        mock_query = self.mock_db_session.query.return_value
        mock_query.get.return_value = mock_user
        
        # Make the request
        response = self.app.get('/api/users/1')
        
        # Assert the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["name"], "John Doe")
    
    def test_user_not_found(self):
        """Test GET /api/users/:id with non-existent ID"""
        # Configure mock database query to return None (user not found)
        mock_query = self.mock_db_session.query.return_value
        mock_query.get.return_value = None
        
        # Make the request
        response = self.app.get('/api/users/999')
        
        # Assert the response
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "error")
        self.assertIn("not found", data["message"].lower())
    
    @patch('routes.users.User')
    def test_create_user(self, mock_user_class):
        """Test POST /api/users/ endpoint"""
        # Setup mock user instance
        mock_user_instance = MagicMock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "name": "New User",
            "email": "new@example.com",
            "role": "User",
            "position": "Analyst",
            "department_id": 2,
            "department": "HR",
            "phone": "555-123-4567",
            "status": "Active",
            "hire_date": "2023-05-01"
        }
        mock_user_class.return_value = mock_user_instance
        
        # User data to create
        new_user_data = {
            "name": "New User",
            "email": "new@example.com",
            "password": "password123",
            "role": "User",
            "position": "Analyst",
            "department_id": 2,
            "phone": "555-123-4567",
            "status": "Active",
            "hire_date": "2023-05-01"
        }
        
        # Make the request
        response = self.app.post(
            '/api/users/',
            data=json.dumps(new_user_data),
            content_type='application/json'
        )
        
        # Assert the response
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["name"], "New User")
        self.assertEqual(data["data"]["email"], "new@example.com")
        
        # Verify DB operations were called
        self.mock_db_session.add.assert_called_once()
        self.mock_db_session.commit.assert_called_once()


class DepartmentsApiTests(unittest.TestCase):
    """Test cases for the departments API endpoints"""
    
    def setUp(self):
        """Set up test client and mocked database"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Create a test database
        self.mock_db_session_patcher = patch('routes.departments.db.session')
        self.mock_db_session = self.mock_db_session_patcher.start()
        
    def tearDown(self):
        """Clean up after tests"""
        self.mock_db_session_patcher.stop()
    
    def test_get_departments(self):
        """Test GET /api/departments endpoint"""
        # Setup mock departments
        mock_dept1 = MagicMock()
        mock_dept1.to_dict.return_value = {
            "id": 1,
            "name": "IT"
        }
        
        mock_dept2 = MagicMock()
        mock_dept2.to_dict.return_value = {
            "id": 2,
            "name": "HR"
        }
        
        # Configure mock database query
        mock_query = self.mock_db_session.query.return_value
        mock_query.all.return_value = [mock_dept1, mock_dept2]
        
        # Make the request
        response = self.app.get('/api/departments/')
        
        # Assert the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["name"], "IT")
        self.assertEqual(data[1]["name"], "HR")
    
    @patch('routes.departments.Department')
    def test_add_department(self, mock_dept_class):
        """Test POST /api/departments endpoint"""
        # Setup mock department instance
        mock_dept_instance = MagicMock()
        mock_dept_instance.to_dict.return_value = {
            "id": 3,
            "name": "Finance"
        }
        mock_dept_class.return_value = mock_dept_instance
        
        # Configure filter_by to return None (department doesn't exist yet)
        mock_query = self.mock_db_session.query.return_value
        mock_query.filter_by.return_value.first.return_value = None
        
        # Department data to create
        new_dept_data = {
            "name": "Finance"
        }
        
        # Make the request
        response = self.app.post(
            '/api/departments/',
            data=json.dumps(new_dept_data),
            content_type='application/json'
        )
        
        # Assert the response
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["name"], "Finance")
        
        # Verify DB operations were called
        self.mock_db_session.add.assert_called_once()
        self.mock_db_session.commit.assert_called_once()


if __name__ == '__main__':
    unittest.main()
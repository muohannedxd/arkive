import pytest
from fastapi.testclient import TestClient
import unittest.mock as mock
import httpx
from unittest.mock import MagicMock, patch

# Import app from the main module
from app.main import app

client = TestClient(app)

# Mock responses for different services
mock_auth_response = {"success": True, "message": "Auth service response", "data": {"token": "sample_token"}}
mock_users_response = {"success": True, "message": "Users service response", "data": [{"id": 1, "name": "John Doe"}]}
mock_documents_response = {"success": True, "message": "Documents service response", "data": [{"id": 1, "title": "Sample Document"}]}
mock_storage_response = {"success": True, "message": "Storage service response", "data": {"url": "http://storage/file.pdf"}}
mock_translation_response = {"success": True, "message": "Translation service response", "data": {"translated": "Hello World"}}


@pytest.fixture
def mock_httpx_client():
    """Fixture to mock the httpx client for testing"""
    with patch("httpx.AsyncClient") as mock_client:
        # Create a mock for the client instance
        client_instance = MagicMock()
        # Set up the client to return itself in the async context
        mock_client.return_value.__aenter__.return_value = client_instance
        
        # Return both the class mock and the instance mock
        yield mock_client, client_instance


def test_root_endpoint():
    """Test the root endpoint of the gateway API"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Arkive Gateway API is running"}


class TestAuthProxy:
    """Tests for the auth proxy endpoints"""

    def test_auth_proxy_post(self, mock_httpx_client):
        """Test forwarding a POST request to the auth service"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the auth service
        mock_response = MagicMock()
        mock_response.json.return_value = mock_auth_response
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's auth proxy
        response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password"})
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "POST"
        assert "auth-service:8080" in kwargs["url"]
        assert "/api/auth/login" in kwargs["url"]
        
        # Check if the response was properly returned
        assert response.json() == mock_auth_response


class TestUsersProxy:
    """Tests for the users proxy endpoints"""

    def test_users_proxy_get(self, mock_httpx_client):
        """Test forwarding a GET request to the users service"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the users service
        mock_response = MagicMock()
        mock_response.json.return_value = mock_users_response
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's users proxy
        response = client.get("/api/users/")
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "GET"
        assert "users-service:5000" in kwargs["url"]
        assert "/api/users" in kwargs["url"]
        
        # Check if the response was properly returned
        assert response.json() == mock_users_response

    def test_departments_proxy(self, mock_httpx_client):
        """Test forwarding a request to the departments endpoint"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the users service (departments route)
        mock_response = MagicMock()
        mock_response.json.return_value = {"success": True, "data": [{"id": 1, "name": "IT"}]}
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's departments proxy
        response = client.get("/api/departments/")
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "GET"
        assert "users-service:5000" in kwargs["url"]
        assert "/api/departments" in kwargs["url"]


class TestDocumentsProxy:
    """Tests for the documents proxy endpoints"""

    def test_documents_proxy_get(self, mock_httpx_client):
        """Test forwarding a GET request to the documents service"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the documents service
        mock_response = MagicMock()
        mock_response.json.return_value = mock_documents_response
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's documents proxy
        response = client.get("/api/documents/")
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "GET"
        assert "documents-service:8080" in kwargs["url"]
        assert "/api/documents" in kwargs["url"]
        
        # Check if the response was properly returned
        assert response.json() == mock_documents_response

    def test_folders_proxy(self, mock_httpx_client):
        """Test forwarding a request to the folders endpoint"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the documents service (folders route)
        mock_response = MagicMock()
        mock_response.json.return_value = {"success": True, "data": [{"id": 1, "name": "Important"}]}
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's folders proxy
        response = client.get("/api/folders/")
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "GET"
        assert "documents-service:8080" in kwargs["url"]
        assert "/api/folders" in kwargs["url"]


class TestStorageProxy:
    """Tests for the storage proxy endpoints"""

    def test_storage_proxy_get(self, mock_httpx_client):
        """Test forwarding a GET request to the storage service"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the storage service
        mock_response = MagicMock()
        mock_response.json.return_value = mock_storage_response
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's storage proxy
        response = client.get("/api/storage/download/file.pdf")
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "GET"
        assert "storage-service:8080" in kwargs["url"]
        assert "/api/storage/download/file.pdf" in kwargs["url"]
        
        # Check if the response was properly returned
        assert response.json() == mock_storage_response


class TestTranslationProxy:
    """Tests for the translation proxy endpoints"""

    def test_translation_proxy_post(self, mock_httpx_client):
        """Test forwarding a POST request to the translation service"""
        _, client_instance = mock_httpx_client
        
        # Mock response for the translation service
        mock_response = MagicMock()
        mock_response.json.return_value = mock_translation_response
        client_instance.request.return_value = mock_response
        
        # Make a request to the gateway's translation proxy
        response = client.post("/api/translation/translate", json={"text": "Hello", "target": "fr"})
        
        # Verify the request was forwarded correctly
        client_instance.request.assert_called_once()
        args, kwargs = client_instance.request.call_args
        assert kwargs["method"] == "POST"
        assert "translation-service:8000" in kwargs["url"]
        assert "/api/translation/translate" in kwargs["url"]
        
        # Check if the response was properly returned
        assert response.json() == mock_translation_response


def test_service_not_found():
    """Test the error handling when a service is not found"""
    with patch("app.main.proxy_request") as mock_proxy:
        mock_proxy.side_effect = httpx.RequestError("Service not found")
        
        response = client.get("/api/nonexistent/endpoint")
        assert response.status_code == 404


def test_service_error_handling(mock_httpx_client):
    """Test error handling when a service returns an error"""
    _, client_instance = mock_httpx_client
    
    # Mock a request error
    client_instance.request.side_effect = httpx.RequestError("Connection error")
    
    # Make a request that should trigger the error
    response = client.get("/api/auth/login")
    
    # Verify the error was handled correctly
    assert response.status_code == 503
    assert "Error forwarding request" in response.json().get("detail", "")
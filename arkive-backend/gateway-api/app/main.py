from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Any

app = FastAPI(title="Arkive Gateway API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SERVICE_URLS = {
    "auth": "http://auth-service:8080",
    "users": "http://users-service:5000",
    "documents": "http://documents-service:8080",
    "storage": "http://storage-service:8080",
    "translation": "http://translation-service:8000"
}

@app.get("/")
async def root():
    return {"message": "Arkive Gateway API is running"}

async def proxy_request(request: Request, service: str, path: str) -> Any:
    if service not in SERVICE_URLS:
        raise HTTPException(status_code=404, detail=f"Service {service} not found")
    
    # Remove /api prefix and normalize path
    path = path.strip('/')
    if path.startswith('api/'):
        path = path[4:]
    
    # Construct target URL, ensuring single forward slash between parts
    service_url = SERVICE_URLS[service].rstrip('/')
    target_url = f"{service_url}/api/{path}"
    
    # Get the request body if it exists
    body = None
    if request.method not in ["GET", "HEAD", "DELETE"]:
        body = await request.body()
    
    # Forward the request headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove the host header
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params,
                follow_redirects=True
            )
            
            # Handle response
            try:
                return response.json()
            except Exception:
                return {"success": False, "message": f"Invalid response from {service} service", "data": None}

        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Error forwarding request: {str(exc)}")

# Auth Service Routes
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_proxy(request: Request, path: str):
    return await proxy_request(request, "auth", f"/api/auth/{path}")

# Users Service Routes
@app.api_route("/api/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def users_proxy(request: Request, path: str):
    return await proxy_request(request, "users", f"/api/users/{path}")
 
@app.api_route("/api/departments/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def departments_proxy(request: Request, path: str):
    return await proxy_request(request, "users", f"/api/departments/{path}")

# Documents Service Routes
@app.api_route("/api/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def documents_proxy(request: Request, path: str):
    return await proxy_request(request, "documents", f"/api/documents/{path}")

@app.api_route("/api/folders/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def folders_proxy(request: Request, path: str):
    return await proxy_request(request, "documents", f"/api/folders/{path}")

# Storage Service Routes
@app.api_route("/api/storage/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def storage_proxy(request: Request, path: str):
    return await proxy_request(request, "storage", f"/api/storage/{path}")

# Translation Service Routes
@app.api_route("/api/translation/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def translation_proxy(request: Request, path: str):
    return await proxy_request(request, "translation", f"/api/translation/{path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# API Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

To use the API, send HTTP requests to our REST endpoint at `https://api.example.com`.

**Requirements:**
- Valid API key (obtain from dashboard)
- HTTPS connection required
- JSON request/response format

## Authentication

Include your API key in the `Authorization` header using Bearer token format:

```http
Authorization: Bearer YOUR_API_KEY
```

**Security Notes:**
- Never commit API keys to source control
- Rotate keys regularly
- Use environment variables for key storage

## Endpoints

### Get Users
- **Endpoint:** `GET /api/users`
- **Description:** Retrieve a list of all users
- **Response:** Array of user objects

### Get User by ID
- **Endpoint:** `GET /api/users/{id}`
- **Description:** Retrieve a specific user by their ID
- **Response:** Single user object

### Create User
- **Endpoint:** `POST /api/users`
- **Description:** Create a new user account
- **Response:** Created user object with ID

## Examples

### Request Example

```http
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer YOUR_API_KEY
Accept: application/json
```

### Response Example

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "created_at": "2024-01-16T14:20:00Z"
    }
  ]
}
```

## Error Handling

### Common HTTP Status Codes
- **200 OK:** Request successful
- **400 Bad Request:** Invalid request parameters
- **401 Unauthorized:** Missing or invalid API key
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error occurred

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid",
    "details": "Missing required parameter: user_id"
  }
}
```

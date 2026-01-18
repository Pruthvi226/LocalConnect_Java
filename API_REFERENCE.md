# API Reference

Base URL: `http://localhost:8080/api` (or your production URL)

All endpoints return JSON. Authentication endpoints don't require a token. Other endpoints require a JWT token in the Authorization header: `Bearer <token>`

## Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string (optional)",
  "address": "string (optional)",
  "role": "USER | PROVIDER | ADMIN"
}

Response:
{
  "message": "User registered successfully!",
  "userId": 1
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt-token",
  "type": "Bearer",
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "USER"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "USER"
}
```

## Service Endpoints

### Get All Services
```
GET /api/services
GET /api/services?category=Cleaning&location=New York&minPrice=100&maxPrice=200&minRating=4.0

Query Parameters (all optional):
- category: string
- location: string
- minPrice: number
- maxPrice: number
- minRating: number

Response: Array of Service objects
```

### Search Services
```
GET /api/services/search?q=cleaning

Response: Array of Service objects matching the query
```

### Get Service Categories
```
GET /api/services/categories

Response: Array of category strings
```

### Get Service by ID
```
GET /api/services/{id}

Response: Service object
```

### Create Service (Provider/Admin only)
```
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "price": 150.00,
  "location": "string",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "imageUrl": "string (optional)"
}

Response: Created Service object
```

### Update Service (Provider/Admin only)
```
PUT /api/services/{id}
Authorization: Bearer <token>
Content-Type: application/json

Body: Partial Service object (only fields to update)

Response: Updated Service object
```

### Delete Service (Admin only)
```
DELETE /api/services/{id}
Authorization: Bearer <token>

Response:
{
  "message": "Service deleted successfully"
}
```

## Booking Endpoints

### Get User Bookings
```
GET /api/bookings
Authorization: Bearer <token>

Response: Array of Booking objects
```

### Get Booking by ID
```
GET /api/bookings/{id}
Authorization: Bearer <token>

Response: Booking object
```

### Create Booking
```
POST /api/bookings?serviceId=1&bookingDate=2024-02-15T10:00:00&notes=Optional notes
Authorization: Bearer <token>

Query Parameters:
- serviceId: number (required)
- bookingDate: ISO 8601 datetime (required)
- notes: string (optional)

Response: Created Booking object
```

### Update Booking
```
PUT /api/bookings/{id}?status=CONFIRMED&notes=Updated notes
Authorization: Bearer <token>

Query Parameters (all optional):
- status: PENDING | CONFIRMED | COMPLETED | CANCELLED
- notes: string

Response: Updated Booking object
```

### Cancel Booking
```
DELETE /api/bookings/{id}
Authorization: Bearer <token>

Response:
{
  "message": "Booking cancelled successfully"
}
```

## Review Endpoints

### Get Reviews for Service
```
GET /api/reviews/service/{serviceId}

Response: Array of Review objects
```

### Create Review
```
POST /api/reviews?serviceId=1&rating=5&comment=Great service!
Authorization: Bearer <token>

Query Parameters:
- serviceId: number (required)
- rating: number 1-5 (required)
- comment: string (optional)

Response: Created Review object
```

### Update Review
```
PUT /api/reviews/{id}?rating=4&comment=Updated comment
Authorization: Bearer <token>

Query Parameters (all optional):
- rating: number 1-5
- comment: string

Response: Updated Review object
```

### Delete Review
```
DELETE /api/reviews/{id}
Authorization: Bearer <token>

Response:
{
  "message": "Review deleted successfully"
}
```

## Admin Endpoints

### Get Analytics
```
GET /api/admin/analytics
Authorization: Bearer <token> (Admin only)

Response:
{
  "totalUsers": 10,
  "totalServices": 20,
  "totalBookings": 50,
  "topServices": {
    "Service Name": 5
  },
  "popularCategories": {
    "Cleaning": 5,
    "Plumbing": 3
  },
  "bookingStats": {
    "pending": 10,
    "confirmed": 20,
    "completed": 15,
    "cancelled": 5
  },
  "recentBookings": 8
}
```

### Get All Users
```
GET /api/admin/users
Authorization: Bearer <token> (Admin only)

Response: Array of User objects
```

### Get All Bookings
```
GET /api/admin/bookings
Authorization: Bearer <token> (Admin only)

Response: Array of Booking objects
```

## Data Models

### User
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "role": "USER"
}
```

### Service
```json
{
  "id": 1,
  "title": "Professional House Cleaning",
  "description": "Complete house cleaning service...",
  "category": "Cleaning",
  "price": 150.00,
  "location": "New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "imageUrl": "https://...",
  "averageRating": 4.5,
  "totalReviews": 10,
  "isAvailable": true,
  "provider": {
    "id": 1,
    "username": "provider_name",
    "fullName": "Provider Name"
  }
}
```

### Booking
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "john_doe",
    "fullName": "John Doe"
  },
  "service": {
    "id": 1,
    "title": "Professional House Cleaning"
  },
  "bookingDate": "2024-02-15T10:00:00",
  "status": "CONFIRMED",
  "notes": "Please use eco-friendly products"
}
```

### Review
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "john_doe",
    "fullName": "John Doe"
  },
  "service": {
    "id": 1,
    "title": "Professional House Cleaning"
  },
  "rating": 5,
  "comment": "Excellent service!",
  "createdAt": "2024-02-10T12:00:00"
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Example cURL Requests

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "USER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Get Services
```bash
curl http://localhost:8080/api/services
```

### Create Booking
```bash
curl -X POST "http://localhost:8080/api/bookings?serviceId=1&bookingDate=2024-02-15T10:00:00" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

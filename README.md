# Local Service Finder

A full-stack web application for finding and booking local services, built with Java Spring Boot (backend), React.js (frontend), and MySQL (database).

## Features

- 🔐 **User Authentication**: JWT-based authentication for users, service providers, and admins
- 🔍 **Service Discovery**: Search, filter, and browse services with autocomplete suggestions
- 📅 **Booking System**: Book services with date/time selection
- ⭐ **Reviews & Ratings**: Users can rate and review services
- 📊 **Admin Dashboard**: Analytics and insights for administrators
- 🗺️ **Map Integration**: View service locations on Google Maps (optional)
- 📧 **Email Notifications**: Booking confirmations via email (optional)

## Tech Stack

- **Backend**: Java Spring Boot 3.x
- **Frontend**: React.js 18+ with Material-UI
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: 
  - Frontend: Vercel/Netlify
  - Backend: Render/Railway/Heroku

## Project Structure

```
local-service-finder/
├── backend/                 # Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── localservicefinder/
│   │       │           ├── LocalServiceFinderApplication.java
│   │       │           ├── config/
│   │       │           ├── controller/
│   │       │           ├── dto/
│   │       │           ├── model/
│   │       │           ├── repository/
│   │       │           ├── service/
│   │       │           └── security/
│   │       └── resources/
│   │           ├── application.properties
│   │           └── db/
│   ├── pom.xml
│   └── .env.example
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── database/              # Database scripts
│   ├── schema.sql
│   └── sample-data.sql
└── README.md
```

## Getting Started

### Prerequisites

- Java JDK 17 or higher
- Node.js 18+ and npm
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure database in `src/main/resources/application.properties` or use environment variables

3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example` and configure API URL

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE local_service_finder;
```

2. Run the schema script:
```bash
mysql -u your_username -p local_service_finder < database/schema.sql
```

3. Load sample data:
```bash
mysql -u your_username -p local_service_finder < database/sample-data.sql
```

## Environment Variables

### Backend (.env)
```
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/local_service_finder
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=86400000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Configure build command: `mvn clean package`
3. Set start command: `java -jar target/local-service-finder-0.0.1-SNAPSHOT.jar`
4. Update frontend `.env` with production API URL

### Frontend Deployment (Vercel/Netlify)

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables
5. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/{id}` - Get service details
- `POST /api/services` - Create service (provider/admin only)
- `PUT /api/services/{id}` - Update service (provider/admin only)
- `DELETE /api/services/{id}` - Delete service (admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Reviews
- `GET /api/reviews/service/{serviceId}` - Get reviews for a service
- `POST /api/reviews` - Create review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Admin
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings

## Default Admin Credentials

- Email: `admin@localservice.com`
- Password: `admin123`

**⚠️ Change these credentials in production!**

## License

MIT License

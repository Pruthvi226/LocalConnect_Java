# ServiceHub - Local Service Marketplace

ServiceHub is a modern, scalable full-stack web application that connects local service providers with service seekers. Built with Java Spring Boot, Hibernate, JWT authentication, MySQL, React, and Tailwind CSS.

## 🚀 Features

### For Service Seekers (Customers)
- **Separate Customer Login/Registration** - Dedicated authentication flow
- **Advanced Search & Filters** - Find services by category, location, price
- **Service Favorites** - Save favorite services for quick access
- **Booking Management** - View and manage all your bookings
- **Messaging System** - Direct communication with service providers
- **Reviews & Ratings** - Rate and review services
- **Payment Integration** - Secure payment processing
- **Real-time Notifications** - Stay updated on booking status

### For Service Providers
- **Separate Provider Login/Registration** - Dedicated authentication flow
- **Service Management Dashboard** - Create, update, and manage services
- **Booking Management** - View and manage customer bookings
- **Analytics & Insights** - Track service performance
- **Customer Messaging** - Communicate with customers
- **Payment Tracking** - Monitor payments and transactions
- **Service Availability** - Manage service availability status

### Technical Features
- **3D Animations** - Interactive 3D scenes using React Three Fiber
- **Modern UI/UX** - Beautiful Tailwind CSS design with smooth animations
- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Well-structured backend APIs
- **OOP Design Principles** - Clean, maintainable code architecture
- **Scalable Architecture** - Built for growth and performance

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** - JWT authentication
- **Hibernate/JPA** - ORM for database operations
- **MySQL** - Relational database
- **Maven** - Dependency management

### Frontend
- **React 18**
- **Tailwind CSS** - Utility-first CSS framework
- **React Three Fiber** - 3D graphics library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
ServiceHub/
├── backend/
│   ├── src/main/java/com/servicehub/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access layer
│   │   ├── model/          # Entity models
│   │   ├── dto/            # Data transfer objects
│   │   ├── security/       # Security configuration
│   │   └── config/         # Configuration classes
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/      # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── package.json
└── database/
    └── schema.sql          # Database schema
```

## 🗄️ Database Schema

The application uses the following main tables:
- **users** - User accounts (customers, providers, admins)
- **services** - Service listings
- **bookings** - Service bookings
- **reviews** - Service reviews and ratings
- **messages** - User-to-user messaging
- **notifications** - System notifications
- **payments** - Payment transactions
- **favorites** - User favorite services

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 16+ and npm
- MySQL 8.0+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Update `application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/servicehub
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build and run the application:
```bash
mvn clean install
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

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Database Setup

1. Create the database:
```sql
CREATE DATABASE servicehub;
```

2. Run the schema script:
```bash
mysql -u your_username -p servicehub < database/schema.sql
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/customer` - Register as customer
- `POST /api/auth/register/provider` - Register as provider
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `GET /api/services/{id}` - Get service by ID
- `POST /api/services` - Create service (Provider)
- `PUT /api/services/{id}` - Update service (Provider)
- `DELETE /api/services/{id}` - Delete service (Provider)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/unread` - Get unread messages

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/{id}/read` - Mark as read

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/booking/{bookingId}` - Get payment by booking

### Favorites
- `POST /api/favorites/{serviceId}` - Add to favorites
- `DELETE /api/favorites/{serviceId}` - Remove from favorites
- `GET /api/favorites` - Get user favorites

## 🎨 Design Features

- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **3D Animations** - Interactive 3D scenes on homepage
- **Responsive Design** - Works seamlessly on all devices
- **Smooth Animations** - Framer Motion for fluid transitions
- **Accessibility** - WCAG compliant design

## 🔒 Security

- JWT token-based authentication
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Input validation and sanitization

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**ServiceHub** - Connecting Local Service Providers with Service Seekers

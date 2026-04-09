# ProxiSense – Hyperlocal Service Marketplace

ProxiSense is a production-grade, full-stack service marketplace designed to connect customers with local experts in seconds. Built with a focus on speed, reliability, and modern aesthetics, it provides a seamless end-to-end experience for both users and service providers.

![ProxiSense Banner](https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features

- **Hyperlocal Discovery**: Real-time geolocation-based search to find the nearest professionals.
- **Smart Booking System**: Streamlined, secure booking flow with instant confirmations.
- **Real-time Tracking**: Live status updates for all active service requests.
- **Professional Dashboards**: Tailored experiences for both Customers and Service Providers.
- **Rich Communication**: Integrated messaging system for direct interaction with experts.
- **Verified Trust**: Comprehensive rating system and identity verification badges.
- **Responsive Design**: Premium, glassmorphic UI that works perfectly on all devices.

## 🛠️ Tech Stack

### Frontend
- **React 18** (Modern functional components & Hooks)
- **Tailwind CSS** (Utility-first styling for a custom design system)
- **Framer Motion** (Subtle micro-animations and smooth transitions)
- **Lucide React** (Clean, professional iconography)
- **Axios** (Centralized API client with JWT interceptors)

### Backend
- **Spring Boot** (Secure, scalable REST API)
- **Spring Security** (JWT-based session management)
- **Hibernate / JPA** (Efficient data persistence)
- **MySQL** (Relational data storage)

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- Java JDK 17+
- MySQL Server

### 1. Database Setup
Create a database named `localconnect`:
```sql
CREATE DATABASE localconnect;
```

### 2. Backend Configuration
Update `backend/src/main/resources/application.properties` with your credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/localconnect
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Running the Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 4. Frontend Configuration
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

### 5. Running the Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Security Standards

- **JWT Authentication**: Secure, stateless user sessions.
- **Request Interceptors**: Automatic token injection and 401 handling.
- **Role-Based Access Control**: Strict segregation of Customer, Provider, and Admin routes.
- **Data Integrity**: Backend validation layers to ensure consistent records.

## 🧪 Production Audit

- [x] **Zero Demo Text**: Hardcoded jargon and terminal-like terminology removed.
- [x] **Stable Routing**: Fixed all lazy-load paths and route guards.
- [x] **Performance**: Debounced search and optimized re-renders.
- [x] **UX Polishing**: Standardized labels (Service Providers, Customers, Bookings).

---

© 2026 ProxiSense AI. All rights reserved.

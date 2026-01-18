# Local Setup Guide

Follow this guide to set up and run the Local Service Finder application on your local machine.

## Prerequisites

- **Java JDK 17+** - [Download](https://adoptium.net/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **Maven 3.6+** - Usually comes with IDE or [Download](https://maven.apache.org/)

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd local-service-finder
```

## Step 2: Database Setup

1. **Start MySQL server**

2. **Create the database**
   ```sql
   CREATE DATABASE local_service_finder;
   ```

3. **Run the schema script**
   ```bash
   mysql -u root -p local_service_finder < database/schema.sql
   ```

4. **Load sample data (optional)**
   ```bash
   mysql -u root -p local_service_finder < database/sample-data.sql
   ```

   **Default admin credentials:**
   - Username: `admin`
   - Password: `password123`

## Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Configure database connection**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/local_service_finder
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

   Or set environment variables:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/local_service_finder
   export SPRING_DATASOURCE_USERNAME=root
   export SPRING_DATASOURCE_PASSWORD=your_password
   ```

3. **Set JWT secret** (optional, defaults provided)
   ```properties
   jwt.secret=your-secret-key-change-this-in-production-min-256-bits
   ```

4. **Build and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Or use your IDE to run `LocalServiceFinderApplication.java`

5. **Verify backend is running**
   - Open http://localhost:8080/api/services
   - You should see a JSON response (or empty array if no data)

## Step 4: Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Verify frontend is running**
   - Open http://localhost:3000
   - You should see the application homepage

## Step 5: Test the Application

1. **Register a new user**
   - Go to http://localhost:3000/register
   - Fill in the registration form
   - Click "Register"

2. **Login**
   - Go to http://localhost:3000/login
   - Use your credentials or default admin:
     - Username: `admin`
     - Password: `password123`

3. **Browse services**
   - Homepage shows all available services
   - Use filters to search by category, location, price

4. **Book a service**
   - Click on a service card
   - Select date/time
   - Click "Book Now"

5. **View bookings**
   - Go to "My Bookings" in the navbar
   - See all your bookings

6. **Admin Dashboard** (if logged in as admin)
   - Go to http://localhost:3000/admin
   - View analytics and statistics

## Troubleshooting

### Backend won't start

1. **Check Java version**
   ```bash
   java -version
   ```
   Should be 17 or higher

2. **Check MySQL is running**
   ```bash
   mysql -u root -p
   ```

3. **Check database connection**
   - Verify credentials in `application.properties`
   - Ensure database exists

4. **Check port 8080 is available**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Mac/Linux
   lsof -i :8080
   ```

### Frontend won't start

1. **Check Node.js version**
   ```bash
   node -v
   ```
   Should be 18 or higher

2. **Clear cache and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check port 3000 is available**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

### API calls failing

1. **Check backend is running** on http://localhost:8080

2. **Check CORS configuration** in `SecurityConfig.java`
   - Should allow `http://localhost:3000`

3. **Check `.env` file** has correct `REACT_APP_API_URL`

4. **Check browser console** for errors

### Database connection errors

1. **Verify MySQL is running**
   ```bash
   mysql -u root -p
   ```

2. **Check database exists**
   ```sql
   SHOW DATABASES;
   ```

3. **Verify user permissions**
   ```sql
   GRANT ALL PRIVILEGES ON local_service_finder.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

## Development Tips

1. **Hot Reload**
   - Backend: Spring Boot DevTools enables auto-restart
   - Frontend: React has hot module replacement

2. **Database Changes**
   - Hibernate will auto-update schema (set `spring.jpa.hibernate.ddl-auto=update`)
   - For production, use migrations or manual SQL

3. **API Testing**
   - Use Postman or curl to test endpoints
   - Example: `curl http://localhost:8080/api/services`

4. **Debugging**
   - Backend: Check console logs
   - Frontend: Use browser DevTools
   - Check Network tab for API calls

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the application for your needs
- Add more features and functionality
- Set up CI/CD pipeline
- Configure monitoring and logging

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in console/logs
3. Verify all prerequisites are installed correctly
4. Ensure database is set up properly

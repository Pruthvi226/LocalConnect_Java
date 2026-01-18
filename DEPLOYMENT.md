# Deployment Guide

This guide will help you deploy the Local Service Finder application to production.

## Prerequisites

- GitHub account (or similar Git hosting)
- MySQL database (can use cloud providers like AWS RDS, PlanetScale, or Railway)
- Accounts on deployment platforms:
  - Frontend: Vercel or Netlify
  - Backend: Render, Railway, or Heroku

## Backend Deployment

### Option 1: Render

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory
   - Build Command: `mvn clean package`
   - Start Command: `java -jar target/local-service-finder-0.0.1-SNAPSHOT.jar`

2. **Configure Environment Variables**
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/local_service_finder
   SPRING_DATASOURCE_USERNAME=your_db_username
   SPRING_DATASOURCE_PASSWORD=your_db_password
   JWT_SECRET=your-secret-key-min-256-bits-change-in-production
   JWT_EXPIRATION=86400000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. **Database Setup**
   - Create a MySQL database on Render or use an external provider
   - Run the schema script: `database/schema.sql`
   - Optionally load sample data: `database/sample-data.sql`

### Option 2: Railway

1. **Create a new project on Railway**
   - Connect your GitHub repository
   - Add a MySQL service
   - Add a new service from GitHub (select backend folder)

2. **Configure Environment Variables** (same as Render)

3. **Set up the database**
   - Use Railway's MySQL service or external provider
   - Run schema and sample data scripts

### Option 3: Heroku

1. **Install Heroku CLI and login**

2. **Create a new app**
   ```bash
   heroku create your-app-name
   ```

3. **Add MySQL addon**
   ```bash
   heroku addons:create cleardb:ignite
   ```

4. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set JWT_EXPIRATION=86400000
   # ... other variables
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Frontend Deployment

### Option 1: Vercel

1. **Import Project**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `frontend`

2. **Configure Build Settings**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

### Option 2: Netlify

1. **Create a new site**
   - Connect your GitHub repository
   - Set Base directory to `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

2. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add `REACT_APP_API_URL` and `REACT_APP_GOOGLE_MAPS_API_KEY`

3. **Deploy**
   - Click "Deploy site"

## Database Setup

### Using Cloud MySQL Providers

1. **AWS RDS**
   - Create MySQL instance
   - Note the endpoint, username, and password
   - Update backend environment variables

2. **PlanetScale**
   - Create a new database
   - Get connection string
   - Update backend environment variables

3. **Railway MySQL**
   - Add MySQL service in Railway
   - Use the connection string provided

### Running Schema Scripts

```bash
# Using MySQL CLI
mysql -h your-host -u your-username -p local_service_finder < database/schema.sql
mysql -h your-host -u your-username -p local_service_finder < database/sample-data.sql

# Or using MySQL Workbench / phpMyAdmin
# Import schema.sql and sample-data.sql files
```

## Post-Deployment Checklist

- [ ] Backend is accessible and API endpoints respond
- [ ] Frontend is accessible and loads correctly
- [ ] Database connection is working
- [ ] Authentication (login/register) works
- [ ] CORS is configured correctly (frontend URL in backend CORS config)
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is enabled (automatic on Vercel/Netlify/Render)
- [ ] Email service is configured (if using)
- [ ] Google Maps API key is set (if using maps feature)

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Verify database credentials
   - Check if database allows connections from your deployment IP
   - Ensure database exists

2. **CORS Errors**
   - Update `SecurityConfig.java` with your frontend URL
   - Check environment variables

3. **JWT Errors**
   - Ensure JWT_SECRET is set and is at least 256 bits
   - Check JWT_EXPIRATION value

### Frontend Issues

1. **API Connection Error**
   - Verify `REACT_APP_API_URL` is correct
   - Check CORS configuration on backend
   - Ensure backend is accessible

2. **Build Errors**
   - Check Node.js version (should be 18+)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Environment Variables Summary

### Backend
- `SPRING_DATASOURCE_URL` - MySQL connection string
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - Token expiration in milliseconds
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USERNAME` - Email username
- `EMAIL_PASSWORD` - Email password/app password
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

### Frontend
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

## Security Notes

1. **Never commit sensitive data** to version control
2. **Use strong JWT secrets** (at least 256 bits)
3. **Enable HTTPS** (automatic on most platforms)
4. **Use environment variables** for all configuration
5. **Regularly update dependencies** for security patches
6. **Use strong database passwords**
7. **Limit database access** to necessary IPs only

## Monitoring

Consider setting up:
- Application monitoring (e.g., Sentry)
- Log aggregation (e.g., Logtail, Papertrail)
- Uptime monitoring (e.g., UptimeRobot)
- Database monitoring (provided by cloud providers)

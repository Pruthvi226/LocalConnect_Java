# Environment Variables Guide

This document describes all environment variables needed for the Local Service Finder application.

## Backend Environment Variables

Create a `.env` file in the `backend` directory or set these as environment variables in your deployment platform.

### Database Configuration

```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/local_service_finder?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
```

**Description:**
- `SPRING_DATASOURCE_URL`: MySQL database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

**Production Example:**
```env
SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/local_service_finder?useSSL=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=db_user
SPRING_DATASOURCE_PASSWORD=secure_password_123
```

### JWT Configuration

```env
JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits
JWT_EXPIRATION=86400000
```

**Description:**
- `JWT_SECRET`: Secret key for signing JWT tokens (minimum 256 bits recommended)
- `JWT_EXPIRATION`: Token expiration time in milliseconds (86400000 = 24 hours)

**Security Note:** Use a strong, random secret key in production. Generate one using:
```bash
openssl rand -base64 32
```

### Email Configuration (Optional)

```env
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

**Description:**
- `SPRING_MAIL_HOST`: SMTP server hostname
- `SPRING_MAIL_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `SPRING_MAIL_USERNAME`: Email account username
- `SPRING_MAIL_PASSWORD`: Email account password or app-specific password

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
3. Use the app password in `SPRING_MAIL_PASSWORD`

**Other Email Providers:**
- **Outlook/Hotmail:** `smtp-mail.outlook.com`, port 587
- **Yahoo:** `smtp.mail.yahoo.com`, port 587
- **SendGrid:** `smtp.sendgrid.net`, port 587

### Google Maps API (Optional)

```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Description:**
- `GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)

### Server Configuration

```env
SERVER_PORT=8080
```

**Description:**
- `SERVER_PORT`: Port number for the Spring Boot application (default: 8080)

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory or set these as environment variables in your deployment platform.

**Note:** All React environment variables must start with `REACT_APP_`

### API Configuration

```env
REACT_APP_API_URL=http://localhost:8080/api
```

**Description:**
- `REACT_APP_API_URL`: Base URL for the backend API

**Production Example:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### Google Maps API (Optional)

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Description:**
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key (same as backend)

**Note:** This is optional. If not set, the map feature will be disabled gracefully.

## Local Development Setup

### Backend

1. Copy `.env.example` to `.env` in the `backend` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` with your local configuration:
   ```env
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/local_service_finder
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=your_local_password
   JWT_SECRET=local-dev-secret-key-change-in-production
   ```

3. The application will read from `.env` file automatically (if using Spring Boot 2.4+)

### Frontend

1. Copy `.env.example` to `.env` in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` with your local configuration:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```

3. Restart the development server after changing `.env`:
   ```bash
   npm start
   ```

## Production Deployment

### Backend (Render/Railway/Heroku)

Set environment variables in your platform's dashboard:

**Render:**
- Go to your service → Environment
- Add each variable

**Railway:**
- Go to your service → Variables
- Add each variable

**Heroku:**
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SPRING_DATASOURCE_URL=jdbc:mysql://...
# ... etc
```

### Frontend (Vercel/Netlify)

**Vercel:**
- Go to Project Settings → Environment Variables
- Add `REACT_APP_API_URL` and `REACT_APP_GOOGLE_MAPS_API_KEY`

**Netlify:**
- Go to Site Settings → Environment Variables
- Add `REACT_APP_API_URL` and `REACT_APP_GOOGLE_MAPS_API_KEY`

## Environment Variable Priority

1. **System Environment Variables** (highest priority)
2. **`.env` file** (for local development)
3. **`application.properties`** (defaults/fallback)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT_SECRET (minimum 256 bits)
3. **Rotate secrets regularly** in production
4. **Use different secrets** for development and production
5. **Restrict API keys** to specific domains/IPs when possible
6. **Use environment-specific values** (dev, staging, prod)
7. **Encrypt sensitive values** in production environments

## Troubleshooting

### Backend can't read environment variables

- Ensure `.env` file is in the `backend` directory
- Check variable names match exactly (case-sensitive)
- Restart the Spring Boot application
- For Spring Boot 2.4+, ensure `spring.config.import=optional:file:.env[.properties]` is in `application.properties`

### Frontend can't read environment variables

- Ensure variables start with `REACT_APP_`
- Restart the development server after changing `.env`
- Check `.env` file is in the `frontend` directory
- Clear browser cache and rebuild: `npm run build`

### Google Maps not loading

- Verify API key is set correctly
- Check API key restrictions in Google Cloud Console
- Ensure "Maps JavaScript API" is enabled
- Check browser console for errors

### Database connection errors

- Verify database is running
- Check connection URL format
- Ensure database exists
- Verify username/password are correct
- Check firewall rules allow connections

## Example `.env` Files

### Backend `.env.example`

```env
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/local_service_finder?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits
JWT_EXPIRATION=86400000

# Email (Optional)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Server
SERVER_PORT=8080
```

### Frontend `.env.example`

```env
# API
REACT_APP_API_URL=http://localhost:8080/api

# Google Maps (Optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

# 🚀 ProxiSense: Production Deployment Master Checklist

Use this guide to configure your environment variables in **Render** (Backend/ML) and **Vercel** (Frontend).

## 1. Java Backend (Render - Web Service)
Set these variables in **Dashboard > Environment**:

| Variable Name | Value / Description |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://<your-db-host>:3306/<db-name>?useSSL=true` |
| `SPRING_DATASOURCE_USERNAME` | Your production DB username |
| `SPRING_DATASOURCE_PASSWORD` | Your production DB password |
| `JWT_SECRET` | A random 256-bit string (e.g., `openssl rand -base64 32`) |
| `GEMINI_API_KEY` | Your Google AI API Key |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `ML_SERVICE_URL` | `https://your-ml-service.onrender.com` |
| `UPLOAD_DIR` | `uploads` (or configure S3/Cloudinary for persistence) |

---

## 2. ML Microservice (Render - Web Service)
Set these variables in **Dashboard > Environment**:

| Variable Name | Value / Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Same key as the Java Backend |
| `JAVA_BACKEND_URL` | `https://your-java-backend.onrender.com/api` |
| `REDIS_HOST` | Your Redis instance host (e.g., Upstash or Render Redis) |
| `REDIS_PORT` | `6379` (standard) |
| `AI_TIMEOUT_SECONDS` | `2.0` (increase for production stability) |

---

## 3. React Frontend (Vercel)
Set these variables in **Project Settings > Environment Variables**:

| Variable Name | Value / Description |
| :--- | :--- |
| `REACT_APP_API_URL` | `https://your-java-backend.onrender.com/api` |
| `REACT_APP_WS_URL` | `https://your-java-backend.onrender.com/ws` |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Your production-restricted Maps key |
| `CI` | `false` |

---

## 🛠️ Final Deployment Steps
1. **Database**: Run `database/schema.sql` on your production MySQL instance.
2. **Persistence**: Ensure your Render Web Service has a **Disk** attached if using local file uploads, or integrate a cloud storage provider.
3. **SSL**: Render and Vercel provide SSL automatically. Ensure `SPRING_DATASOURCE_URL` includes `?useSSL=true`.
4. **Monitoring**: Check logs in Render for any `BeanCreationException` or `ConnectionRefused` errors during startup.

> [!TIP]
> **Proactive Check**: Test the AI Search with "help with leaky pipes" immediately after deployment to verify the connection between Frontend -> Java Backend -> Python ML -> Gemini API.

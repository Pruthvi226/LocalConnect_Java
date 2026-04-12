FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# These build args are supplied by docker-compose or your CI/CD pipeline.
# They are baked into the React bundle at build time.
# Do NOT hardcode production URLs here — pass them via --build-arg or compose env.
ARG REACT_APP_API_URL=http://localhost:8080/api
ARG REACT_APP_WS_URL=http://localhost:8080/ws
ARG REACT_APP_GOOGLE_MAPS_API_KEY=
ARG REACT_APP_RAZORPAY_KEY_ID=

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_RAZORPAY_KEY_ID=$REACT_APP_RAZORPAY_KEY_ID

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

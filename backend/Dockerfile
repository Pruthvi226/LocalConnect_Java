# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first for layer caching of dependencies
COPY pom.xml .

# Download dependencies separately (without go-offline which can fail on Render)
RUN mvn dependency:resolve -B -q || true

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Memory-optimized JVM flags for Render free tier (512MB RAM)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]

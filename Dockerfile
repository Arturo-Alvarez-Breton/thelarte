# Multi-stage Dockerfile for TheLarte Spring Boot Application optimized for Railway
FROM openjdk:17-jdk-slim AS builder

# Set working directory
WORKDIR /app

# Set Gradle options for better network handling and performance
ENV GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false -Dorg.gradle.configureondemand=false"
ENV GRADLE_USER_HOME=/app/.gradle

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable and download dependencies with retry logic
RUN chmod +x ./gradlew && \
    for i in 1 2 3; do \
        ./gradlew --version --no-daemon --console=plain && break || \
        (echo "Gradle download attempt $i failed, retrying..." && sleep 10); \
    done

# Copy source code
COPY src/ src/

# Build the application with increased timeouts
RUN ./gradlew build -x test --no-daemon --console=plain \
    -Dorg.gradle.internal.http.socketTimeout=120000 \
    -Dorg.gradle.internal.http.connectionTimeout=120000

# Production stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks and create non-root user
RUN apk add --no-cache curl && \
    addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G appuser appuser

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/build/libs/thelarte-app-1.0.0.jar app.jar

# Create uploads directory and set ownership
RUN mkdir -p uploads && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-8080}

# Set production profile as default
ENV SPRING_PROFILES_ACTIVE=prod

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application with optimized JVM settings for Railway
CMD ["java", \
     "-XX:+UseContainerSupport", \
     "-XX:MaxRAMPercentage=75.0", \
     "-XX:+UnlockExperimentalVMOptions", \
     "-XX:+UseZGC", \
     "-Djava.security.egd=file:/dev/./urandom", \
     "-Dserver.port=${PORT:-8080}", \
     "-jar", "app.jar"]
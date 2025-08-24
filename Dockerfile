# Dockerfile for TheLarte Spring Boot Application
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src/ src/

# Make gradlew executable
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew build -x test

# Expose port 8080
EXPOSE 8080

# Set production profile as default
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
CMD ["java", "-jar", "build/libs/thelarte-app-1.0.0.jar"]
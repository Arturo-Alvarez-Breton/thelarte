# Multi-stage Dockerfile for TheLarte Microservices
# This Dockerfile builds all microservices in a single build stage and creates separate service images

# Build stage - compiles all services
FROM gradle:8.5-jdk17-alpine AS builder

WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew gradlew.bat ./
COPY gradle/ gradle/
COPY settings.gradle build.gradle ./

# Copy all source code
COPY shared-library/ shared-library/
COPY discovery-service/ discovery-service/
COPY api-gateway/ api-gateway/
COPY microservices/ microservices/

# Make gradlew executable
RUN chmod +x ./gradlew

# Build all services
RUN ./gradlew clean build -x test

# Discovery Service
FROM eclipse-temurin:17-jre-alpine AS discovery-service
WORKDIR /app
COPY --from=builder /app/discovery-service/build/libs/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]

# API Gateway
FROM eclipse-temurin:17-jre-alpine AS api-gateway
WORKDIR /app
COPY --from=builder /app/api-gateway/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Auth Service
FROM eclipse-temurin:17-jre-alpine AS auth-service
WORKDIR /app
COPY --from=builder /app/microservices/auth-service/build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

# User Service
FROM eclipse-temurin:17-jre-alpine AS user-service
WORKDIR /app
COPY --from=builder /app/microservices/user-service/build/libs/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]

# Inventory Service
FROM eclipse-temurin:17-jre-alpine AS inventory-service
WORKDIR /app
COPY --from=builder /app/microservices/inventory-service/build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

# Sales Service
FROM eclipse-temurin:17-jre-alpine AS sales-service
WORKDIR /app
COPY --from=builder /app/microservices/sales-service/build/libs/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

# Billing Service
FROM eclipse-temurin:17-jre-alpine AS billing-service
WORKDIR /app
COPY --from=builder /app/microservices/billing-service/build/libs/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]

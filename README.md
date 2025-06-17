# TheLarte

TheLarte is a furniture store management system implemented as a single Spring Boot application. The project was originally split into several microservices but has been consolidated into one application for simplicity.

## Running the application

The application can be run directly with Gradle:

```bash
./gradlew bootRun
```

The application will be available on [http://localhost:8080](http://localhost:8080).

The default profile uses an in-memory H2 database. For a persistent database supply the `SPRING_PROFILES_ACTIVE=prod` environment variable and configure `POSTGRES_PASSWORD` if PostgreSQL is used.

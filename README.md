# TheLarte

TheLarte is a furniture store management system implemented as a single Spring Boot application. The project was originally split into several microservices but has been consolidated into one application for simplicity.

## Running the application

The easiest way to run the project is using Docker Compose:

```bash
# build the image and start a PostgreSQL instance
docker compose up --build
```

The application will be available on [http://localhost:8080](http://localhost:8080).

During development you can also run the application directly with Gradle:

```bash
./gradlew bootRun
```

The default profile uses an in-memory H2 database. For a persistent database supply the `SPRING_PROFILES_ACTIVE=prod` environment variable and set `POSTGRES_PASSWORD` when starting Docker Compose.

# Running The Larte

The system is distributed as a single Spring Boot application. Docker Compose is provided to run the application together with PostgreSQL.

```bash
# build and start containers
docker compose up --build
```

By default the application exposes HTTP port `8080`. During development you can use the in-memory H2 database instead:

```bash
./gradlew bootRun
```

Set `SPRING_PROFILES_ACTIVE=prod` to use PostgreSQL when running with Docker.

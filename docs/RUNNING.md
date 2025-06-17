# Running The Larte

The system is distributed as a single Spring Boot application. You can run the application directly using Gradle.

```bash
./gradlew bootRun
```

By default the application exposes HTTP port `8080`. During development you can use the in-memory H2 database.

Set `SPRING_PROFILES_ACTIVE=prod` to use PostgreSQL if needed.

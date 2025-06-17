# TheLarte

TheLarte is a furniture store management system implemented as a single Spring Boot application. The project was originally split into several microservices but has been consolidated into one application for simplicity.

## Running the application

The application can be run directly with Gradle. From the project root execute:

```bash
./gradlew bootRun
```

Open the project in Visual Studio Code and run the `Application` class from the
IDE to start the server. The application will be available on
[http://localhost:8080](http://localhost:8080).

The default profile uses an in-memory H2 database. For a persistent database
you can supply the `SPRING_PROFILES_ACTIVE=prod` environment variable and set
`POSTGRES_PASSWORD` to connect to PostgreSQL.


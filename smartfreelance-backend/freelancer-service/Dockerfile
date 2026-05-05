FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only pom first (better caching)
COPY pom.xml .

# Download dependencies (fails if network is broken, but improves performance later)
RUN mvn -B dependency:go-offline

# Now copy source
COPY src ./src

# Build project
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

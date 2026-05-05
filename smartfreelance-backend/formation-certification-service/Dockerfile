# =========================
# BUILD STAGE
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

ENV MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository"

# Copy pom first (cache dependencies)
COPY pom.xml .

# Only resolve what is needed (FAST + SAFE)
RUN mvn -B dependency:resolve-plugins dependency:resolve --no-transfer-progress

# Copy source
COPY src ./src

# Build project
RUN mvn -B clean package -DskipTests --no-transfer-progress


# =========================
# RUNTIME STAGE
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]

# =========================
# BUILD STAGE (FAST + CACHED)
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Maven cache inside container (important)
ENV MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository"

# Copy ONLY pom first (max cache efficiency)
COPY pom.xml .

# Pre-download dependencies (safe + fast)
RUN mvn -B dependency:go-offline --no-transfer-progress

# Copy source code
COPY src ./src

# Build (fast + skip tests)
RUN mvn -B clean package -DskipTests --no-transfer-progress


# =========================
# RUNTIME STAGE (LIGHTWEIGHT)
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar only
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8084

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]

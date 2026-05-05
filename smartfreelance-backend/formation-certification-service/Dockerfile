# =========================
# STAGE 1: BUILD
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Optional but helps Maven stability in Docker/Jenkins
ENV MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository"

# Create Maven cache folder
RUN mkdir -p /root/.m2

# Copy only pom first (better caching)
COPY pom.xml .

# (OPTIONAL FIX FOR SSL / NETWORK ISSUES)
# If your network is unstable, this helps Maven trust connections
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Download dependencies (SAFE version - no go-offline crash)
RUN mvn -B dependency:resolve-plugins dependency:resolve --no-transfer-progress

# Copy source code
COPY src ./src

# Build application
RUN mvn -B clean package -DskipTests --no-transfer-progress


# =========================
# STAGE 2: RUNTIME
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (change if your app uses different port)
EXPOSE 8084

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]

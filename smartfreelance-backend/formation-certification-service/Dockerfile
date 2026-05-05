# =========================
# Stage 1: BUILD
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy only pom first (cache dependencies)
COPY pom.xml .

# Download dependencies once (cached layer)
RUN mvn -B dependency:go-offline --no-transfer-progress

# Copy source
COPY src ./src

# Build project
RUN mvn -B clean package -DskipTests --no-transfer-progress


# =========================
# Stage 2: RUNTIME
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]

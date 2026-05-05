# =========================
# STAGE 1: BUILD (minimal work)
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy only pom first (for cache)
COPY pom.xml .

# Copy source
COPY src ./src

# Build directly (NO dependency phases, NO extra steps)
RUN mvn -B clean package -DskipTests --no-transfer-progress


# =========================
# STAGE 2: RUNTIME (very light)
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]

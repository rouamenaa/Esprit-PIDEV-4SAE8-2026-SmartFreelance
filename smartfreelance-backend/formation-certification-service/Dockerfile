# =========================
# Stage 1: BUILD
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# 1. Copy pom first (cache dependencies)
COPY pom.xml .

# 2. Download dependencies (cached layer)
RUN mvn -T 1C dependency:go-offline -B

# 3. Copy source code
COPY src ./src

# 4. Build project
RUN mvn -T 1C clean package -DskipTests

# =========================
# Stage 2: RUNTIME
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar
COPY --from=build /app/target/*.jar app.jar

# Port
EXPOSE 8084

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]

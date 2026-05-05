# =========================
# Stage 1: BUILD
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# ✅ cache Maven (IMPORTANT)
RUN mkdir -p /root/.m2

# 1. Copy pom first
COPY pom.xml .

# 2. Preload dependencies
RUN mvn -B -T 1C dependency:go-offline --no-transfer-progress

# 3. Copy source code
COPY src ./src

# 4. Build (fast + parallel + no logs spam)
RUN mvn -B -T 1C clean package -DskipTests --no-transfer-progress

# =========================
# Stage 2: RUNTIME
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]

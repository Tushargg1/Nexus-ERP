# ============================================================
#  Nexus ERP - Single-container build for Render
#  Stage 1: build the React frontend (website mode)
#  Stage 2: build the Spring Boot JAR (bundles the frontend)
#  Stage 3: slim runtime image that runs the JAR
# ============================================================

# ---- Stage 1: Frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
# Install deps first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci
# Build the frontend; output goes to backend static folder via vite config
COPY frontend/ ./
# Use the website build (full SaaS site). Output to a local dist we then copy.
RUN npm run build

# ---- Stage 2: Backend (Maven) ----
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app/backend
# Cache dependencies
COPY backend/pom.xml ./
RUN mvn -q -e -DskipTests dependency:go-offline || true
# Copy backend sources
COPY backend/ ./
# Bring in the built frontend so Spring Boot serves it as static content
COPY --from=frontend /app/frontend/dist/ ./src/main/resources/static/
# Build the executable JAR (skip tests for faster, deterministic deploys)
RUN mvn -q -DskipTests clean package

# ---- Stage 3: Runtime ----
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
# Copy the built executable JAR (exclude the *.jar.original produced by Spring Boot repackage)
COPY --from=backend /app/backend/target/garment-erp-*.jar app.jar
# Render provides the PORT env var; the app reads it via ${PORT:8080}
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]

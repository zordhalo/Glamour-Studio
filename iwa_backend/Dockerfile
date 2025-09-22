# Use OpenJDK 21 as base image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for better layer caching)
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (separate layer for better caching)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose the port that Spring Boot uses (default 8080)
EXPOSE 8080

# Run the jar file
CMD ["java", "-jar", "target/iwa_backend-0.0.1-SNAPSHOT.jar"]
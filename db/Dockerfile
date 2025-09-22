FROM postgres:latest

# Set environment variables
ENV POSTGRES_DB=makeup_service_db
ENV POSTGRES_USER=makeup_user
ENV POSTGRES_PASSWORD=makeup_password

# Copy initialization script
COPY ./create_tables.sql /docker-entrypoint-initdb.d/
RUN chmod 755 /docker-entrypoint-initdb.d/create_tables.sql

# Expose PostgreSQL port
EXPOSE 5432
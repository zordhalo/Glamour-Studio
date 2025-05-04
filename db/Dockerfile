FROM postgres:latest

COPY ./create_tables.sql /docker-entrypoint-initdb.d/
RUN chmod 755 /docker-entrypoint-initdb.d/create_tables.sql
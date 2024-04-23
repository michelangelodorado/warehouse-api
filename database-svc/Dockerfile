FROM postgres:latest

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=warehouse_db

COPY init.sql /docker-entrypoint-initdb.d/


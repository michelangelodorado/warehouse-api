# Use Alpine Linux as the base image
FROM alpine:latest

# Install SQLite
RUN apk add --no-cache sqlite

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the SQLite database file into the container
COPY ./shared/database/warehouse.db /usr/src/app/shared/database/warehouse.db

# Expose the SQLite database directory as a volume
VOLUME /usr/src/app/shared/database

# Rebuild SQLite module if necessary (ensure Node.js is available)
RUN npm install -g node-gyp
RUN npm install sqlite3 --build-from-source

# Set the default command to run SQLite shell or your custom script if needed
CMD ["sqlite3", "/usr/src/app/shared/database/warehouse.db"]

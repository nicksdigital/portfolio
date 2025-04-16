#!/bin/bash

# Database configuration
DB_NAME="portfoliodb"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST > /dev/null 2>&1; then
  echo "Starting PostgreSQL 14..."
  brew services start postgresql@14
  sleep 3  # Wait for PostgreSQL to start
fi

# Create database if it doesn't exist
if ! psql -h $DB_HOST -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Creating database: $DB_NAME"
  createdb -h $DB_HOST -U $DB_USER $DB_NAME
else
  echo "Database $DB_NAME already exists"
fi

# Set environment variable
export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME"

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Seed database
echo "Seeding database with initial data..."
npm run db:seed

echo "Database setup completed successfully!"

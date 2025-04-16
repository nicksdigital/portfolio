#!/bin/bash

# Database configuration
DB_NAME="portfoliodb"
DB_USER="postgres"  # Changed to your username
DB_HOST="localhost"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST > /dev/null 2>&1; then
  echo "Starting PostgreSQL 14..."
  brew services start postgresql@14
  sleep 3
fi

# Create database if it doesn't exist
if ! psql -h $DB_HOST -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Creating database: $DB_NAME"
  createdb $DB_NAME
else
  echo "Database $DB_NAME already exists"
fi

# Set environment variable - no password authentication
export DATABASE_URL="postgres://$DB_USER@$DB_HOST:5432/$DB_NAME"

# Create a .env file
echo "DATABASE_URL=postgres://$DB_USER@$DB_HOST:5432/$DB_NAME" > .env

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Seed database
echo "Seeding database with initial data..."
npm run db:seed

echo "Database setup completed successfully!"

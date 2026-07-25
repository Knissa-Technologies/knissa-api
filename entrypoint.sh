#!/bin/sh

echo "🚀 Generating Prisma Client..."
npx prisma generate

echo "📦 Running Prisma Migrations..."
npx prisma migrate deploy

echo "▶️ Starting Knissa API..."
node dist/server.js
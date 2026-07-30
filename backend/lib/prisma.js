const { PrismaClient } = require('@prisma/client');

// Reuse a single Prisma Client instance across the app (avoids exhausting
// the DB connection pool, especially important with hot-reload in dev)
const prisma = new PrismaClient();

module.exports = prisma;

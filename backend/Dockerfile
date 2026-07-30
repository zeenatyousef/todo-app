FROM node:18-alpine

WORKDIR /app

# Prisma's query engine needs openssl to be present on Alpine (musl) images
RUN apk add --no-cache openssl

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy rest of the source code
COPY . .

# Generate Prisma client based on schema
RUN npx prisma generate

EXPOSE 5000

# Apply migrations then start the server
CMD npx prisma migrate deploy && node server.js

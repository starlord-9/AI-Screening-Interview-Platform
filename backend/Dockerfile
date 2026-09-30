# Production Dockerfile for TalentMind AI Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install openssl for prisma
RUN apk add --no-cache openssl ffmpeg

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Create uploads directory for candidate recordings and resumes
RUN mkdir -p /app/uploads/resumes /app/uploads/recordings

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && node dist/server.js"]

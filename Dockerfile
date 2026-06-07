FROM node:20-alpine AS builder
WORKDIR /app
COPY signaling-server/package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY signaling-server/server.js ./server.js
COPY signaling-server/public     ./public
EXPOSE 8080
USER node
CMD ["node","server.js"]

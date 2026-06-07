FROM node:20-alpine AS builder
WORKDIR /app
COPY signaling-server/package*.json ./signaling-server/
RUN cd signaling-server && npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/signaling-server/node_modules ./signaling-server/node_modules
COPY signaling-server/server.js ./signaling-server/server.js
COPY signaling-server/public     ./signaling-server/public
EXPOSE 8080
USER node
CMD ["node","./signaling-server/server.js"]

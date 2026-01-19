FROM node:18-alpine

WORKDIR /app

# Copy server package files and install production dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy pre-built dist folders
COPY client/dist ./client/dist
COPY server/dist ./server/dist

# Expose port
EXPOSE 3001

# Set working directory to server and run
WORKDIR /app/server
CMD ["node", "dist/index.js"]

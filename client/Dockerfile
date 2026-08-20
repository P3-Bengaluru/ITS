# Build stage: compile the Vite React app
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from lockfile for reproducibility
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage: serve the built assets with serve
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
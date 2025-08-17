# Stage 1: The Builder Stage
# We use a full Node.js image to install dependencies, including devDependencies,
# which might be needed for building or testing.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install all dependencies. Using `npm install` instead of `npm ci` to avoid
# sync issues between package.json and package-lock.json during development.
RUN npm install

# Copy the rest of the application source code
COPY . .

# -----------------------------------------------------------------------------

# Stage 2: The Production Stage
# This stage uses a slim Node.js image and copies only what's needed
# from the builder stage to create a small, optimized final image.
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the builder stage
COPY --from=builder /usr/src/app/package*.json ./

# Install ONLY production dependencies.
RUN npm install --omit=dev

# Copy the application code from the builder stage
COPY --from=builder /usr/src/app .

# Expose port 4000 to the outside world
EXPOSE 4000

# Best practice: Create and use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Define the command to run your application
# Replace 'server.js' with the entry point file of your Express app.
CMD [ "node", "dist/index.js" ]

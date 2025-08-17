# Stage 1: Build Stage
# Use an official Node.js runtime as a parent image.
# Using a specific version (e.g., 20) is recommended for consistency.
FROM node:20-alpine AS builder

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first.
# This leverages Docker's layer caching. These files don't change often,
# so Docker won't need to re-run `npm install` on every build unless they change.
COPY package*.json ./

# Install project dependencies.
# Using `npm ci` is recommended for CI/CD environments as it provides faster,
# more reliable builds by using the package-lock.json.
RUN npm ci --only=production

# Copy the rest of the application source code.
COPY . .

# ---

# Stage 2: Production Stage
# Use a smaller, more secure base image for the final image.
FROM node:20-alpine

# Set the working directory.
WORKDIR /usr/src/app

# Create a non-root user for security purposes.
# Running containers as a non-root user is a security best practice.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the installed dependencies and source code from the builder stage.
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Expose the port the app runs on.
# Change 3000 to whatever port your Express app listens on.
EXPOSE 3000

# Define the command to run the application.
# This is the command that will be executed when the container starts.
CMD [ "NODE_ENV=production", "node", "dist/index.js" ]

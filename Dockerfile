# Use official Node.js 22 image
FROM node:22

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install only production dependencies
# TODO add in --omit=dev bug get unit tests to work
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Expose the port your Fastify app listens on (default 3000)
EXPOSE 3000

# Start the Fastify server
CMD ["npm", "start"]
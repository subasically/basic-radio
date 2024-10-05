# Use the official Node.js image for AMD64 architecture
FROM --platform=linux/amd64 node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies (without frozen lockfile)
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the Nuxt application
RUN yarn build

# Expose the port that the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]

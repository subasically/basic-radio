# Use an official Node.js image as a base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Nuxt app for production
RUN npm run build

# Expose port (default for Nuxt is 3000)
EXPOSE 3000

# Start the Nuxt app
CMD ["npm", "run", "start"]

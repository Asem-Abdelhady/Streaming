# Use an official Node.js runtime as a parent image
FROM node:20-buster

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Build your React project
RUN npm run build

# Expose a port (if your app requires one)
EXPOSE 5173

# Define the command to run your app
CMD ["npm", "start"]

FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host"]

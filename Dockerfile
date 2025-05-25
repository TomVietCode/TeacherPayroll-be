FROM node:18-alpine

WORKDIR /app

# Thiết lập môi trường cho pnpm
ENV PNPM_HOME=/usr/local/bin
ENV PATH=$PNPM_HOME:$PATH

# Install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm 

RUN pnpm install 
# COPY source code
COPY . .

# generate Prisma client
RUN npx prisma generate

EXPOSE 5000

# Run the application
CMD ["node", "src/app.js"]
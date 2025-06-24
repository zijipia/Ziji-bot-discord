FROM node:22.14.0

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

EXPOSE 2003

CMD ["node", "index.js"]

# Build Comamnd
# docker build -t zibot .
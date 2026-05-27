FROM node:20-slim

WORKDIR /app

COPY client/ ./client
COPY server/ ./server
COPY package.json package.json

RUN npm install

EXPOSE 9000

CMD ["npm", "start"]
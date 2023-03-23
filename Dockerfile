FROM node:lts-alpine
RUN npm install -g http-server
WORKDIR /ui
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14 AS server-build
WORKDIR /api
COPY package.json .
RUN npm install
COPY . .


EXPOSE 8080

CMD ["node", "./api/server.js"]
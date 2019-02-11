FROM node:8-alpine

WORKDIR /opt/backstage

COPY package.json ./package.json

RUN npm install

COPY src/ .

CMD ["npm", "start"]

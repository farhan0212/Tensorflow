FROM node:lts-buster AS development

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

RUN ["npm", "run", "start"]
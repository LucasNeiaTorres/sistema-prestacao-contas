FROM node:18.18.0-alpine as build

WORKDIR /app

RUN npm install -g @angular/cli@16

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN ng analytics off

CMD [ "ng", "serve", "--host", "0.0.0.0" ]
EXPOSE 4200
FROM node:18-alpine

RUN apk update && apk add bash

WORKDIR /app

COPY . /app
COPY ./docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh && \
    npm install

EXPOSE 3000

CMD ['./docker-entrypoint.sh']

FROM node:22-alpine

RUN apk update && apk add bash

WORKDIR /app

COPY ./ /app

RUN npm install

EXPOSE 5173

CMD ["npx","vite","--host","0.0.0.0"]
FROM node:carbon

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN yarn --pure-lockfile

CMD ["yarn", "start:dev"]
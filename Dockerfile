FROM node:18-alpine
ENV NODE_ENV=production

# syntax=docker/dockerfile:1

ENV NODE_ENV=production

WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node . .

RUN npm install typescript -g

USER node

COPY ["package.json", "package-lock.json*", "./"]


RUN npm run build &&\
    npm run deploy
CMD ["npm", "start"]

FROM node:21

ENV NODE_ENV=production

WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node . .

RUN npm install typescript -g

USER node

COPY ["package.json", "package-lock.json*", "./"]

RUN npm run build &&\
    npm run deploy

# Playwright Installation #
RUN npx playwright install

## Temporarily switch to root for installing dependencies
USER root
RUN npx playwright install-deps

## Switch back to a non-root user for running the application
USER node

CMD ["npm", "start"]

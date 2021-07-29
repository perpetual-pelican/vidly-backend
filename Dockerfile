# syntax=docker/dockerfile:1
FROM node:14.16.0 as base
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "./"]

FROM base as test
RUN npm ci --ignore-scripts
COPY . .
CMD ["npm", "test"]

FROM base as prod
RUN npm ci --production --ignore-scripts
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]

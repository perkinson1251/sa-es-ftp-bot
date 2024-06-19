FROM node:20
WORKDIR /saes/bot
COPY ./package.json ./
RUN npm install
COPY ./src ./src
COPY ./.env ./
COPY ./tsconfig.json ./
RUN npm run build
CMD ["npm", "start"]

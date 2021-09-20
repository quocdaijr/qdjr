FROM node:14

COPY ./ ./

RUN npm install -g nuxt create-nuxt-app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
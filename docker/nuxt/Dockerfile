FROM node:18

WORKDIR /var/www/html/qdjr

COPY . .

RUN npm install -g nuxt #create-nuxt-app

RUN npm install

RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime

EXPOSE 3000

CMD ["npm", "run", "dev"]

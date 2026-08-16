# bookworm (not -slim): better-sqlite3, required by @nuxt/content v3, falls back
# to a source build when no prebuild matches and needs python3/make/g++.
FROM node:24.19.0-bookworm

WORKDIR /var/www/html/qdjr

COPY . .

RUN npm install

RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM node:16.3.0-stretch-slim
WORKDIR /app
COPY package.json /app
RUN apt-get update
RUN apt-get install -y python3 && ln -sf python3 /usr/bin/python
RUN apt-get install -y python3-pip
RUN pip3 install --no-cache --upgrade pip setuptools
COPY . /app
RUN npm i -D sqlite3 && rm -rf node_modules && npm install && npm rebuild
RUN npm i --save-dev sequelize-cli
RUN npx sequelize-cli db:migrate
CMD ["npm", "start"]

FROM node:16.3.0-stretch-slim
WORKDIR /app
COPY package.json /app
COPY . /app
ADD /photos /app/photos
RUN apt-get update
RUN apt-get install -y python3 && ln -sf python3 /usr/bin/python
RUN apt-get install -y python3-pip
RUN pip3 install --no-cache --upgrade pip setuptools

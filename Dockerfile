FROM node:16-buster
WORKDIR /app
COPY . /app
RUN apt-get update
RUN apt-get install -y python3 && ln -sf python3 /usr/bin/python
RUN apt-get install -y python3-pip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apt-get install -y git
RUN apt-get install -y automake autoconf libxml2-dev curl pkg-config s3fs
RUN rm -rf node_modules
RUN npm install
#RUN s3fs gmedia photos -o passwd_file=./passwd-s3fs -o url=https://s3.smartmanagement.id -o endpoint=us-east-1 -o use_path_request_style

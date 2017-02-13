FROM node:latest
MAINTAINER Ives van Hoorne

RUN npm install -g yarn
RUN npm config set @codesandbox:registry http://codesandbox.dev/registry

RUN mkdir /usr/src/app

WORKDIR /usr/src/app

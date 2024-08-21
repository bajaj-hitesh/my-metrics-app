FROM registry.access.redhat.com/ubi8/nodejs-18

USER root

COPY . .

RUN npm install

CMD node index.js
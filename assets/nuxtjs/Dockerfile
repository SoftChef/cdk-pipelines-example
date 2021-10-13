FROM public.ecr.aws/bitnami/node:latest

WORKDIR /usr/app

COPY ./ ./

ARG ENV

RUN npm install

ENV NODE_ENV ${ENV}

RUN npm run build

RUN npm run generate

ENV HOST 0.0.0.0

ENV NUXT_PORT 80

EXPOSE $NUXT_PORT

CMD ["npm", "start"]
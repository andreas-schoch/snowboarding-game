# STAGE 1: Build frontend
FROM node:20.4.0-slim as build
WORKDIR /usr/src/app
COPY ../package*.json ./
COPY ../ ./

RUN npm install && npm run build-ci

# STAGE 2: Setup nginx and copy frontend build files
FROM nginx:1.25.1-alpine
RUN apk add --no-cache openssl nano && \
    openssl dhparam -out /etc/nginx/dhparam.pem 1024 && \
    apk del openssl && \
    rm -rf /usr/share/nginx/html/*
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# Regarding usage of ENTRYPOINT with nginx dockerhub image: https://github.com/nginxinc/docker-nginx/issues/422
CMD ["nginx", "-g", "daemon off;"]

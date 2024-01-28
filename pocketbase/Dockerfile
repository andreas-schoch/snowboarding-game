FROM alpine:3.19.0

ARG POCKETBASE_VERSION=0.21.1

RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zip \
    zlib-dev \
    micro

ADD https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip /pocketbase.zip

RUN unzip /pocketbase.zip -d /pb && \
    chmod +x /pb/pocketbase && \
    rm /pocketbase.zip

COPY ./pocketbase/pb_data /pb/pb_data
COPY ./pocketbase/pb_migrations /pb/pb_migrations

EXPOSE 8090

CMD [ "/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--publicDir=/pb/pb_public" ]

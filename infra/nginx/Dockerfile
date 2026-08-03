# Create certificate
FROM alpine:3.22.2 AS certificate

RUN apk update && apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
	-keyout /etc/nginx/ssl/exploding-cats.key \
	-out /etc/nginx/ssl/exploding-cats.crt \
	-subj "/C=NL/L=Amsterdam/O=Exploding-CATs"

# NGINX
FROM nginx:alpine

COPY --from=certificate /etc/nginx/ssl /etc/nginx/ssl
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
EXPOSE 443
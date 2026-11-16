FROM nginx:1.27-alpine

COPY sistema-web/ /usr/share/nginx/html/
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV NGINX_ENVSUBST_FILTER=API_UPSTREAM

EXPOSE 80

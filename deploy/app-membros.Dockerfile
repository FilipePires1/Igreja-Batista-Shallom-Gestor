FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV EXPO_NO_TELEMETRY=1 \
    CI=1

COPY app-membros/ibscn-membros/package.json app-membros/ibscn-membros/package-lock.json ./
RUN npm ci

COPY app-membros/ibscn-membros/ ./
RUN npx expo export --platform web --output-dir dist

FROM nginx:1.27-alpine

COPY deploy/apps-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

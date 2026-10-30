# 1) build do site (Vite + React)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Opcionais; sem valor, valem os padrões do src/estoque.js
ARG VITE_REVENDA_BASE
ARG VITE_LOJA_SLUG
RUN npm run build

# 2) nginx servindo dist/ com fallback de SPA
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
RUN nginx -t
EXPOSE 80

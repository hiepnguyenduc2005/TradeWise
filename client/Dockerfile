# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf /etc/nginx/templates/nginx.conf.template
RUN apk add --no-cache bash
ENV SERVER_URL=$SERVER_URL
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '$SERVER_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

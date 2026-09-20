# syntax=docker/dockerfile:1
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package.json ./client/
RUN npm install --prefix client
COPY shared ./shared
COPY client ./client
RUN npm run build --prefix client

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
COPY server/package.json ./server/
RUN npm install --omit=dev --prefix server
COPY server ./server
COPY shared ./shared
COPY --from=client-build /app/client/dist ./client/dist
EXPOSE 8080
CMD ["node", "server/index.js"]

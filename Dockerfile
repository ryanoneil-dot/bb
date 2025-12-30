FROM node:20-bullseye AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY prisma ./prisma
RUN npx prisma@5.4.0 generate
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bullseye
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm","start"]

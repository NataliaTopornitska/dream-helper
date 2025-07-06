## Используем Node.js
#FROM node:20-alpine
#
## Устанавливаем Xvfb, чтобы Cypress мог работать
#RUN apk add --no-cache xvfb
#
## Устанавливаем рабочую директорию
#WORKDIR /app
#
## Копируем `package.json` из корня проекта, а затем файлы фронта
#COPY ../package*.json ./
#
#RUN npm install
#
## Копируем весь фронтенд
#COPY . .
#
## Запускаем фронт
#CMD ["npm", "run", "dev"]
# Етап 1: установка залежностей
FROM node:20-alpine AS deps

# Встановлюємо лише те, що потрібно для Cypress
RUN apk add --no-cache \
  xvfb \
  dumb-init \
  && rm -rf /var/cache/apk/*

WORKDIR /app

COPY ../package*.json ./
RUN npm install

# Етап 2: основний образ
FROM node:20-alpine

# Додаємо xvfb і dumb-init (легка обгортка)
RUN apk add --no-cache xvfb dumb-init

WORKDIR /app

# Копіюємо встановлені залежності з попереднього шару
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Копіюємо весь фронтенд
COPY . .

# Запускаємо додаток
CMD ["dumb-init", "npm", "run", "dev"]

# Используем Node.js
FROM node:20-alpine

# Устанавливаем Xvfb, чтобы Cypress мог работать
RUN apk add --no-cache xvfb

# Устанавливаем рабочую директорию
WORKDIR /app


# Копируем `package.json` из корня проекта, а затем файлы фронта
COPY ../package.json ../package-lock.json ./
RUN npm install

# Копируем весь фронтенд
COPY . .

# Запускаем фронт
CMD ["npm", "run", "dev"]

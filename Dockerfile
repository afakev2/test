FROM node:16-bullseye-slim

WORKDIR /app

# تثبيت التبعيات الأساسية
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملفات المشروع
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

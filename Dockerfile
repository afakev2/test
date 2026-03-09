FROM node:16-bullseye-slim

WORKDIR /app

# تثبيت التبعيات الأساسية
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملفات المشروع
COPY package*.json ./
COPY start.sh ./

# تثبيت الحزم
RUN npm install --legacy-peer-deps

COPY . .

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]

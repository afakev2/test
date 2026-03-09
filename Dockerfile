FROM node:16.20.0-bullseye-slim

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
COPY .npmrc ./

# تنظيف الكاش وتثبيت الحزم مع إصلاح التبعيات
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --force

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

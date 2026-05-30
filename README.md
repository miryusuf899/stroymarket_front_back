# stroymarket_front_back
Интернет-магазин строительных материалов.

## Технологии
- **Backend:** Django, DRF, JWT, Swagger
- **Frontend:** React, Zustand, Framer Motion
- **AI:** Groq (Llama 3)
- **Notifications:** Telegram Bot

## Запуск Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # заполни переменные
python manage.py migrate
python manage.py runserver
```

## Запуск Frontend
```bash
cd frontend
npm install
npm start
```

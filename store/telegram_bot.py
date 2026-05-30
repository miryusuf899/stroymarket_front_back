import requests
from django.conf import settings

def send_telegram_message(message: str):
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        print(f"[TG BOT] Токен или Chat ID не настроен")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        print(f"[TG BOT] Отправлено: {response.status_code}")
    except Exception as e:
        print(f"Telegram error: {e}")

def notify_new_order(order):
    customer = order.user.username if order.user else f"{order.guest_name} (гость)"
    items_text = "\n".join(
        f"  • {item.product.name} x{item.quantity} = {item.get_total()} сом"
        for item in order.items.all()
    )
    message = (
        f"🛒 <b>Новый заказ #{order.id}</b>\n"
        f"👤 Покупатель: {customer}\n"
        f"📦 Товары:\n{items_text}\n"
        f"💰 Итого: <b>{order.total_price} сом</b>\n"
        f"📍 Адрес: {order.address}\n"
        f"📌 Статус: {order.get_status_display()}"
    )
    send_telegram_message(message)

def notify_order_status_change(order):
    customer = order.user.username if order.user else order.guest_name
    message = (
        f"🔄 <b>Статус заказа #{order.id} изменён</b>\n"
        f"👤 {customer}\n"
        f"📌 Новый статус: <b>{order.get_status_display()}</b>"
    )
    send_telegram_message(message)
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=200, verbose_name='Название')
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=300, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    stock = models.PositiveIntegerField(default=0, verbose_name='Остаток')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('confirmed', 'Подтверждён'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    # для незарегистрированных
    guest_name = models.CharField(max_length=200, blank=True, verbose_name='Имя гостя')
    guest_phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон гостя')
    guest_email = models.EmailField(blank=True, verbose_name='Email гостя')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    address = models.TextField(verbose_name='Адрес доставки')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        if self.user:
            return f'Заказ #{self.id} — {self.user.username}'
        return f'Заказ #{self.id} — {self.guest_name} (гость)'

    def calculate_total(self):
        total = sum(item.get_total() for item in self.items.all())
        self.total_price = total
        self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # цена на момент заказа

    def get_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'


class MonthlyExpense(models.Model):
    """Расходы магазина по месяцам (закупка, аренда, зарплаты и т.д.)"""
    EXPENSE_TYPES = [
        ('purchase', 'Закупка товара'),
        ('rent', 'Аренда'),
        ('salary', 'Зарплата'),
        ('other', 'Другое'),
    ]

    title = models.CharField(max_length=300, verbose_name='Название расхода')
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Сумма')
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES, default='other')
    month = models.DateField(verbose_name='Месяц')  # сохраняем как первое число месяца
    note = models.TextField(blank=True, verbose_name='Примечание')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Расход'
        verbose_name_plural = 'Расходы'

    def __str__(self):
        return f'{self.title} — {self.amount} сом ({self.month.strftime("%B %Y")})'
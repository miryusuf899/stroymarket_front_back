from django.contrib import admin
from .models import Category, Product, Order, OrderItem, MonthlyExpense


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'guest_name', 'status', 'total_price', 'created_at')
    list_filter = ('status',)
    inlines = [OrderItemInline]


@admin.register(MonthlyExpense)
class MonthlyExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'expense_type', 'month')
    list_filter = ('expense_type', 'month')
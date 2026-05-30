from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
import requests
from django.conf import settings
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as s

from .models import Category, Product, Order, OrderItem, MonthlyExpense
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer,
    CreateOrderSerializer, MonthlyExpenseSerializer, UserRegisterSerializer, UserSerializer
)
from .telegram_bot import notify_new_order, notify_order_status_change


@extend_schema(request=UserRegisterSerializer, responses=UserSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(responses=UserSerializer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


@extend_schema(request=CreateOrderSerializer, responses=OrderSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        guest_name=data.get('guest_name', ''),
        guest_phone=data.get('guest_phone', ''),
        guest_email=data.get('guest_email', ''),
        address=data['address'],
    )

    for item_data in data['items']:
        product = Product.objects.get(id=item_data['product_id'])
        qty = int(item_data['quantity'])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=qty,
            price=product.price
        )

    order.calculate_total()
    notify_new_order(order)
    return Response(OrderSerializer(order).data, status=201)


@extend_schema(responses=OrderSerializer(many=True))
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@extend_schema(
    request=inline_serializer('OrderStatus', fields={'status': s.CharField()}),
    responses=OrderSerializer
)
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Заказ не найден'}, status=404)

    new_status = request.data.get('status')
    if new_status not in dict(Order.STATUS_CHOICES):
        return Response({'error': 'Неверный статус'}, status=400)

    order.status = new_status
    order.save()
    notify_order_status_change(order)
    return Response(OrderSerializer(order).data)


@extend_schema(responses=OrderSerializer(many=True))
@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@extend_schema(responses=inline_serializer('AnalyticsResponse', fields={
    'summary': s.DictField(),
    'monthly_sales': s.ListField(),
    'monthly_expenses': s.ListField(),
    'top_products': s.ListField(),
}))
@api_view(['GET'])
@permission_classes([IsAdminUser])
def analytics(request):
    monthly_sales = (
        Order.objects
        .filter(status__in=['confirmed', 'shipped', 'delivered'])
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('total_price'), count=Count('id'))
        .order_by('month')
    )

    monthly_expenses = (
        MonthlyExpense.objects
        .annotate(month=TruncMonth('month'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    top_products = (
        OrderItem.objects
        .values('product__name')
        .annotate(total_sold=Sum('quantity'), revenue=Sum('price'))
        .order_by('-total_sold')[:10]
    )

    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(
        status__in=['confirmed', 'shipped', 'delivered']
    ).aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_expenses = MonthlyExpense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    total_users = User.objects.filter(is_staff=False).count()

    return Response({
        'summary': {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'profit': float(total_revenue) - float(total_expenses),
            'total_users': total_users,
        },
        'monthly_sales': list(monthly_sales),
        'monthly_expenses': list(monthly_expenses),
        'top_products': list(top_products),
    })


class MonthlyExpenseViewSet(viewsets.ModelViewSet):
    queryset = MonthlyExpense.objects.all().order_by('-month')
    serializer_class = MonthlyExpenseSerializer
    permission_classes = [IsAdminUser]


@extend_schema(
    request=inline_serializer('AIRequest', fields={'message': s.CharField()}),
    responses=inline_serializer('AIResponse', fields={'reply': s.CharField()})
)
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_assistant(request):
    user_message = request.data.get('message', '')
    if not user_message:
        return Response({'error': 'Сообщение не может быть пустым'}, status=400)

    total_products = Product.objects.filter(is_active=True).count()
    total_orders = Order.objects.count()
    categories = list(Category.objects.values_list('name', flat=True))

    system_prompt = f"""Ты — ИИ-ассистент строительного магазина "СтройМаркет".
Ты помогаешь покупателям выбрать строительные материалы и инструменты.
Информация о магазине:
- Категории товаров: {', '.join(categories) if categories else 'цемент, кирпич, инструменты, краски, трубы'}
- Всего товаров: {total_products}
- Всего заказов обработано: {total_orders}
Отвечай на русском языке. Давай конкретные советы по строительным материалам."""

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {settings.GROQ_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ],
                'max_tokens': 500,
            },
            timeout=30
        )
        data = response.json()
        if 'choices' not in data:
            return Response({'error': data}, status=500)
        ai_reply = data['choices'][0]['message']['content']
        return Response({'reply': ai_reply})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@extend_schema(responses=inline_serializer('SpendingResponse', fields={
    'month': s.DateTimeField(),
    'total': s.DecimalField(max_digits=12, decimal_places=2),
    'orders_count': s.IntegerField(),
}))
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_monthly_spending(request):
    spending = (
        Order.objects
        .filter(user=request.user, status__in=['confirmed', 'shipped', 'delivered'])
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('total_price'), orders_count=Count('id'))
        .order_by('-month')
    )
    return Response(list(spending))
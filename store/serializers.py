from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, MonthlyExpense


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'http://127.0.0.1:8000{obj.image.url}'
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price', 'total')

    def get_total(self, obj):
        return obj.get_total()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.username
        return obj.guest_name or 'Гость'


class CreateOrderSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    address = serializers.CharField()
    guest_name = serializers.CharField(required=False, allow_blank=True)
    guest_phone = serializers.CharField(required=False, allow_blank=True)
    guest_email = serializers.EmailField(required=False, allow_blank=True)


class MonthlyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyExpense
        fields = '__all__'
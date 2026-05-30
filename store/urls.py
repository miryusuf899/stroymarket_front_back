from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet)
router.register('products', views.ProductViewSet)
router.register('expenses', views.MonthlyExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Auth
    path('auth/register/', views.register),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/profile/', views.profile),

    # Orders
    path('orders/create/', views.create_order),
    path('orders/my/', views.my_orders),
    path('orders/all/', views.all_orders),
    path('orders/<int:pk>/status/', views.update_order_status),

    # Analytics
    path('analytics/', views.analytics),

    # User spending
    path('my-spending/', views.my_monthly_spending),

    # AI
    path('ai/', views.ai_assistant),
]

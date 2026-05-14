from django.urls import path
from . import views

urlpatterns = [
    # --- KPI & Chart Data ---
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('charts/', views.AdminChartsView.as_view(), name='admin-charts'),

    # --- Entity List Endpoints (admin sees ALL records) ---
    path('orders/', views.AdminOrdersView.as_view(), name='admin-orders'),
    path('orders/<uuid:pk>/status/', views.AdminOrderStatusView.as_view(), name='admin-order-status'),
    path('products/', views.AdminProductsView.as_view(), name='admin-products'),
    path('returns/', views.AdminReturnsView.as_view(), name='admin-returns-list'),
    path('courses/', views.AdminCoursesView.as_view(), name='admin-courses'),
    path('reviews/', views.AdminReviewsView.as_view(), name='admin-reviews'),
    path('coupons/', views.AdminCouponsView.as_view(), name='admin-coupons'),
    path('transactions/', views.AdminTransactionsView.as_view(), name='admin-transactions'),
    path('withdrawals/', views.AdminWithdrawalsListView.as_view(), name='admin-withdrawals-list'),
    path('payments/', views.AdminPaymentsView.as_view(), name='admin-payments'),
    path('notifications/', views.AdminNotificationsView.as_view(), name='admin-notifications'),

    # --- User Management ---
    path('users/', views.AdminUsersView.as_view(), name='admin-users'),
    path('users/<int:pk>/toggle/', views.AdminUserToggleView.as_view(), name='admin-user-toggle'),
    path('users/supplier/<int:pk>/', views.AdminSupplierApprovalView.as_view(), name='admin-supplier-approval'),
    path('users/delivery/<int:pk>/', views.AdminDeliveryApprovalView.as_view(), name='admin-delivery-approval'),

    # --- Admin Actions ---
    path('returns/<uuid:pk>/action/', views.AdminReturnActionView.as_view(), name='admin-return-action'),
    path('withdrawals/<uuid:pk>/action/', views.AdminWithdrawalActionView.as_view(), name='admin-withdrawal-action'),
]

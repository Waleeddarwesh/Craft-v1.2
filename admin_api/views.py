"""
Admin API Views — Dashboard backend endpoints.
All views require IsAdminUser permission (is_staff=True).
"""
import os
from decimal import Decimal

from django.conf import settings
from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncMonth
from django.http import HttpResponse, Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User, Customer, Supplier, Delivery
from course.models import Course, Enrollment
from notifications.models import Notification
from orders.models import Order, OrderItem, Coupon
from payment.models import PaymentHistory
from products.models import Product, ProImage
from returnrequest.models import ReturnRequest, Transaction, BalanceWithdrawRequest
from reviews.models import Review


# =============================================================================
# Dashboard SPA File Serving
# =============================================================================

def dashboard_view(request, path='index.html'):
    """Serve the admin dashboard SPA files (HTML, CSS, JS)."""
    dashboard_dir = os.path.join(settings.BASE_DIR, 'dashboard')
    file_path = os.path.normpath(os.path.join(dashboard_dir, path))

    # Security: prevent directory traversal
    if not file_path.startswith(os.path.normpath(dashboard_dir)):
        raise Http404

    if not os.path.isfile(file_path):
        raise Http404

    content_types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.json': 'application/json',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
    }
    ext = os.path.splitext(path)[1].lower()
    content_type = content_types.get(ext, 'application/octet-stream')

    if ext in ('.png', '.jpg', '.ico', '.woff2', '.woff'):
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type=content_type)


# =============================================================================
# KPI Stats & Chart Endpoints
# =============================================================================

class AdminStatsView(APIView):
    """Aggregated KPI statistics for the dashboard overview."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Revenue from succeeded payments
        total_revenue = PaymentHistory.objects.filter(
            payment_status='succeeded'
        ).aggregate(total=Sum('order__final_amount'))['total'] or Decimal('0')

        # Also sum from transactions as backup
        if total_revenue == 0:
            total_revenue = Transaction.objects.filter(
                transaction_type__in=[
                    Transaction.TransactionType.PURCHASED_PRODUCTS,
                    Transaction.TransactionType.PURCHASED_COURSE,
                ]
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        total_orders = Order.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        pending_returns = ReturnRequest.objects.filter(status='new').count()
        products_in_stock = Product.objects.filter(OutOfStock=False).count()
        pending_withdrawals = BalanceWithdrawRequest.objects.filter(
            transfer_status__in=['Requested', 'Awaiting Approval']
        ).count()

        # Month-over-month order change
        this_month_orders = Order.objects.filter(created_at__gte=month_start).count()
        last_month_start = (month_start - timezone.timedelta(days=1)).replace(day=1)
        last_month_orders = Order.objects.filter(
            created_at__gte=last_month_start,
            created_at__lt=month_start
        ).count()
        orders_change = 0
        if last_month_orders > 0:
            orders_change = round(((this_month_orders - last_month_orders) / last_month_orders) * 100, 1)
        elif this_month_orders > 0:
            orders_change = 100.0

        return Response({
            'total_revenue': float(total_revenue),
            'revenue_change': None,
            'total_orders': total_orders,
            'orders_change': orders_change,
            'active_users': active_users,
            'pending_returns': pending_returns,
            'products_in_stock': products_in_stock,
            'pending_withdrawals': pending_withdrawals,
        })


class AdminChartsView(APIView):
    """Chart data for the dashboard overview."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Monthly revenue (last 6 months)
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly = Order.objects.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Sum('final_amount')
        ).order_by('month')

        revenue_labels = [m['month'].strftime('%b') for m in monthly]
        revenue_data = [float(m['total'] or 0) for m in monthly]

        # Order status distribution
        statuses = Order.objects.values('status').annotate(count=Count('id')).order_by('-count')
        status_labels = [s['status'].replace('_', ' ').title() for s in statuses]
        status_data = [s['count'] for s in statuses]

        return Response({
            'revenue_labels': revenue_labels or ['No Data'],
            'revenue_data': revenue_data or [0],
            'status_labels': status_labels or ['No Data'],
            'status_data': status_data or [0],
        })


# =============================================================================
# Admin List Endpoints — Full data access for all entities
# =============================================================================

class AdminOrdersView(APIView):
    """List all orders for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.select_related('user', 'address').prefetch_related('items__product').order_by('-created_at')[:500]
        data = [{
            'id': str(o.id),
            'order_number': o.order_number,
            'user_email': o.user.email,
            'total_amount': float(o.total_amount),
            'discount_amount': float(o.discount_amount),
            'delivery_fee': float(o.delivery_fee),
            'final_amount': float(o.final_amount),
            'payment_method': o.payment_method,
            'status': o.status,
            'paid': o.paid,
            'created_at': o.created_at.isoformat(),
            'items': [{
                'product_name': item.product.ProductName,
                'quantity': item.quantity,
                'price': float(item.price),
            } for item in o.items.all()],
        } for o in orders]
        return Response(data)


class AdminProductsView(APIView):
    """List all products for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        products = Product.objects.select_related('Supplier__user').prefetch_related('images').all()[:500]
        data = [{
            'id': p.id,
            'ProductName': p.ProductName,
            'UnitPrice': float(p.UnitPrice),
            'Stock': p.Stock,
            'OutOfStock': p.OutOfStock,
            'Rating': float(p.Rating),
            'NumberOfRatings': p.NumberOfRatings if hasattr(p, 'NumberOfRatings') else 0,
            'DiscountPercentage': float(p.DiscountPercentage) if p.DiscountPercentage else 0,
            'supplier_name': f"{p.Supplier.user.first_name} {p.Supplier.user.last_name}" if p.Supplier else '',
            'images': [{'image': img.image.url if img.image else ''} for img in p.images.all()[:3]],
        } for p in products]
        return Response(data)


class AdminReturnsView(APIView):
    """List all return requests for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        returns = ReturnRequest.objects.select_related('user', 'product').order_by('-created_at')[:300]
        data = [{
            'id': str(r.id),
            'product_name': r.product.ProductName if r.product else '',
            'customer_name': f"{r.user.first_name} {r.user.last_name}" if r.user else '',
            'quantity': r.quantity,
            'amount': float(r.amount) if r.amount else 0,
            'reason': r.reason,
            'status': r.status,
            'image': r.image.url if r.image else None,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        } for r in returns]
        return Response(data)


class AdminCoursesView(APIView):
    """List all courses for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        courses = Course.objects.select_related('Supplier__user', 'CategoryID').prefetch_related('enrollments').all()
        data = [{
            'CourseID': c.CourseID,
            'CourseTitle': c.CourseTitle,
            'Price': float(c.Price),
            'Rating': float(c.Rating),
            'NumberOfRatings': c.NumberOfRatings,
            'Thumbnail': c.Thumbnail.url if c.Thumbnail else None,
            'supplier_name': f"{c.Supplier.user.first_name} {c.Supplier.user.last_name}" if c.Supplier else '',
            'enrollments_count': c.enrollments.count(),
            'completed': c.completed,
            'CourseHours': c.CourseHours,
            'NumberOfLec': c.NumberOfLec,
        } for c in courses]
        return Response(data)


class AdminReviewsView(APIView):
    """List all reviews for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        reviews = Review.objects.select_related('customer__user', 'product', 'course').order_by('-created_at')[:300]
        data = [{
            'id': r.id,
            'customer_name': f"{r.customer.user.first_name} {r.customer.user.last_name}" if r.customer else '',
            'product_name': r.product.ProductName if r.product else '',
            'course_name': r.course.CourseTitle if r.course else '',
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        } for r in reviews]
        return Response(data)


class AdminCouponsView(APIView):
    """List all coupons for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        coupons = Coupon.objects.select_related('supplier__user').all()
        data = [{
            'id': c.id,
            'code': c.code,
            'supplier_name': f"{c.supplier.user.first_name} {c.supplier.user.last_name}" if c.supplier else '',
            'discount': float(c.discount),
            'discount_type': c.discount_type,
            'active': c.active,
            'valid_from': c.valid_from.isoformat() if c.valid_from else None,
            'valid_to': c.valid_to.isoformat() if c.valid_to else None,
            'max_uses': c.max_uses,
            'uses_count': c.uses_count,
            'min_purchase_amount': float(c.min_purchase_amount),
        } for c in coupons]
        return Response(data)


class AdminTransactionsView(APIView):
    """List all transactions for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        txns = Transaction.objects.select_related('user').order_by('-created_at')[:300]
        data = [{
            'id': str(t.id),
            'user_email': t.user.email if t.user else '',
            'transaction_type': t.transaction_type,
            'amount': float(t.amount),
            'created_at': t.created_at.isoformat() if t.created_at else None,
        } for t in txns]
        return Response(data)


class AdminWithdrawalsListView(APIView):
    """List all withdrawal requests for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        withdrawals = BalanceWithdrawRequest.objects.select_related('user').order_by('-created_at')[:300]
        data = [{
            'id': str(w.id),
            'user_name': f"{w.user.first_name} {w.user.last_name}" if w.user else '',
            'amount': float(w.amount),
            'transfer_type': w.transfer_type,
            'transfer_number': w.transfer_number,
            'transfer_status': w.transfer_status,
            'risk_score': float(w.risk_score) if hasattr(w, 'risk_score') and w.risk_score else 0,
            'notes': w.notes if hasattr(w, 'notes') else '',
            'admin_notes': w.admin_notes if hasattr(w, 'admin_notes') else '',
            'created_at': w.created_at.isoformat() if w.created_at else None,
        } for w in withdrawals]
        return Response(data)


class AdminNotificationsView(APIView):
    """List all notifications (system-wide) for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        notifs = Notification.objects.order_by('-timestamp')[:200]
        data = [{
            'id': n.id,
            'user_email': n.user.email if n.user else '',
            'message': n.message,
            'is_read': n.is_read,
            'timestamp': n.timestamp.isoformat() if n.timestamp else None,
        } for n in notifs]
        return Response(data)

    def post(self, request):
        """Mark all notifications as read."""
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


# =============================================================================
# User Management Endpoints
# =============================================================================

class AdminUsersView(APIView):
    """List all users grouped by role."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        customers = User.objects.filter(is_customer=True).values(
            'id', 'email', 'first_name', 'last_name', 'PhoneNO',
            'is_verified', 'Balance', 'date_joined', 'is_active'
        )
        suppliers_qs = Supplier.objects.select_related('user').all()
        suppliers = [{
            'id': s.id,
            'user_id': s.user_id,
            'name': f"{s.user.first_name} {s.user.last_name}",
            'email': s.user.email,
            'CategoryTitle': s.CategoryTitle,
            'Rating': float(s.Rating),
            'FollowersNo': s.FollowersNo,
            'Orders': s.Orders,
            'ExperienceYears': s.ExperienceYears,
            'accepted_supplier': s.accepted_supplier,
        } for s in suppliers_qs]

        delivery_qs = Delivery.objects.select_related('user').all()
        delivery = [{
            'id': d.id,
            'user_id': d.user_id,
            'name': f"{d.user.first_name} {d.user.last_name}",
            'email': d.user.email,
            'VehicleModel': d.VehicleModel,
            'VehicleColor': d.VehicleColor,
            'plateNO': d.plateNO,
            'governorate': d.governorate,
            'Rating': float(d.Rating),
            'Orders': d.Orders,
            'accepted_delivery': d.accepted_delivery,
        } for d in delivery_qs]

        return Response({
            'customers': list(customers),
            'suppliers': suppliers,
            'delivery': delivery,
        })


class AdminUserToggleView(APIView):
    """Activate or deactivate a user."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
            user.save(update_fields=['is_active'])
        return Response({'status': 'updated', 'is_active': user.is_active})


# =============================================================================
# Admin Action Endpoints
# =============================================================================

class AdminSupplierApprovalView(APIView):
    """Approve or update a supplier."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            supplier = Supplier.objects.get(pk=pk)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'accepted_supplier' in request.data:
            supplier.accepted_supplier = request.data['accepted_supplier']
            supplier.save(update_fields=['accepted_supplier'])
        return Response({'status': 'updated'})


class AdminDeliveryApprovalView(APIView):
    """Approve or update a delivery person."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery person not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'accepted_delivery' in request.data:
            delivery.accepted_delivery = request.data['accepted_delivery']
            delivery.save(update_fields=['accepted_delivery'])
        return Response({'status': 'updated'})


class AdminReturnActionView(APIView):
    """Accept, reject, or cancel a return request."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            ret = ReturnRequest.objects.get(pk=pk)
        except ReturnRequest.DoesNotExist:
            return Response({'error': 'Return request not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'accept':
            ret.approve_by_supplier()
        elif action == 'reject':
            ret.reject_by_supplier()
        elif action == 'cancel':
            ret.cancel()
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': f'Return {action}ed', 'new_status': ret.status})


class AdminWithdrawalActionView(APIView):
    """Approve or reject a withdrawal request."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            wd = BalanceWithdrawRequest.objects.get(pk=pk)
        except BalanceWithdrawRequest.DoesNotExist:
            return Response({'error': 'Withdrawal not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            wd.transfer_status = 'Approved'
        elif action == 'reject':
            wd.transfer_status = 'Rejected'
        elif action == 'complete':
            wd.transfer_status = 'Completed'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if request.data.get('admin_notes'):
            wd.admin_notes = request.data['admin_notes']

        wd.save()
        return Response({'status': f'Withdrawal {action}d', 'new_status': wd.transfer_status})


class AdminPaymentsView(APIView):
    """List all payment history records."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        payments = PaymentHistory.objects.select_related('user', 'order', 'course').order_by('-date')[:200]
        data = [{
            'id': str(p.id),
            'user_email': p.user.email if p.user else None,
            'order_id': str(p.order_id) if p.order_id else None,
            'course_id': p.course_id,
            'payment_status': p.payment_status,
            'stripe_session_id': p.stripe_session_id,
            'stripe_payment_intent_id': p.stripe_payment_intent_id,
            'date': p.date.isoformat() if p.date else None,
        } for p in payments]
        return Response(data)


class AdminOrderStatusView(APIView):
    """Update order status."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save(update_fields=['status'])
        return Response({'status': 'updated', 'new_status': order.status})

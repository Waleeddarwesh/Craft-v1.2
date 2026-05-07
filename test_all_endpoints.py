"""
Comprehensive API Endpoint Test Script for CraftEG Django Application.
Tests GET, POST, PATCH, and DELETE for all major endpoints.
Identifies 500 errors and other failures, prints a summary report.
"""
import os
import sys
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Handcrafts.settings')
import django
django.setup()

from rest_framework.test import APIClient
from accounts.models import User, Customer, Supplier, Delivery, Address, OneTimePassword
from products.models import Product, Category
from orders.models import Cart, CartItems, Wishlist
from django.contrib.contenttypes.models import ContentType

# ============================
# HELPERS
# ============================
results = {"pass": [], "fail_500": [], "fail_other": [], "error": []}

def record(label, status_code, response=None, exception=None):
    if exception:
        results["error"].append((label, str(exception)))
        print(f"  [ERROR]  {label}: {exception}")
    elif status_code >= 500:
        body = getattr(response, 'data', getattr(response, 'content', b'')[:200])
        results["fail_500"].append((label, status_code, body))
        print(f"  [500!!]   {label}: {status_code} - {body}")
    elif status_code >= 400:
        results["fail_other"].append((label, status_code))
        print(f"  [{status_code}]  {label}")
    else:
        results["pass"].append(label)
        print(f"  [OK:{status_code}]  {label}")

def safe_request(label, client_method, url, **kwargs):
    try:
        resp = client_method(url, **kwargs)
        record(label, resp.status_code, resp)
        return resp
    except Exception as e:
        record(label, 0, exception=e)
        traceback.print_exc()
        return None

# ============================
# SETUP TEST DATA
# ============================
print("=" * 60)
print("SETTING UP TEST DATA")
print("=" * 60)

# Create a customer user
cust_user, _ = User.objects.get_or_create(
    email="testcust@test.com",
    defaults={
        "first_name": "TestCust",
        "last_name": "User",
        "PhoneNO": "01099999999",
        "is_customer": True,
        "is_verified": True,
        "is_active": True,
        "password": "TestPass123"
    }
)
customer, _ = Customer.objects.get_or_create(user=cust_user)

# Create a supplier user
supp_user, _ = User.objects.get_or_create(
    email="testsupp@test.com",
    defaults={
        "first_name": "TestSupp",
        "last_name": "User",
        "PhoneNO": "01199999999",
        "is_supplier": True,
        "is_verified": True,
        "is_active": True,
        "password": "TestPass123"
    }
)
supplier, _ = Supplier.objects.get_or_create(
    user=supp_user,
    defaults={
        "CategoryTitle": "bamboo",
        "ExperienceYears": 5,
    }
)

# Create a delivery user
deliv_user, _ = User.objects.get_or_create(
    email="testdeliv@test.com",
    defaults={
        "first_name": "TestDeliv",
        "last_name": "User",
        "PhoneNO": "01299999999",
        "is_delivery": True,
        "is_verified": True,
        "is_active": True,
        "password": "TestPass123"
    }
)
delivery, _ = Delivery.objects.get_or_create(
    user=deliv_user,
    defaults={
        "VehicleModel": "Honda",
        "plateNO": "TEST-123",
        "governorate": "Cairo",
    }
)

# Create addresses
cust_address, _ = Address.objects.get_or_create(
    user=cust_user,
    defaults={"BuildingNO": "1", "Street": "Main St", "City": "Cairo", "State": "Cairo"}
)
supp_address, _ = Address.objects.get_or_create(
    user=supp_user,
    defaults={"BuildingNO": "2", "Street": "Supply St", "City": "Giza", "State": "Giza"}
)

# Get or create categories
category = Category.objects.first()
if not category:
    category = Category.objects.create(Title="bamboo", Description="Test", is_active=True, Slug="bamboo")

# Get or create a product
product = Product.objects.first()
if not product:
    product = Product.objects.create(
        ProductName="Test Product",
        Description="A test product",
        UnitPrice=100,
        Stock=10,
        Category=category,
        Supplier=supplier,
    )

print(f"  Customer: {cust_user.email} (id={cust_user.id})")
print(f"  Supplier: {supp_user.email} (id={supp_user.id})")
print(f"  Delivery: {deliv_user.email} (id={deliv_user.id})")
print(f"  Product:  {product.ProductName} (id={product.id})")
print(f"  Category: {category.Title} (slug={category.Slug})")

# ============================
# CLIENTS
# ============================
anon_client = APIClient()

cust_client = APIClient()
cust_client.force_authenticate(user=cust_user)

supp_client = APIClient()
supp_client.force_authenticate(user=supp_user)

deliv_client = APIClient()
deliv_client.force_authenticate(user=deliv_user)

# ============================
# 1. ACCOUNTS APP
# ============================
print("\n" + "=" * 60)
print("1. ACCOUNTS APP")
print("=" * 60)

# Registration
safe_request("Register Customer (POST)", anon_client.post, '/accounts/register_customer/',
             data={"email": "newcust@test.com", "first_name": "New", "last_name": "Cust",
                    "PhoneNO": "01055555555", "password": "TestPass123", "password2": "TestPass123"},
             format='json')

safe_request("Register Supplier (POST)", anon_client.post, '/accounts/register_supplier/',
             data={"email": "newsupp@test.com", "first_name": "New", "last_name": "Supp",
                    "PhoneNO": "01155555555", "password": "TestPass123", "password2": "TestPass123",
                    "CategoryTitle": "leather", "ExperienceYears": 3},
             format='json')

safe_request("Register Delivery (POST)", anon_client.post, '/accounts/register_delivery/',
             data={"email": "newdeliv@test.com", "first_name": "New", "last_name": "Deliv",
                    "PhoneNO": "01255555555", "password": "TestPass123", "password2": "TestPass123",
                    "plateNO": "456-DEF", "VehicleModel": "Toyota", "governorate": "Alexandria"},
             format='json')

# Login (with a verified user)
safe_request("Login (POST)", anon_client.post, '/accounts/login/',
             data={"email": cust_user.email, "password": "TestPass123"}, format='json')

# Verify Email (missing OTP - should be 400)
safe_request("Verify Email (POST, no OTP)", anon_client.post, '/accounts/verify_email/',
             data={"otp": "0000", "email": cust_user.email}, format='json')

# Resend OTP
safe_request("Resend OTP (POST)", anon_client.post, '/accounts/resend_otp/',
             data={"email": cust_user.email}, format='json')

# Password Reset Request
safe_request("Password Reset (POST)", anon_client.post, '/accounts/password-reset/',
             data={"email": cust_user.email}, format='json')

# Check OTP Validity
safe_request("Check OTP (POST)", anon_client.post, '/accounts/check-otp/',
             data={"otp": "0000", "email": cust_user.email}, format='json')

# Profiles (authenticated)
safe_request("Customer Profile (GET)", cust_client.get, '/accounts/customer/profile/')
safe_request("Supplier Profile (GET)", supp_client.get, '/accounts/supplier/profile/')
safe_request("Delivery Profile (GET)", deliv_client.get, '/accounts/delivery/profile/')

# Patch profiles
safe_request("Customer Profile (PATCH)", cust_client.patch, '/accounts/customer/profile/',
             data={"user": {"first_name": "Updated"}}, format='json')

safe_request("Supplier Profile (PATCH)", supp_client.patch, '/accounts/supplier/profile/',
             data={"CategoryTitle": "pottery"}, format='json')

# Suppliers List
safe_request("Suppliers List (GET)", cust_client.get, '/accounts/suppliers/')

# Trending Suppliers
safe_request("Trending Suppliers (GET)", cust_client.get, '/accounts/trending-suppliers/')

# Supplier Detail
safe_request(f"Supplier Detail (GET pk={supplier.id})", cust_client.get, f'/accounts/suppliers/{supplier.id}/')

# Follow Supplier
safe_request(f"Follow Supplier (POST id={supplier.id})", cust_client.post, f'/accounts/followsupplier/{supplier.id}/')

# Unfollow Supplier
safe_request(f"Unfollow Supplier (DELETE id={supplier.id})", cust_client.delete, f'/accounts/followsupplier/{supplier.id}/')

# Addresses (CRUD)
resp = safe_request("Create Address (POST)", cust_client.post, '/accounts/addresses/',
                    data={"BuildingNO": "5", "Street": "Test St", "City": "Cairo", "State": "Cairo"}, format='json')
if resp and resp.status_code == 201:
    addr_id = resp.data.get('id')
    safe_request(f"Get Address (GET id={addr_id})", cust_client.get, f'/accounts/addresses/{addr_id}/')
    safe_request(f"Update Address (PATCH id={addr_id})", cust_client.patch, f'/accounts/addresses/{addr_id}/',
                 data={"Street": "Updated St"}, format='json')
    safe_request(f"Delete Address (DELETE id={addr_id})", cust_client.delete, f'/accounts/addresses/{addr_id}/')

safe_request("List Addresses (GET)", cust_client.get, '/accounts/addresses/')

# ============================
# 2. PRODUCTS APP
# ============================
print("\n" + "=" * 60)
print("2. PRODUCTS APP")
print("=" * 60)

safe_request("Products List (GET)", anon_client.get, '/product/products/')
safe_request(f"Product Detail (GET id={product.id})", anon_client.get, f'/product/products/{product.id}/')
safe_request("Categories (GET)", anon_client.get, '/product/categories/')
safe_request("Materials (GET)", anon_client.get, '/product/materials/')
safe_request("Posters (GET)", anon_client.get, '/product/posters/')
safe_request(f"Products by Category (GET slug={category.Slug})", anon_client.get, f'/product/products-by-category/{category.Slug}/')

# Supplier Products (authenticated)
safe_request("Supplier Products (GET)", supp_client.get, '/product/supplierproducts/')

# Followed Suppliers Products (authenticated as customer)
safe_request("Followed Suppliers Products (GET)", cust_client.get, '/product/productsByFollowedSuppliers/')

# Latest Collections
safe_request("Latest Collections (GET)", cust_client.get, '/product/latest-collections/')

# Collections ViewSet
safe_request("Collections (GET)", supp_client.get, '/product/collections/')

# ============================
# 3. ORDERS APP
# ============================
print("\n" + "=" * 60)
print("3. ORDERS APP")
print("=" * 60)

# Carts
safe_request("Carts List (GET)", cust_client.get, '/orders/carts/')

# Cart Items
safe_request("Cart Items List (GET)", cust_client.get, '/orders/cartitems/')

# Wishlists
safe_request("Wishlists List (GET)", cust_client.get, '/orders/whishlists/')
safe_request("Wishlist Items List (GET)", cust_client.get, '/orders/whishlistitems/')

# Orders
safe_request("Orders List (GET)", cust_client.get, '/orders/orders/')

# Coupons
safe_request("Coupons List (GET)", cust_client.get, '/orders/coupons/')

# Shipments
safe_request("Shipments List (GET)", cust_client.get, '/orders/shipments/')

# Warehouses
safe_request("Warehouses (GET)", anon_client.get, '/orders/warehouses/')

# Return Orders Products
safe_request("Return Orders Products (GET)", cust_client.get, '/orders/return-orders-products/')

# ============================
# 4. COURSE APP
# ============================
print("\n" + "=" * 60)
print("4. COURSE APP")
print("=" * 60)

safe_request("Courses List (GET)", supp_client.get, '/course/courses/')
safe_request("Simple Courses (GET)", anon_client.get, '/course/simple-courses/')
safe_request("Enrolled Courses (GET)", cust_client.get, '/course/enrolled-courses/')

# ============================
# 5. PAYMENT APP
# ============================
print("\n" + "=" * 60)
print("5. PAYMENT APP")
print("=" * 60)

safe_request("Order Payment List (GET)", cust_client.get, '/payment/order-payment/')
safe_request("Course Payment List (GET)", cust_client.get, '/payment/course-payment/')
safe_request("Payment Success (GET)", anon_client.get, '/payment/success/')
safe_request("Payment Canceled (GET)", anon_client.get, '/payment/canceled/')

# ============================
# 6. REVIEWS APP
# ============================
print("\n" + "=" * 60)
print("6. REVIEWS APP")
print("=" * 60)

safe_request(f"Product Reviews (GET product_id={product.id})", anon_client.get, f'/review/products/{product.id}/reviews/')
safe_request(f"Supplier Reviews (GET supplier_id={supplier.id})", anon_client.get, f'/review/suppliers/{supplier.id}/reviews/')

# Create a review
safe_request("Create Review (POST)", cust_client.post, '/review/reviews/',
             data={"product_id": product.id, "rating": 5, "comment": "Great product!"}, format='json')

# ============================
# 7. NOTIFICATIONS APP
# ============================
print("\n" + "=" * 60)
print("7. NOTIFICATIONS APP")
print("=" * 60)

safe_request("My Notifications (GET)", cust_client.get, '/notifications/my-notifications/')

# ============================
# 8. CHAT APP
# ============================
print("\n" + "=" * 60)
print("8. CHAT APP")
print("=" * 60)

safe_request("Conversations (GET)", cust_client.get, '/chat/convos/')
safe_request(f"Start Convo (GET user_id={supp_user.id})", cust_client.get, f'/chat/start_convo/{supp_user.id}/')

# ============================
# 9. RETURN REQUESTS APP
# ============================
print("\n" + "=" * 60)
print("9. RETURN REQUESTS APP")
print("=" * 60)

safe_request("Return Requests (GET)", cust_client.get, '/return/return-requests/')
safe_request("Withdraw Requests (GET)", cust_client.get, '/return/withdraw-requests/')
safe_request("Transactions (GET)", cust_client.get, '/return/transactions/')

# ============================
# 10. REPORTS APP
# ============================
print("\n" + "=" * 60)
print("10. REPORTS APP")
print("=" * 60)

safe_request("Earnings Report (GET)", supp_client.get, '/reports/earnings/')

# ============================
# 11. RECOMMENDATIONS APP
# ============================
print("\n" + "=" * 60)
print("11. RECOMMENDATIONS APP")
print("=" * 60)

safe_request(f"Recommendations (GET product_id={product.id})", anon_client.get, f'/recommendations/products/{product.id}/')

# ============================
# 12. SWAGGER DOCS
# ============================
print("\n" + "=" * 60)
print("12. DOCS")
print("=" * 60)

safe_request("Swagger Docs (GET)", anon_client.get, '/docs/')

# ============================
# SUMMARY
# ============================
print("\n" + "=" * 60)
print("FINAL REPORT")
print("=" * 60)
print(f"  [OK]  PASSED:      {len(results['pass'])}")
print(f"  [4xx] CLIENT ERR:  {len(results['fail_other'])}")
print(f"  [500] SERVER 500:  {len(results['fail_500'])}")
print(f"  [ERR] EXCEPTIONS:  {len(results['error'])}")

if results['fail_500']:
    print("\n--- 500 ERRORS (BUGS TO FIX) ---")
    for label, code, body in results['fail_500']:
        print(f"  {label}: {code}")
        print(f"    {body}")

if results['error']:
    print("\n--- EXCEPTIONS (CRASHES) ---")
    for label, msg in results['error']:
        print(f"  {label}: {msg}")

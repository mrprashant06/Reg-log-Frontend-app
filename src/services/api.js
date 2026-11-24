/**
 * AURA LUXE Full-Stack API Service
 * Interacts with Spring Boot Backend (Java 21 + MySQL 8.0 + Razorpay)
 */

const API_BASE = '/api';
const AUTH_BASE = '/api/auth';

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// 1. AUTHENTICATION & PROFILE APIS (PRESERVED)
// ==========================================

export async function sendOtp(identifier, purpose = 'REGISTRATION') {
  const response = await fetch(`${AUTH_BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to dispatch verification code');
  }
  return data;
}

export async function verifyOtp(identifier, otpCode, purpose = 'REGISTRATION') {
  const response = await fetch(`${AUTH_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otpCode, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid or expired OTP code');
  }
  return data;
}

export async function registerUser({ fullName, identifier, authPreference, password, confirmPassword, otpCode }) {
  const response = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      identifier,
      authPreference,
      password: authPreference === 'PASSWORD' ? password : null,
      confirmPassword: authPreference === 'PASSWORD' ? confirmPassword : null,
      otpCode: authPreference === 'OTP' ? otpCode : null,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

export async function loginUser({ identifier, authMode, password, otpCode }) {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier,
      authMode,
      password: authMode === 'PASSWORD' ? password : null,
      otpCode: authMode === 'OTP' ? otpCode : null,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return data;
}

export async function forgotPassword(identifier) {
  const response = await fetch(`${AUTH_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to request password reset code');
  }
  return data;
}

export async function resetPasswordWithOtp({ identifier, otpCode, newPassword, confirmPassword }) {
  const response = await fetch(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otpCode, newPassword, confirmPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password');
  }
  return data;
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }, token) {
  const response = await fetch(`${AUTH_BASE}/change-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }
  return data;
}

export async function getProfile(token) {
  const response = await fetch(`${AUTH_BASE}/me`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unable to retrieve user session');
  }
  return data;
}

export async function logoutUser(token) {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      headers: authHeaders(token),
    });
  } catch {
    // Ignore network drop on signout
  }
}

// ==========================================
// 2. CATEGORIES APIS
// ==========================================

export async function getCategories() {
  const response = await fetch(`${API_BASE}/categories`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load categories');
  }
  return data.data || [];
}

export async function getCategoryById(id) {
  const response = await fetch(`${API_BASE}/categories/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load category');
  }
  return data.data;
}

export async function getCategoryBySlug(slug) {
  const response = await fetch(`${API_BASE}/categories/slug/${slug}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load category');
  }
  return data.data;
}

// ==========================================
// 3. PRODUCTS & FILTER APIS
// ==========================================

export async function getProducts(params = {}, token = null) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        val.forEach((item) => query.append(key, item));
      } else {
        query.append(key, val);
      }
    }
  });

  const response = await fetch(`${API_BASE}/products?${query.toString()}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch products');
  }
  return data.data;
}

export async function getProductById(id, token = null) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Product not found');
  }
  return data.data;
}

export async function getProductBySlug(slug, token = null) {
  const response = await fetch(`${API_BASE}/products/slug/${slug}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Product not found');
  }
  return data.data;
}

export async function getFeaturedProducts() {
  const response = await fetch(`${API_BASE}/products/featured`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load featured products');
  }
  return data.data || [];
}

export async function getTopRatedProducts() {
  const response = await fetch(`${API_BASE}/products/top-rated`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load top rated products');
  }
  return data.data || [];
}

export async function getFilterOptions(query = '', categoryId = '') {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (categoryId) params.append('categoryId', categoryId);

  const response = await fetch(`${API_BASE}/products/filters?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load filter options');
  }
  return data.data;
}

export async function getSearchSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const response = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.data || [];
}

// ==========================================
// 4. RECOMMENDATIONS APIS
// ==========================================

export async function getRecommendations(limit = 8, token = null) {
  const response = await fetch(`${API_BASE}/products/recommendations?limit=${limit}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  return data.data || [];
}

export async function getProductRecommendations(productId, limit = 6, token = null) {
  const response = await fetch(`${API_BASE}/products/${productId}/recommendations?limit=${limit}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  return data.data || [];
}

export async function getCartRecommendations(limit = 4, token = null) {
  const response = await fetch(`${API_BASE}/cart/recommendations?limit=${limit}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  return data.data || [];
}

// ==========================================
// 5. SHOPPING CART APIS
// ==========================================

export async function getCart(token) {
  const response = await fetch(`${API_BASE}/cart`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch cart');
  }
  return data.data;
}

export async function addToCart({ productId, variantId, selectedSize, selectedColor, quantity = 1 }, token) {
  const response = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId, variantId, selectedSize, selectedColor, quantity }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add item to cart');
  }
  return data.data;
}

export async function updateCartItem(itemId, quantity, token) {
  const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ quantity }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update cart item');
  }
  return data.data;
}

export async function removeCartItem(itemId, token) {
  const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to remove item from cart');
  }
  return data.data;
}

export async function clearCart(token) {
  const response = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to clear cart');
  }
  return data;
}

// ==========================================
// 6. ADDRESS MANAGEMENT APIS
// ==========================================

export async function getAddresses(token) {
  const response = await fetch(`${API_BASE}/addresses`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load addresses');
  }
  return data.data || [];
}

export async function addAddress(addressData, token) {
  const response = await fetch(`${API_BASE}/addresses`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(addressData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add address');
  }
  return data.data;
}

export async function updateAddress(id, addressData, token) {
  const response = await fetch(`${API_BASE}/addresses/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(addressData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update address');
  }
  return data.data;
}

export async function deleteAddress(id, token) {
  const response = await fetch(`${API_BASE}/addresses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete address');
  }
  return data;
}

export async function setDefaultAddress(id, token) {
  const response = await fetch(`${API_BASE}/addresses/${id}/default`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to set default address');
  }
  return data;
}

// ==========================================
// 7. CHECKOUT & ORDER APIS
// ==========================================

export async function validateCheckout(addressId, token) {
  const params = addressId ? `?addressId=${addressId}` : '';
  const response = await fetch(`${API_BASE}/checkout/validate${params}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Checkout validation failed');
  }
  return data.data;
}

export async function placeOrder({ addressId, paymentMethod, notes }, token) {
  const response = await fetch(`${API_BASE}/checkout/place-order`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ addressId, paymentMethod, notes }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to place order');
  }
  return data.data;
}

// ==========================================
// 8. PAYMENT APIS (RAZORPAY & COD)
// ==========================================

export async function createRazorpayOrder(orderId, token) {
  const response = await fetch(`${API_BASE}/payments/razorpay/create-order?orderId=${orderId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to initiate Razorpay payment');
  }
  return data.data;
}

export async function verifyRazorpayPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }, token) {
  const response = await fetch(`${API_BASE}/payments/razorpay/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Payment verification failed');
  }
  return data.data;
}

export async function processCodPayment(orderId, token) {
  const response = await fetch(`${API_BASE}/payments/cod?orderId=${orderId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to confirm Cash on Delivery');
  }
  return data.data;
}

// ==========================================
// 9. MY ORDERS APIS
// ==========================================

export async function getOrders(params = {}, token) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const response = await fetch(`${API_BASE}/orders?${query.toString()}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve orders');
  }
  return data.data;
}

export async function getOrderById(orderId, token) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Order not found');
  }
  return data.data;
}

export async function cancelOrder(orderId, reason, token) {
  const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel order');
  }
  return data.data;
}

export async function returnOrder(orderId, reason, token) {
  const response = await fetch(`${API_BASE}/orders/${orderId}/return`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit return request');
  }
  return data.data;
}

// ==========================================
// 10. WISHLIST APIS
// ==========================================

export async function getWishlist(token) {
  const response = await fetch(`${API_BASE}/wishlist`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data.data;
}

export async function addToWishlist(productId, token) {
  const response = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data.data;
}

export async function removeFromWishlist(productId, token) {
  const response = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data.data;
}

export async function moveWishlistToCart(productId, size = 'M', color = 'Standard', token) {
  const response = await fetch(`${API_BASE}/wishlist/${productId}/move-to-cart?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to move item to bag');
  return data.data;
}

export async function checkWishlist(productId, token) {
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE}/wishlist/check/${productId}`, {
      headers: authHeaders(token),
    });
    const data = await response.json();
    return data?.data?.inWishlist || false;
  } catch {
    return false;
  }
}

// ==========================================
// 11. ADMIN APIS (PROFIT, REVENUE, INVENTORY)
// ==========================================

export async function getAdminAnalytics(token) {
  const response = await fetch(`${API_BASE}/v1/admin/analytics/overview`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to load analytics');
  return data.data;
}

export async function getAdminOrders(params = {}, token) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/v1/admin/orders?${query}`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to load admin orders');
  return data.data;
}

export async function updateAdminOrderStatus(orderId, status, token) {
  const response = await fetch(`${API_BASE}/v1/admin/orders/${orderId}/status?status=${status}`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update order status');
  return data.data;
}

const CAFE_CART_KEY = "lekhak_cafe_cart";

export function getCafeCart() {
  try {
    const raw = localStorage.getItem(CAFE_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCafeCart(cart) {
  try {
    localStorage.setItem(CAFE_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("lekhak:cafe-cart-updated"));
  } catch {
    // ignore
  }
}

export function addToCafeCart(item, quantity = 1) {
  const cart = getCafeCart();
  const index = cart.findIndex((i) => (i._id || i.id) === (item._id || item.id));

  if (index > -1) {
    cart[index].quantity = (cart[index].quantity || 1) + quantity;
  } else {
    cart.push({
      _id: item._id || item.id,
      name: item.name,
      price: item.price,
      category: item.category || "others",
      imageUrl: item.imageUrl || "",
      quantity,
    });
  }

  saveCafeCart(cart);
}

export function updateCafeCartQty(itemId, quantity) {
  let cart = getCafeCart();
  if (quantity <= 0) {
    cart = cart.filter((i) => (i._id || i.id) !== itemId);
  } else {
    cart = cart.map((i) => ((i._id || i.id) === itemId ? { ...i, quantity } : i));
  }
  saveCafeCart(cart);
}

export function removeFromCafeCart(itemId) {
  const cart = getCafeCart().filter((i) => (i._id || i.id) !== itemId);
  saveCafeCart(cart);
}

export function clearCafeCart() {
  try {
    localStorage.removeItem(CAFE_CART_KEY);
    window.dispatchEvent(new Event("lekhak:cafe-cart-updated"));
  } catch {
    // ignore
  }
}

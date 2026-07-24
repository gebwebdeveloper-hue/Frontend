// Cart utility for Lekhok Tripura

const CART_KEY = "lekhok_cart";

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse cart from localStorage:", err);
    return [];
  }
}

export function addToCart(book, format = "ebook") {
  const cart = getCart();
  const bookId = book._id || book.id;

  // Determine price based on format
  let price = book.price || 0;
  if (format === "paperback") {
    price = book.paperbackPrice || book.price || 0;
  } else if (format === "hardcover") {
    price = book.hardcoverPrice || book.price || 0;
  }

  // Check if item with exact bookId + format is already in cart
  const existingIndex = cart.findIndex(
    (item) => item.bookId === bookId && item.format === format
  );

  if (existingIndex > -1) {
    return { success: false, message: `This ${format} edition is already in your cart.` };
  }

  const coverUrl = book.cover?.url || "";

  const newItem = {
    bookId,
    title: book.title,
    author: book.author,
    cover: coverUrl,
    format,
    price: Number(price),
    pages: book.pages || 0
  };

  cart.push(newItem);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("lekhak:cart-updated"));
  return { success: true, message: `Added ${book.title} (${format.toUpperCase()}) to cart!` };
}

export function removeFromCart(bookId, format) {
  let cart = getCart();
  cart = cart.filter((item) => !(item.bookId === bookId && item.format === format));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("lekhak:cart-updated"));
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("lekhak:cart-updated"));
}

if (typeof window !== "undefined") {
  window.addEventListener("lekhak:logout", () => {
    clearCart();
  });
  window.addEventListener("lekhak:login", () => {
    clearCart();
  });
}

// Cart utility for Lekhok Tripura

const CART_KEY = "lekhok_cart";
const GST_RATE = 0.18; // 18% GST

/**
 * Returns the GST-inclusive price for a given base price.
 * @param {number} basePrice
 * @returns {number} price after 18% GST (rounded to 2 decimal places)
 */
export function applyGST(basePrice) {
  return Math.round(Number(basePrice) * (1 + GST_RATE) * 100) / 100;
}

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse cart from localStorage:", err);
    return [];
  }
}

export function addToCart(book, format = "ebook", user = null) {
  const cart = getCart();
  const bookId = book._id || book.id;

  // Determine base price based on format
  let rawBasePrice = book.price || 0;
  if (format === "paperback") {
    rawBasePrice = book.paperbackPrice || book.price || 0;
  } else if (format === "hardcover") {
    rawBasePrice = book.hardcoverPrice || book.price || 0;
  }

  // Check if user is an active club member (memberId starts with LTCLUB-)
  const isClubMember = !!(user?.memberId && String(user.memberId).startsWith("LTCLUB-"));
  const basePrice = isClubMember
    ? Math.round(Number(rawBasePrice) * 0.95 * 100) / 100
    : Number(rawBasePrice);
  const price = applyGST(basePrice);
  const originalPrice = applyGST(rawBasePrice);

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
    basePrice: Number(basePrice),
    price: Number(price), // GST-inclusive price
    originalPrice: Number(originalPrice),
    isClubMember,
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

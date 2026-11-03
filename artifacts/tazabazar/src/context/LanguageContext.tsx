import { createContext, useContext, useState } from "react";

export type Lang = "en" | "bn";

// Bengali numeral converter
export function toBn(n: number | string): string {
  const bengali = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (d) => bengali[parseInt(d)]);
}

// Category name map
export const categoryNames: Record<string, { en: string; bn: string; icon: string }> = {
  "food-beverages": { en: "Food & Beverages", bn: "খাদ্য ও পানীয়", icon: "🍱" },
  "dairy-eggs": { en: "Dairy & Eggs", bn: "দুগ্ধ ও ডিম", icon: "🥛" },
  "snacks": { en: "Snacks & Confectionery", bn: "স্ন্যাকস ও মিষ্টান্ন", icon: "🍪" },
  "cleaning": { en: "Cleaning Supplies", bn: "পরিষ্কার সামগ্রী", icon: "🧹" },
  "personal-care": { en: "Personal Care", bn: "ব্যক্তিগত যত্ন", icon: "🧴" },
  "baby-care": { en: "Baby Care", bn: "শিশু যত্ন", icon: "👶" },
  "medicine-health": { en: "Medicine & Health", bn: "ওষুধ ও স্বাস্থ্য", icon: "💊" },
  "flash-sales": { en: "Flash Sales", bn: "ফ্ল্যাশ সেল", icon: "⚡" },
};

export function getCatName(slug: string, lang: Lang): string {
  const cat = categoryNames[slug];
  if (!cat) return slug;
  return lang === "bn" ? cat.bn : cat.en;
}

// Price display helper
export function formatPrice(price: number, lang: Lang): string {
  const p = Math.round(price);
  return lang === "bn" ? `৳${toBn(p)}` : `৳${p}`;
}

// Translations
const translations = {
  en: {
    // Nav
    searchPlaceholder: "Search products (e.g. rice, eggs, soap)",
    searchGroceries: "Search groceries...",
    login: "Login",
    logout: "Logout",
    register: "Register",
    cart: "Cart",
    home: "Home",
    myOrders: "My Orders",
    // Hero
    heroTagline: "Fresh Groceries, Delivered Fast",
    heroTitle: "Your Daily\nEssentials, Taza",
    heroSubtitle: "Shop from 200+ products across 8 categories. Delivered within the hour.",
    shopNow: "Shop Now",
    // Sections
    shopByCategory: "Shop by Category",
    flashDeals: "Flash Deals",
    popularRightNow: "Popular Right Now",
    viewAll: "View all",
    // Promo
    promoTitle: "First Order? Get 10% Off!",
    promoSub: "Use code TAZA10 at checkout",
    registerNow: "Register Now",
    // Product card
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    inStock: "In Stock — Delivery within 1 hour",
    // Category page
    productsAvailable: "products available",
    allCategories: "All Categories",
    noProducts: "No products found",
    tryDifferentCat: "Try a different category",
    // Search
    searchResults: "results for",
    searching: "Searching...",
    noResultsTitle: "No results found",
    tryDifferentKeywords: "Try different keywords",
    searchForProducts: "Search for products",
    typeToFind: "Type something to find groceries",
    // Product detail
    save: "Save",
    back: "Back",
    // Cart
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    emptyCartSub: "Add some groceries to get started",
    startShopping: "Start Shopping",
    proceedToCheckout: "Proceed to Checkout",
    clearAll: "Clear all",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    items: "items",
    deliveryFee: "Delivery fee",
    free: "Free",
    total: "Total",
    // Checkout
    checkout: "Checkout",
    deliveryDetails: "Delivery Details",
    deliveryAddress: "Delivery Address *",
    phoneNumber: "Phone Number *",
    note: "Note (optional)",
    placeOrder: "Place Order",
    placingOrder: "Placing Order...",
    enterFullAddress: "Enter your full delivery address",
    enterPhone: "01XXXXXXXXX",
    specialInstructions: "Any special instructions...",
    freeDeliveryIncluded: "Free delivery included",
    cartEmptyCheckout: "Your cart is empty",
    continueShopping: "Continue shopping",
    // Orders
    noOrdersTitle: "No orders yet",
    noOrdersSub: "Your order history will appear here",
    // Order detail
    itemsOrdered: "Items Ordered",
    deliveryDetailsLabel: "Delivery Details",
    // Auth
    welcomeBack: "Welcome back",
    signInToAccount: "Sign in to your TazaBazar account",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    invalidCredentials: "Invalid email or password",
    noAccount: "Don't have an account?",
    createAccount: "Create account",
    joinTaza: "Join TazaBazar for fresh groceries",
    fullName: "Full Name",
    phone: "Phone (optional)",
    minPassword: "Min 6 characters",
    creatingAccount: "Creating account...",
    haveAccount: "Already have an account?",
    alreadyRegistered: "Email already registered or invalid data",
    // Chat
    chatWithUs: "Chat with us",
    chatGreeting: "Hi! I'm TazaBot 🛒 How can I help you today?",
    typeMessage: "Type a message...",
    send: "Send",
    yourPhone: "Your phone number (optional)",
    savePhone: "Save",
    chatSubtitle: "AI Support • Usually replies instantly",
    // Sidebar
    coupons: "Coupons",
    offers: "Offers",
    favourites: "Favourites",
    newArrivals: "New Arrivals",
    // Price
    priceUpdated: "Price updated",
    priceUp: "price rising",
    priceDown: "price falling",
    // Status
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
  bn: {
    // Nav
    searchPlaceholder: "পণ্য খুঁজুন (যেমন: চাল, ডিম, সাবান)",
    searchGroceries: "মুদিখানা খুঁজুন...",
    login: "লগইন",
    logout: "লগআউট",
    register: "নিবন্ধন",
    cart: "কার্ট",
    home: "হোম",
    myOrders: "আমার অর্ডার",
    // Hero
    heroTagline: "তাজা মুদিখানা, দ্রুত ডেলিভারি",
    heroTitle: "আপনার দৈনন্দিন\nপ্রয়োজন, তাজা",
    heroSubtitle: "৮টি বিভাগে ২০০+ পণ্য। এক ঘণ্টার মধ্যে ডেলিভারি।",
    shopNow: "এখনই কিনুন",
    // Sections
    shopByCategory: "বিভাগ অনুযায়ী কেনাকাটা করুন",
    flashDeals: "ফ্ল্যাশ ডিল",
    popularRightNow: "এখন জনপ্রিয়",
    viewAll: "সব দেখুন",
    // Promo
    promoTitle: "প্রথম অর্ডারে ১০% ছাড়!",
    promoSub: "চেকআউটে কোড TAZA10 ব্যবহার করুন",
    registerNow: "এখনই নিবন্ধন করুন",
    // Product card
    addToCart: "কার্টে যোগ করুন",
    outOfStock: "স্টক নেই",
    inStock: "স্টকে আছে — ১ ঘণ্টার মধ্যে ডেলিভারি",
    // Category page
    productsAvailable: "টি পণ্য পাওয়া যাচ্ছে",
    allCategories: "সকল বিভাগ",
    noProducts: "কোনো পণ্য পাওয়া যায়নি",
    tryDifferentCat: "অন্য বিভাগ চেষ্টা করুন",
    // Search
    searchResults: "ফলাফল পাওয়া গেছে",
    searching: "খোঁজা হচ্ছে...",
    noResultsTitle: "কোনো ফলাফল পাওয়া যায়নি",
    tryDifferentKeywords: "অন্য শব্দ দিয়ে খুঁজুন",
    searchForProducts: "পণ্য খুঁজুন",
    typeToFind: "মুদিখানার পণ্য খুঁজতে কিছু লিখুন",
    // Product detail
    save: "সাশ্রয়",
    back: "পেছনে",
    // Cart
    yourCart: "আপনার কার্ট",
    emptyCart: "কার্ট খালি",
    emptyCartSub: "শুরু করতে কিছু মুদিখানা যোগ করুন",
    startShopping: "কেনাকাটা শুরু করুন",
    proceedToCheckout: "চেকআউটে যান",
    clearAll: "সব মুছুন",
    orderSummary: "অর্ডারের সারাংশ",
    subtotal: "উপমোট",
    items: "টি পণ্য",
    deliveryFee: "ডেলিভারি চার্জ",
    free: "বিনামূল্যে",
    total: "মোট",
    // Checkout
    checkout: "চেকআউট",
    deliveryDetails: "ডেলিভারির বিবরণ",
    deliveryAddress: "ডেলিভারির ঠিকানা *",
    phoneNumber: "ফোন নম্বর *",
    note: "মন্তব্য (ঐচ্ছিক)",
    placeOrder: "অর্ডার দিন",
    placingOrder: "অর্ডার হচ্ছে...",
    enterFullAddress: "আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন",
    enterPhone: "০১XXXXXXXXX",
    specialInstructions: "বিশেষ নির্দেশনা...",
    freeDeliveryIncluded: "বিনামূল্যে ডেলিভারি অন্তর্ভুক্ত",
    cartEmptyCheckout: "কার্ট খালি",
    continueShopping: "কেনাকাটা চালিয়ে যান",
    // Orders
    noOrdersTitle: "এখনো কোনো অর্ডার নেই",
    noOrdersSub: "আপনার অর্ডারের ইতিহাস এখানে দেখাবে",
    // Order detail
    itemsOrdered: "অর্ডার করা পণ্য",
    deliveryDetailsLabel: "ডেলিভারির বিবরণ",
    // Auth
    welcomeBack: "স্বাগতম",
    signInToAccount: "আপনার TazaBazar অ্যাকাউন্টে লগইন করুন",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    signIn: "সাইন ইন",
    signingIn: "লগইন হচ্ছে...",
    invalidCredentials: "ইমেইল বা পাসওয়ার্ড ভুল",
    noAccount: "অ্যাকাউন্ট নেই?",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    joinTaza: "তাজা মুদিখানার জন্য TazaBazar-এ যোগ দিন",
    fullName: "পুরো নাম",
    phone: "ফোন (ঐচ্ছিক)",
    minPassword: "কমপক্ষে ৬ অক্ষর",
    creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    alreadyRegistered: "ইমেইল ইতিমধ্যে নিবন্ধিত অথবা তথ্য ভুল",
    // Chat
    chatWithUs: "আমাদের সাথে কথা বলুন",
    chatGreeting: "হ্যালো! আমি তাজাবট 🛒 আজ কীভাবে সাহায্য করতে পারি?",
    typeMessage: "বার্তা লিখুন...",
    send: "পাঠান",
    yourPhone: "আপনার ফোন নম্বর (ঐচ্ছিক)",
    savePhone: "সংরক্ষণ",
    chatSubtitle: "AI সহায়তা • সাথে সাথে উত্তর দেয়",
    // Sidebar
    coupons: "কুপন",
    offers: "অফার",
    favourites: "পছন্দের তালিকা",
    newArrivals: "নতুন পণ্য",
    // Price
    priceUpdated: "মূল্য আপডেট",
    priceUp: "মূল্য বাড়ছে",
    priceDown: "মূল্য কমছে",
    // Status
    pending: "অপেক্ষমাণ",
    confirmed: "নিশ্চিত",
    processing: "প্রক্রিয়াধীন",
    delivered: "ডেলিভারি হয়েছে",
    cancelled: "বাতিল",
  },
};

export type T = typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem("tazabazar-lang") as Lang) || "en"; } catch { return "en"; }
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("tazabazar-lang", l); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/header";
import Login from "./components/auth/login";
import Signup from "./components/auth/singup";
import Profile from "./pages/profile";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const notificationClass = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  danger:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
};

function Notice({ type = "success", children, onClose }) {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${notificationClass[type]}`}>
      <span>{children}</span>
      <button type="button" onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Close message">
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}

function Storefront({ userInfo, onAuthChange, theme, onThemeToggle }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartItems")) || [];
    } catch {
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/shop/products");
        setProducts(data.products || []);
        setCategories(data.categories || ["All"]);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" || product.category === activeCategory;
      const searchMatch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, products, query]);

  const featuredProducts = products.slice(0, 3);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 250 || subtotal === 0 ? 0 : 14;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingCost + tax).toFixed(2));

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to cart`);
    setShowCart(true);
  };

  const updateQuantity = (id, quantity) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  };

  const checkout = async (event) => {
    event.preventDefault();
    setError("");

    if (!userInfo?.token) {
      setShowCart(false);
      navigate("/login");
      return;
    }

    if (Object.values(shipping).some((value) => !value.trim())) {
      setError("Complete shipping details to place the order");
      return;
    }

    try {
      setCheckoutLoading(true);
      const { data } = await axios.post(
        "/api/shop/orders",
        {
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          shipping,
          paymentMethod: "Demo card",
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setOrder(data);
      setCart([]);
      setNotice(`Order ${data.id} confirmed`);
      onAuthChange(readUser());
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Header
        userInfo={userInfo}
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        onAuthChange={onAuthChange}
        searchValue={query}
        onSearchChange={setQuery}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      <main className="bg-fog text-ink transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16">
          <div className="flex min-h-[520px] flex-col justify-end rounded-[2rem] bg-zinc-950 p-7 text-white shadow-soft sm:p-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-stone-300">
              New season, real essentials
            </p>
            <h1 className="max-w-2xl font-display text-6xl leading-[0.92] tracking-normal sm:text-7xl lg:text-8xl">
              Minimal goods, made to last.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              Draken brings together premium apparel, travel pieces, home objects, and tech with clean design and real checkout flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Shop now
              </button>
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Cart ({cartCount})
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-zinc-200 shadow-soft dark:bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=82"
                alt="Premium fashion editorial"
                className="h-full min-h-[360px] w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-zinc-950">
                Curated from {products.length || 18}+ pieces
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featuredProducts.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group overflow-hidden rounded-3xl bg-white text-left text-zinc-950 shadow-soft ring-1 ring-black/5 dark:bg-zinc-900 dark:text-white dark:ring-white/10"
                >
                  <img src={product.image} alt={product.name} className="h-32 w-full object-cover transition group-hover:scale-105" />
                  <div className="p-3">
                    <p className="truncate text-xs font-bold">{product.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{money(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-white/70 px-4 py-5 dark:border-white/10 dark:bg-zinc-900/70 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 text-sm sm:grid-cols-3">
            <div><strong className="block text-lg">2-day dispatch</strong><span className="text-zinc-500 dark:text-zinc-400">Fast demo fulfillment</span></div>
            <div><strong className="block text-lg">Atlas backed</strong><span className="text-zinc-500 dark:text-zinc-400">Users and orders stored in MongoDB</span></div>
            <div><strong className="block text-lg">Free over $250</strong><span className="text-zinc-500 dark:text-zinc-400">Simple realistic checkout totals</span></div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">The collection</p>
              <h2 className="mt-2 font-display text-4xl tracking-normal sm:text-5xl">Clean pieces, useful details.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Search is now in the top bar. Filter by category here and add anything directly to cart.
            </p>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "bg-white text-zinc-600 ring-1 ring-black/10 hover:text-zinc-950 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {(notice || error) && (
            <div className="mb-6 max-w-2xl">
              {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
              {error && <Notice type="danger" onClose={() => setError("")}>{error}</Notice>}
            </div>
          )}

          {loading ? (
            <div className="grid min-h-80 place-items-center rounded-3xl bg-white text-zinc-500 shadow-soft dark:bg-zinc-900 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                Loading collection...
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-3xl bg-white text-zinc-950 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 dark:bg-zinc-900 dark:text-white dark:ring-white/10">
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-950">{product.badge}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span>{product.category}</span>
                      <span><i className="fa-solid fa-star text-amber-500" /> {product.rating}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-extrabold">{product.name}</h3>
                    <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <strong className="block text-xl">{money(product.price)}</strong>
                        <span className="text-sm text-zinc-400 line-through">{money(product.compareAt)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-clay dark:bg-white dark:text-zinc-950"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white text-zinc-950 shadow-2xl dark:bg-zinc-950 dark:text-white">
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
              <h3 className="m-0 text-xl font-extrabold">Your Cart</h3>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                {cartCount} items
              </span>
          <button
            type="button"
            onClick={() => setShowCart(false)}
            className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            aria-label="Close cart"
          >
            <i className="fa-solid fa-xmark" />
          </button>
            </div>
            <div className="max-h-[calc(92vh-76px)] overflow-y-auto bg-white p-4 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:p-6">
          {order && (
            <div className="mb-4">
              <Notice>Order <strong>{order.id}</strong> confirmed. Total paid: {money(order.total)}.</Notice>
            </div>
          )}
          {!cart.length ? (
            <div className="py-14 text-center text-zinc-500 dark:text-zinc-400">
              <i className="fa-solid fa-bag-shopping mb-4 rounded-full bg-zinc-100 p-6 text-2xl text-zinc-950 dark:bg-zinc-900 dark:text-white" />
              <h4 className="text-xl font-extrabold text-zinc-950 dark:text-white">Your cart is empty</h4>
              <p>Add products from the collection and place a saved demo order.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
                    <img src={item.image} alt={item.name} className="h-[72px] w-[72px] rounded-xl object-cover" />
                    <div>
                      <strong className="block">{item.name}</strong>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{money(item.price)}</span>
                      <button type="button" onClick={() => setCart((current) => current.filter((cartItem) => cartItem.id !== item.id))} className="mt-1 block text-xs font-bold text-clay">
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center rounded-full border border-black/10 dark:border-white/10">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2">-</button>
                      <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={checkout} className="grid content-start gap-3 rounded-3xl bg-zinc-100 p-5 dark:bg-zinc-900">
                <h4 className="text-xl font-extrabold text-zinc-950 dark:text-white">Checkout</h4>
                {["fullName", "address", "city", "phone"].map((field) => (
                  <input
                    key={field}
                    className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-white"
                    placeholder={{ fullName: "Full name", address: "Address", city: "City", phone: "Phone" }[field]}
                    value={shipping[field]}
                    onChange={(e) => setShipping({ ...shipping, [field]: e.target.value })}
                  />
                ))}
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400"><span>Shipping</span><strong>{shippingCost ? money(shippingCost) : "Free"}</strong></div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400"><span>Tax</span><strong>{money(tax)}</strong></div>
                  <div className="flex justify-between border-t border-black/10 pt-3 text-lg font-extrabold dark:border-white/10"><span>Total</span><strong>{money(total)}</strong></div>
                </div>
                <button type="submit" disabled={checkoutLoading} className="mt-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950">
                  {checkoutLoading ? "Placing order..." : userInfo ? "Place order" : "Login to checkout"}
                </button>
              </form>
            </div>
          )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [userInfo, setUserInfo] = useState(readUser());
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleAuthChange = (nextUser) => {
    setUserInfo(nextUser);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div>
      <div className="min-h-screen bg-fog font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Storefront userInfo={userInfo} onAuthChange={handleAuthChange} theme={theme} onThemeToggle={toggleTheme} />} />
            <Route path="/login" element={<><Header userInfo={userInfo} onAuthChange={handleAuthChange} theme={theme} onThemeToggle={toggleTheme} /><Login onAuthChange={handleAuthChange} /></>} />
            <Route path="/signup" element={<><Header userInfo={userInfo} onAuthChange={handleAuthChange} theme={theme} onThemeToggle={toggleTheme} /><Signup onAuthChange={handleAuthChange} /></>} />
            <Route path="/profile" element={<><Header userInfo={userInfo} onAuthChange={handleAuthChange} theme={theme} onThemeToggle={toggleTheme} /><Profile /></>} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;

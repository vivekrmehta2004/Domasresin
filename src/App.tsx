import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Sparkles, User, LogOut, FileText, ShoppingBag, Grid, 
  HelpCircle, CheckCircle, ShieldAlert, Heart, Calendar
} from 'lucide-react';
import DomasLogo from './components/DomasLogo';
import ProductCard from './components/ProductCard';
import LoginModal from './components/LoginModal';
import InvoiceViewer from './components/InvoiceViewer';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import { Product, CartItem, Order, UserSession } from './types';

export default function App() {
  // Global Store States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // User Authentication sessions state
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('domas_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Dialog and Navigation controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications
  const [notif, setNotif] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Load backend catalog data and order listings on startup
  useEffect(() => {
    fetchProducts();
    if (session) {
      if (session.role === 'admin') {
        setIsAdminMode(true);
      }
      fetchOrders();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products');
    }
  };

  const fetchOrders = async () => {
    try {
      const url = session?.role === 'admin' ? '/api/orders' : `/api/orders?phone=${session?.phone}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders');
    }
  };

  // Toast notifier helper
  const triggerNotif = (text: string, type: 'success' | 'info' = 'success') => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 3500);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        triggerNotif(`Updated quantities of ${product.name} in basket!`, 'info');
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      triggerNotif(`Added beautiful "${product.name}" to your basket!`, 'success');
      return [...prevCart, { id: product.id, product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    triggerNotif('Item removed from your basket.', 'info');
  };

  // Authentication approvals
  const handleLoginSuccess = (user: UserSession) => {
    setSession(user);
    localStorage.setItem('domas_session', JSON.stringify(user));
    if (user.role === 'admin') {
      setIsAdminMode(true);
      triggerNotif(`Access Approved: Domas Admin Session Initiated!`, 'success');
    } else {
      triggerNotif(`Welcome back, ${user.name}!`, 'success');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setIsAdminMode(false);
    localStorage.removeItem('domas_session');
    setCart([]);
    setOrders([]);
    triggerNotif('Logged out successfully.', 'info');
  };

  // Checkout completes
  const handleCheckoutSuccess = (order: Order) => {
    setCart([]); // Clear cart items
    fetchOrders(); // Refresh user orders ledger
    triggerNotif(`Order placed successfully with ID: #${order.id}`, 'success');
  };

  // Filtering calculation logic
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFAF7] via-[#FFF5F6] to-[#EFF9FC] flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-200">
      
      {/* Background watercolor decor accents */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] max-w-[500px] bg-cyan-100/35 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[50vw] h-[50vw] max-w-[550px] bg-rose-100/30 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Floating toast notification panel */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 px-6 rounded-2xl shadow-xl flex items-center gap-2 border text-xs font-bold leading-normal text-left ${
              notif.type === 'success'
                ? 'bg-emerald-900 border-emerald-800 text-teal-100'
                : 'bg-indigo-900 border-indigo-800 text-[#CEECF5]'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${notif.type === 'success' ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span>{notif.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Navigation header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          
          {/* Logo & Slogan Title */}
          <div className="flex items-center gap-3">
            <DomasLogo size="sm" />
            <div className="text-left hidden sm:block">
              <span className="font-serif text-lg font-bold text-[#0F2C59] tracking-tight hover:text-cyan-900 transition-colors">
                Doma&apos;s Resin Art
              </span>
              <p className="text-[9px] uppercase tracking-[0.16em] text-cyan-900 font-bold opacity-80 leading-none mt-0.5">
                Infusing Art Into Every Creation
              </p>
            </div>
          </div>

          {/* Inline category headers */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {['all', 'coasters', 'clocks', 'bookmarks', 'keychains', 'festival', 'custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsAdminMode(false); }}
                className={`hover:text-[#0F2C59] transition-colors relative cursor-pointer select-none py-1 flex items-center gap-1 ${
                  selectedCategory === cat && !isAdminMode
                    ? 'text-[#0F2C59]'
                    : ''
                }`}
              >
                <span>{cat === 'festival' ? 'Festival Special ✨' : cat === 'all' ? 'show all' : cat}</span>
                {selectedCategory === cat && !isAdminMode && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#C5A880]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Action Hub (Cart, Login, Profile) */}
          <div className="flex items-center gap-3">
            
            {/* Admin status tag */}
            {session?.role === 'admin' && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`py-1.5 px-3.5 rounded-xl border font-extrabold text-[10px] uppercase tracking-wider select-none cursor-pointer flex items-center gap-1.5 transition-all ${
                  isAdminMode
                    ? 'bg-indigo-900 text-amber-300 border-indigo-800 shadow-md shadow-indigo-900/10'
                    : 'bg-white hover:bg-slate-50 text-indigo-900 border-indigo-200'
                }`}
              >
                ⚙️ Admin Pane
              </button>
            )}

            {/* Shopping cart button */}
            {!isAdminMode && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-xl bg-white border border-rose-100 hover:bg-[#FCFAF7] transition-all relative flex items-center gap-2 group cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#0F2C59] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-[#0F2C59] hidden sm:inline">My Basket</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                    {cart.reduce((qty, p) => qty + p.quantity, 0)}
                  </span>
                )}
              </button>
            )}

            {/* Profile User state widget */}
            {session ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#0F2C59] max-w-[100px] truncate hidden md:inline">
                  {session.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer select-none border border-rose-100"
                  title="Logout from system"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="p-2.5 md:px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1E3E62] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-cyan-900/10 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login / Join</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* Admin Panel Override Workspace View */}
          {isAdminMode && session?.role === 'admin' ? (
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <AdminPanel
                products={products}
                orders={orders}
                onRefreshData={() => { fetchProducts(); fetchOrders(); }}
                onOpenInvoice={(ord) => setSelectedInvoice(ord)}
              />
            </motion.div>
          ) : (
            /* Main Customer Shopping view */
            <motion.div
              key="customer-shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* Luxury Elegant Hero showcase panel */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-50 via-white to-blue-50 border border-rose-100/70 p-8 md:p-12 text-left shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none rounded-full bg-gradient-to-br from-[#CEECF5]/30 to-transparent -mr-16 -mt-16" />
                
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex gap-1.5 items-center bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-100 text-[10px] font-bold text-[#0F2C59] uppercase tracking-widest shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" /> 100% Handcrafted Under Premium Standards
                  </div>
                  
                  <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#0F2C59] tracking-tight leading-tight">
                    Infusing Ethereal Art Into <span className="text-[#C5A880] italic">Resin Creations</span>
                  </h1>
                  
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-lg">
                    Discover polished visual clocks, organic wildflower embedded coasters, stellar bookmarks, and customized letter keychains. Each artifact is hand-finished with heat-resistant, FDA compliant materials for exquisite gloss.
                  </p>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const target = document.getElementById('shop-listings');
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-[#0F2C59] hover:bg-cyan-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#0F2C59]/10"
                    >
                      Browse Masterpieces
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedCategory('custom');
                        const target = document.getElementById('shop-listings');
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-white border border-rose-100 hover:bg-[#FCFAF7] text-[#0F2C59] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Order Custom Designs
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Order lookup tracker for logged in customers */}
              {session && orders.length > 0 && (
                <div className="bg-white border border-rose-100 p-6 rounded-3xl text-left space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-rose-100/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2.5 bg-sky-50 text-[#0F2C59] font-bold text-[10px] uppercase rounded-lg border border-sky-100 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#C5A880]" /> Active Orders Tracker
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Orders count: {orders.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-2xl bg-[#FCFAF7] border border-rose-100/40 flex justify-between items-center hover:border-cyan-100 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] font-bold text-[#0F2C59]">Order: #{o.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              o.paymentStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              Pay: {o.paymentStatus === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING CHECK'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                            {o.items.slice(0, 2).map(item => item.productName).join(', ')}
                            {o.items.length > 2 && '...'}
                          </p>

                          <div className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1 capitalize">
                            📦 Carrier Status: <span className="font-extrabold text-[#0F2C59]">{o.orderStatus?.toLowerCase().replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Invoice download is available once paymentStatus confirm */}
                        <div className="shrink-0">
                          {o.paymentStatus === 'CONFIRMED' ? (
                            <button
                              onClick={() => setSelectedInvoice(o)}
                              className="px-3 py-2 bg-[#0F2C59] hover:bg-cyan-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" /> Download Invoice
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoice(o)}
                              className="px-3 py-2 border border-dashed border-rose-300 text-rose-500 hover:bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" /> Check Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shelf Filter view header */}
              <div id="shop-listings" className="text-left space-y-4 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#0F2C59] tracking-tight">
                      Explore Artisan Creations
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hover to rotate pieces in 3D and enjoy realistic light shine values.
                    </p>
                  </div>

                  {/* Search Engine and filter controls */}
                  <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="relative w-full md:w-64 max-w-sm">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search specific resin pieces..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-100 rounded-2xl text-xs focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Categorization controls row (Mobile visual) */}
                <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 mr-[-1rem] pr-4 select-none">
                  {['all', 'coasters', 'clocks', 'bookmarks', 'keychains', 'festival', 'custom'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer capitalize ${
                        selectedCategory === cat
                          ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                          : 'bg-white text-slate-500 border-rose-50 hover:bg-rose-50/20'
                      }`}
                    >
                      {cat === 'festival' ? 'Festival Special ✨' : cat === 'all' ? 'show all' : cat}
                    </button>
                  ))}
                </div>

                {/* Dynamic listings grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {filteredProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ProductCard
                          product={p}
                          onAddToCart={handleAddToCart}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 text-slate-400 font-serif italic text-base">
                    No masterpieces found matching your filters.
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Styled Footer block */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-rose-100 mt-20 text-left">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DomasLogo size="sm" />
              <h3 className="font-serif font-bold text-[#0F2C59] text-base leading-none">
                Doma&apos;s Resin Art
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Hand-finished with love, floral petals, and metallic leaf gold elements. Each design brings natural watercolor waves directly to your home desktops.
            </p>
          </div>

          {/* Guidelines info */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#0F2C59] uppercase tracking-wider text-xs">Customer FAQs</h4>
            <div className="text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <p>📍 <strong>UPI Dispatch:</strong> Copy Upi ID <strong className="font-mono">domasresinart@gmail.com</strong> to pay, paste transaction code, or use our instant automatic payment gateway during checkout!</p>
              <p>📦 <strong>Delivery policy:</strong> Package insured, shipped safely in customized thick bubble wraps with ribbons.</p>
            </div>
          </div>

          {/* Secure details */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#0F2C59] uppercase tracking-wider text-xs">Doma's Resin Art Contact Info</h4>
            <div className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
              <p>📧 Email: domasresinart@gmail.com</p>
              <p>📞 Phone/Whatsapp: +91 9558818775</p>
              <p>🏛️ Office: Doma's Resin Art, Bharuch, Gujarat 392001</p>
            </div>
          </div>

        </div>

        <div className="bg-[#FCFAF7] border-t border-rose-100/40 py-4 text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} Doma&apos;s Resin Art. Authorized electronic receipts only. All Rights Reserved.
        </div>
      </footer>

      {/* Overlay Drawer controls */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckoutSuccess={handleCheckoutSuccess}
            session={session}
            onOpenLogin={() => { setIsCartOpen(false); setIsLoginOpen(true); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceViewer
            order={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

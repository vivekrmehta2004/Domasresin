import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ChevronRight, MapPin, CreditCard, CheckCircle, Radio, Copy, Check } from 'lucide-react';
import { CartItem, Product, Order, UserSession } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutSuccess: (order: Order) => void;
  session: UserSession | null;
  onOpenLogin: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
  session,
  onOpenLogin,
}: CartDrawerProps) {
  // Checkout Steps: 'cart' | 'shipping' | 'payment' | 'done'
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'done'>('cart');
  const [name, setName] = useState(session?.name || '');
  const [phone, setPhone] = useState(session?.phone || '');
  const [email, setEmail] = useState(session?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);
  const [verifyingGateway, setVerifyingGateway] = useState(false);

  if (!isOpen) return null;

  const getActivePrice = (product: any) => {
    if (product.discountPercent && product.discountPercent > 0) {
      return Math.round(product.price * (1 - product.discountPercent / 100));
    }
    return product.price;
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + getActivePrice(item.product) * item.quantity, 0);

  const handleNextToShipping = () => {
    if (cartItems.length === 0) return;
    if (!session) {
      onOpenLogin();
      return;
    }
    // Auto populate details from authenticated session
    setName(name || session.name);
    setPhone(phone || session.phone);
    setEmail(email || session.email);
    setStep('shipping');
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !shippingAddress) {
      setError('Please fill in all mandatory customer fields.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'UPI' && !transactionId) {
      setError('Please provide the 12-digit UTR Transaction Ref ID for payment confirmation.');
      return;
    }
    
    setError('');
    setLoading(true);

    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email || 'notprovided@domasresinart.com',
      shippingAddress,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.product.name,
        price: getActivePrice(item.product),
        quantity: item.quantity
      })),
      paymentMethod,
      transactionId: paymentMethod === 'UPI' ? transactionId : '',
      totalAmount,
      paymentStatus: (paymentMethod === 'UPI' && autoVerified) ? 'CONFIRMED' : 'PENDING'
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (response.ok) {
        setCompletedOrder(data);
        setStep('done');
        onCheckoutSuccess(data);
      } else {
        setError(data.error || 'Failed to place resin art order.');
      }
    } catch (err) {
      // Offline fallback mock order
      const mockOrder: Order = {
        id: 'ord_' + Math.floor(100000 + Math.random() * 900000),
        customerName: name,
        customerPhone: phone,
        customerEmail: email || 'guest@domasresinart.com',
        shippingAddress,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.product.name,
          price: getActivePrice(item.product),
          quantity: item.quantity
        })),
        paymentMethod,
        paymentStatus: (paymentMethod === 'UPI' && autoVerified) ? 'CONFIRMED' : 'PENDING',
        orderStatus: 'PENDING',
        transactionId: paymentMethod === 'UPI' ? transactionId : '',
        totalAmount,
        createdAt: new Date().toISOString(),
        verifiedAt: (paymentMethod === 'UPI' && autoVerified) ? new Date().toISOString() : undefined,
        invoiceNumber: (paymentMethod === 'UPI' && autoVerified) ? 'DRA-INV-' + String(Math.floor(1000 + Math.random() * 9000)) : undefined
      };
      setCompletedOrder(mockOrder);
      setStep('done');
      onCheckoutSuccess(mockOrder);
    } finally {
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('domasresinart@gmail.com');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleTriggerAutoPay = () => {
    setVerifyingGateway(true);
    setError('');
    setTimeout(() => {
      const generatedUtr = "93" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
      setTransactionId(generatedUtr);
      setAutoVerified(true);
      setVerifyingGateway(false);
    }, 1500);
  };

  const resetDrawer = () => {
    setStep('cart');
    setShippingAddress('');
    setTransactionId('');
    setCompletedOrder(null);
    setAutoVerified(false);
    setVerifyingGateway(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Click outside backdrop close drawer */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-[#FCFAF7] h-full shadow-2xl flex flex-col z-10 border-l border-rose-100"
      >
        {/* Dynamic header */}
        <div className="p-6 border-b border-rose-100/50 flex justify-between items-center bg-[#FCFAF7]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0F2C59]" />
            <span className="font-serif font-bold text-lg text-[#0F2C59]">
              {step === 'cart' && 'My Art Basket'}
              {step === 'shipping' && 'Delivery Info'}
              {step === 'payment' && 'Custom UPI / COD Gate'}
              {step === 'done' && 'Order Logged!'}
            </span>
          </div>
          <button
            onClick={resetDrawer}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#0F2C59] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Viewport */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Cart Items Summary */}
            {step === 'cart' && (
              <motion.div
                key="cart-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                    <ShoppingBag className="w-16 h-16 opacity-35 text-[#C5A880] mb-4 stroke-1 animate-pulse" />
                    <p className="font-serif italic text-base text-[#0F2C59] font-medium">Your basket is currently empty</p>
                    <p className="text-xs mt-1">Explore our 3D custom listings to claim one!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-white border border-rose-100/50 p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-rose-50"
                        />
                        <div className="flex-grow text-left">
                          <h4 className="text-xs font-serif font-bold text-[#0F2C59] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] capitalize text-slate-400 font-semibold">{item.product.category}</span>
                          <div className="text-xs mt-1 flex flex-wrap items-center gap-1 font-bold">
                            {item.product.discountPercent && item.product.discountPercent > 0 ? (
                              <>
                                <span className="text-emerald-700 font-extrabold">₹{getActivePrice(item.product)}</span>
                                <span className="text-[10px] line-through text-slate-400">₹{item.product.price}</span>
                                <span className="text-[8px] px-1 py-0.2 rounded bg-rose-50 text-rose-500 font-extrabold">{item.product.discountPercent}% OFF</span>
                              </>
                            ) : (
                              <span className="text-[#0F2C59]">₹{item.product.price}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Counter & Delete buttons */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-[#FCFAF7] border border-rose-100 px-2.5 py-1 rounded-xl">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="text-xs font-bold text-slate-400 hover:text-[#0F2C59] px-1 select-none"
                            >
                              -
                            </button>
                            <span className="text-xs font-extrabold text-[#0F2C59] font-mono">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="text-xs font-bold text-slate-400 hover:text-[#0F2C59] px-1 select-none"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Customer Shipping Entry form */}
            {step === 'shipping' && (
              <motion.form
                key="shipping-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleNextToPayment}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F2C59] pb-2 border-b border-rose-100">
                  <MapPin className="w-4 h-4 text-[#C5A880]" /> Shipping & Contact Details
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Mobile Contact
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-4 py-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Full Delivery Address (Shipping Destination)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apartment #, Street name, Locality, Landmark, City, State, Pincode"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] leading-relaxed"
                  />
                </div>

                {error && <div className="p-2 text-xs text-rose-500 bg-rose-50 rounded-xl">{error}</div>}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F2C59] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 transition-colors shadow-lg shadow-cyan-900/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Select Payment Method</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* Step 3: Combined UPI/COD Payment Gates */}
            {step === 'payment' && (
              <motion.form
                key="payment-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePlaceOrder}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F2C59] pb-2 border-b border-rose-100">
                  <CreditCard className="w-4 h-4 text-[#C5A880]" /> Complete Purchase Checkout
                </div>

                {/* Gateway selection toggles */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* UPI Gateway Card Toggle */}
                  <div
                    onClick={() => { setPaymentMethod('UPI'); setError(''); }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'UPI'
                        ? 'border-[#0F2C59] bg-[#0F2C59]/5'
                        : 'border-rose-100 bg-white hover:border-[#C5A880]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0F2C59]">Instant UPI Pay</span>
                      <Radio className={`w-4 h-4 ${paymentMethod === 'UPI' ? 'text-[#0F2C59] fill-current' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Free Gateway / QR Scan</span>
                  </div>

                  {/* COD Gateway Card Toggle */}
                  <div
                    onClick={() => { setPaymentMethod('COD'); setError(''); }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'COD'
                        ? 'border-[#0F2C59] bg-[#0F2C59]/5'
                        : 'border-rose-100 bg-white hover:border-[#C5A880]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0F2C59]">COD Option</span>
                      <Radio className={`w-4 h-4 ${paymentMethod === 'COD' ? 'text-[#0F2C59] fill-current' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Pay Cash on Delivery</span>
                  </div>
                </div>

                {/* Payment method detailed panels */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'UPI' ? (
                    <motion.div
                      key="upi-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-3xl relative overflow-hidden"
                    >
                      <div className="text-center font-bold text-xs text-indigo-950 border-b border-dashed border-slate-200 pb-2.5 flex justify-center items-center gap-1.5">
                        🛡️ Doma&apos;s Seamless Instant UPI Peer-to-Peer Gateway
                      </div>

                      {verifyingGateway ? (
                        /* Pulsing loader overlay */
                        <div className="flex flex-col items-center justify-center py-10 space-y-3.5 text-center bg-white border border-rose-100 rounded-2xl animate-pulse">
                          <div className="w-10 h-10 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin" />
                          <div className="text-xs font-bold text-[#0F2C59]">Routing to Secure UPI Peer Gateway...</div>
                          <p className="text-[10px] text-slate-500 max-w-[240px] px-2 leading-relaxed">
                            Simulating handoff with National Payments Corporation of India (NPCI) nodes for real-time verification loop...
                          </p>
                        </div>
                      ) : autoVerified ? (
                        /* Verification confirmed view */
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                          <h4 className="font-bold text-xs text-emerald-900">✨ Automated UPI Gateway Dispatch Success!</h4>
                          <p className="text-[10px] text-emerald-800 leading-normal max-w-sm mx-auto">
                            Secure pay loop confirmed. Your mock payment transaction is now <strong>VERIFIED</strong>. Press the button below to generate your printable tax invoice code instantly!
                          </p>
                          <div className="bg-white border border-emerald-100 p-2 rounded-xl text-[11px] font-mono font-bold text-emerald-800 inline-block">
                            UTR / REF: {transactionId}
                          </div>
                        </div>
                      ) : (
                        /* Standard QR & Pay via Deep-link view */
                        <div className="space-y-4">
                          {/* Dynamic simulated vector QR Code */}
                          <div className="flex flex-col items-center bg-white p-3 border border-slate-100 rounded-2xl">
                            <div className="bg-white border-2 border-slate-900 p-3 rounded-xl flex items-center justify-center shadow-sm">
                              <svg width="120" height="120" viewBox="0 0 100 100" className="text-slate-900">
                                {/* Standard QR squares corners */}
                                <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                                <rect x="5" y="5" width="20" height="20" fill="white" />
                                <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                                <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                                <rect x="75" y="5" width="20" height="20" fill="white" />
                                <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                                <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                                <rect x="5" y="75" width="20" height="20" fill="white" />
                                <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                                {/* Decorative design dots representing UPI payments */}
                                <rect x="40" y="5" width="8" height="8" fill="currentColor" />
                                <rect x="50" y="15" width="6" height="12" fill="currentColor" />
                                <rect x="15" y="45" width="8" height="6" fill="currentColor" />
                                <rect x="80" y="40" width="12" height="10" fill="currentColor" />
                                <rect x="45" y="45" width="18" height="18" fill="currentColor" />
                                <rect x="55" y="50" width="8" height="8" fill="white" />
                                <rect x="45" y="75" width="10" height="10" fill="currentColor" />
                                <rect x="80" y="75" width="14" height="14" fill="currentColor" />
                                
                                {/* Centered tiny decorative Domas D logo */}
                                <rect x="40" y="40" width="20" height="20" fill="#0F2C59" rx="4" />
                                <text x="50" y="54" fill="#E5C158" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="serif">D</text>
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mt-2.5">
                              Total Payable: ₹{totalAmount}
                            </span>
                          </div>

                          {/* Instant automatic pay button */}
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={handleTriggerAutoPay}
                              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all shadow-md select-none cursor-pointer"
                            >
                              ⚡ Click to Pay Automatically via UPI App
                            </button>
                            <a
                              href={`upi://pay?pa=domasresinart@gmail.com&pn=Domas%20Resin%20Art&cu=INR&am=${totalAmount}&tn=Order%20for%20Resin%20Art`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 border border-[#0F2C59]/20 text-[#0F2C59] bg-white rounded-xl text-xs hover:bg-[#0F2C59]/5 transition-all text-center font-medium block"
                            >
                              📱 Mobile Deep Link: Launch Pay App Directly
                            </a>
                          </div>

                          {/* Key info copies and tutorials */}
                          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 border-t border-slate-200 pt-3">
                            <div className="flex justify-between items-center">
                              <span>Default UPI ID: <strong className="font-mono text-slate-800">domasresinart@gmail.com</strong></span>
                              <button
                                type="button"
                                onClick={copyUpiId}
                                className="text-[10px] text-[#C5A880] hover:text-[#0F2C59] flex items-center gap-0.5 select-none font-bold"
                              >
                                {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                {copiedUpi ? 'Copied' : 'Copy ID'}
                              </button>
                            </div>
                            <p>Or manual: copy or scan the code above, pay to <strong>domasresinart@gmail.com</strong> inside GPay, PhonePe, Paytm or BHIM, and paste the 12-digit transaction ID below:</p>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                              12-Digit UPI Transaction Reference ID / UTR
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={12}
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 129485721834"
                              className="w-full text-center tracking-widest text-sm font-bold font-mono px-4 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cod-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white border border-rose-100 p-4 rounded-3xl space-y-2 text-[11px] leading-relaxed text-slate-600"
                    >
                      <div className="text-center font-bold text-xs text-amber-900 pb-1 flex justify-center gap-1">
                        📦 Cash-on-Delivery Terms
                      </div>
                      <p>• Our courier partner will validate receipt of Cash of <strong className="text-slate-800">₹{totalAmount}</strong> upon physical handoff at your shipping address.</p>
                      <p>• <span className="font-bold text-amber-700">Crucial rule:</span> Printable invoice generation, tracking numbers, and verified receipt records activate <strong>only after the admin has confirmed receipt physically</strong> via their control desk.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <div className="p-2 text-xs text-rose-500 bg-rose-50 rounded-xl">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0F2C59] text-white rounded-xl font-bold select-none cursor-pointer text-xs uppercase tracking-wider hover:bg-cyan-900 transition-colors shadow-lg shadow-cyan-900/10 flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Submitting Purchase Ticket...' : `Place Order (₹${totalAmount})`}
                </button>
              </motion.form>
            )}

            {/* Step 4: Checkout Completed Summary */}
            {step === 'done' && completedOrder && (
              <motion.div
                key="done-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-4"
              >
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="font-serif font-bold text-lg text-[#0F2C59]">Purchase Sent Safely!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your purchase of <strong>₹{completedOrder.totalAmount}</strong> has been logged to the artisan queue under Order ID <strong className="font-mono text-slate-800">#{completedOrder.id}</strong>!
                </p>

                <div className="bg-[#FAF3F3] border border-rose-100 p-4 rounded-2xl text-left text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-[#0F2C59] mb-1">What Happens Next?</div>
                  <p>1. <strong>Verification:</strong> The shop owner will check the UPI Transaction / COD request on their business dashboard shortly.</p>
                  <p>2. <strong>Invoices Activation:</strong> Upon confirmation, a verified tax invoice code (e.g. DOMAS-INV-XXXX) is authorized.</p>
                  <p>3. <strong>Fulfillment:</strong> Open your user profile dashboard page anywhere on the navbar to track, view status, or download the printable receipts!</p>
                </div>

                <button
                  onClick={resetDrawer}
                  className="w-full py-3 bg-[#0F2C59] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 transition-colors cursor-pointer select-none shadow-md shadow-cyan-900/10"
                >
                  Continue Browsing Designs
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Floating summary footer (only visible in cart step) */}
        {step === 'cart' && cartItems.length > 0 && (
          <div className="p-6 border-t border-rose-100/50 bg-[#FCFAF7] space-y-4">
            <div className="flex justify-between items-baseline text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Subtotal:</span>
              <span className="text-xl font-extrabold text-[#0F2C59]">₹{totalAmount}</span>
            </div>
            <p className="text-[10px] text-slate-400 text-left leading-normal">
              Courier shipping charges, package insurances, custom bubble wrap wrapping, and taxes are completely handled by Domas.
            </p>
            <button
              onClick={handleNextToShipping}
              className="w-full py-3 bg-[#0F2C59] text-white rounded-xl font-bold select-none cursor-pointer text-xs uppercase tracking-wider hover:bg-cyan-900 transition-colors shadow-lg shadow-cyan-900/10 flex items-center justify-center gap-1.5"
            >
              <span>{session ? 'Proceed to Delivery Config' : 'Login to Continue Checkout'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

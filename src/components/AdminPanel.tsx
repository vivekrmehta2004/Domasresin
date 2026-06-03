import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, ShoppingBag, CheckCircle, XCircle, Trash2, Calendar, FileText, ArrowRight, ShieldCheck, DollarSign, Upload, Percent, Eye } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  onOpenInvoice: (order: Order) => void;
}

export default function AdminPanel({ products, orders, onRefreshData, onOpenInvoice }: AdminPanelProps) {
  // Navigation tabs: 'dashboard' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  // New Product Form state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState<'coasters' | 'keychains' | 'bookmarks' | 'clocks' | 'custom' | 'other' | 'festival'>('coasters');
  const [productDimensions, setProductDimensions] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageBase64, setProductImageBase64] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [productDiscountPercent, setProductDiscountPercent] = useState('0');
  const [productFestivalName, setProductFestivalName] = useState('');
  
  // Inline edit state maps for existing products
  const [editDiscountPct, setEditDiscountPct] = useState<Record<string, number>>({});
  const [editFestivalTag, setEditFestivalTag] = useState<Record<string, string>>({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle local storage direct image uploads (no links, converts file to Base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setError('Selected file is too large. Image limit is 8MB.');
      return;
    }

    setImageFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImageBase64(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  // Add Product Submit API
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice || !productImageBase64) {
      setError('Please fill in product name, price, and select a local file image.');
      return;
    }
    setError('');
    setLoading(true);

    const payload = {
      name: productName,
      price: Number(productPrice),
      image: productImageBase64,
      category: productCategory,
      description: productDescription,
      dimensions: productDimensions,
      discountPercent: Number(productDiscountPercent) || 0,
      festivalName: productFestivalName
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSuccessMsg('Artisan product uploaded successfully into database!');
        // Reset inputs
        setProductName('');
        setProductPrice('');
        setProductDimensions('');
        setProductDescription('');
        setProductImageBase64('');
        setImageFileName('');
        setProductDiscountPercent('0');
        setProductFestivalName('');
        onRefreshData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create product listing.');
      }
    } catch (err) {
      setError('Server disconnected. Could not save product specifications.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing product discount & festivalName
  const handleUpdateDiscount = async (id: string, discountPercent: number, festivalName: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercent, festivalName })
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Update product discount error', err);
    }
  };

  // Delete product API
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product from your shop inventory?')) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Confirm order payment and generate invoice
  const handleConfirmOrder = async (orderId: string, status: 'CONFIRMED' | 'DECLINED') => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: status,
          orderStatus: status === 'CONFIRMED' ? 'PREPARING' : 'CANCELLED'
        })
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Order update error', err);
    }
  };

  // Update order delivery/logistics state
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Shipment status error', err);
    }
  };

  // Stats summaries
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'CONFIRMED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingPayments = orders.filter(o => o.paymentStatus === 'PENDING');
  const confirmedPayments = orders.filter(o => o.paymentStatus === 'CONFIRMED');

  const categoryCounts = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-xl max-w-7xl mx-auto my-8">
      
      {/* Admin header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-rose-100/50 pb-6 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-indigo-900 text-amber-300 text-[10px] font-bold tracking-widest rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> DOMA ATELIER PRIVILEGED PANEL
            </span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
            Flipkart-Like Business Owner Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin privilege for uploading products directly from local files and approving client payments.
          </p>
        </div>

        {/* Dashboard Navigation tabs */}
        <div className="flex bg-[#FCFAF7] border border-rose-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0F2C59] text-white shadow-md'
                : 'text-slate-500 hover:text-[#0F2C59]'
            }`}
          >
            Metrics Report
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#0F2C59] text-white shadow-md'
                : 'text-slate-500 hover:text-[#0F2C59]'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0F2C59] text-white shadow-md'
                : 'text-slate-500 hover:text-[#0F2C59]'
            }`}
          >
            Orders Pending ({pendingPayments.length})
          </button>
        </div>
      </div>

      {/* Tabs Layout blocks */}
      <div className="mt-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 text-left">
            {/* Numeric Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Sales box */}
              <div className="bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Total Verified Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F2C59] mt-2">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{confirmedPayments.length} purchases confirmed</p>
              </div>

              {/* Pendings box */}
              <div className="bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Awaiting Verification</span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F2C59] mt-2">{pendingPayments.length}</div>
                <p className="text-[10px] text-amber-600 mt-1 font-semibold">Checks needed immediately</p>
              </div>

              {/* Active listings */}
              <div className="bg-gradient-to-tr from-blue-50 to-cyan-50 border border-blue-100 p-5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Active Storefront Inventory</span>
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F2C59] mt-2">{products.length} Items</div>
                <p className="text-[10px] text-blue-600 mt-1 font-semibold">Exhibiting unique 3D profiles</p>
              </div>

              {/* Total Customers */}
              <div className="bg-gradient-to-tr from-rose-50 to-pink-50 border border-rose-100 p-5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Order Receipts Issued</span>
                  <Percent className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F2C59] mt-2">{orders.length}</div>
                <p className="text-[10px] text-rose-600 mt-1 font-semibold">Total checkout events registered</p>
              </div>

            </div>

            {/* Simple Gorgeous Custom SVG Analytics bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Chart 1: Inventory by Category */}
              <div className="bg-[#FCFAF7] border border-rose-100 p-6 rounded-3xl">
                <h4 className="font-serif font-bold text-sm text-[#0F2C59] mb-4">Stock Breakdown by Category</h4>
                <div className="space-y-4">
                  {['coasters', 'keychains', 'bookmarks', 'clocks', 'custom', 'other'].map(cat => {
                    const count = categoryCounts[cat] || 0;
                    const maxCount = Math.max(...(Object.values(categoryCounts) as number[]), 1);
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold capitalize text-slate-600">
                          <span>{cat}</span>
                          <span>{count} design{count !== 1 && 's'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percentage}%` }}
                            className="bg-gradient-to-r from-[#C5A880] to-[#0F2C59] h-full rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Action tips card */}
              <div className="bg-indigo-900 text-amber-50 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-lg font-bold text-amber-300">Artisan Business Intelligence Tips</h4>
                  <ul className="text-xs space-y-3 leading-relaxed text-indigo-100/90 mt-4">
                    <li>💡 <strong>Direct Files Base64 Magic:</strong> When uploading local storage files, they are safely encoded as text. No file servers are rented.</li>
                    <li>🔒 <strong>Secure UTR Reviews:</strong> Double-check the 12-digit UPI code with your bank statement before clicking &quot;Confirm Payment&quot; on orders.</li>
                    <li>📄 <strong>Downloadable PDFs:</strong> Confirming a client order automatically generates an electronic PDF-friendly receipt ready for instant customer downloads.</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-indigo-800 text-[10px] text-indigo-200">
                  Business Admin Node running on v1.2 secure local ports.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Products Listing & Direct Base64 upload Form */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Image upload and Product Creator form */}
            <div className="lg:col-span-1 bg-[#FCFAF7] border border-rose-100 p-6 rounded-3xl h-fit">
              <h3 className="font-serif font-bold text-md text-[#0F2C59] border-b border-rose-100 pb-3 mb-4 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-[#C5A880]" /> Add New Product Listing
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4">
                
                {/* File Upload Stage */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-[#C5A880]" /> Upload Local Product Image
                  </label>
                  <div className="relative border-2 border-dashed border-rose-100/70 rounded-2xl bg-white p-4 text-center hover:border-[#C5A880] transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {productImageBase64 ? (
                      <div className="space-y-2">
                        <img
                          src={productImageBase64}
                          alt="preview"
                          className="w-24 h-24 object-cover mx-auto rounded-xl border border-rose-50"
                        />
                        <div className="text-[10px] font-mono text-emerald-600 truncate max-w-full">
                          ✓ {imageFileName}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setProductImageBase64(''); setImageFileName(''); }}
                          className="text-[9px] font-bold text-rose-500 underline flex z-25 relative mx-auto select-none"
                        >
                          Clear Selection
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-slate-600 block">Click or Drag Image File</span>
                        <span className="text-[9px] text-slate-400">Direct Local Upload (max 8MB file)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Resin Design Name
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Celestial Nebula Wall Clock"
                    className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Category
                    </label>
                    <select
                      value={productCategory}
                      onChange={(e: any) => setProductCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] capitalize"
                    >
                      <option value="coasters">Coasters</option>
                      <option value="keychains">Keychains</option>
                      <option value="bookmarks">Bookmarks</option>
                      <option value="clocks">Clocks</option>
                      <option value="festival">Festival Special ✨</option>
                      <option value="custom">Custom Crafts</option>
                      <option value="other">Other Art</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#C5A880]" /> Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={productDiscountPercent}
                      onChange={(e) => setProductDiscountPercent(e.target.value)}
                      placeholder="e.g. 10 (for 10% discount)"
                      className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Festival Tag / Event
                    </label>
                    <input
                      type="text"
                      value={productFestivalName}
                      onChange={(e) => setProductFestivalName(e.target.value)}
                      placeholder="e.g. Rakshabandhan, Diwali, Every Festival"
                      className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Dimensions / Material Info
                  </label>
                  <input
                    type="text"
                    value={productDimensions}
                    onChange={(e) => setProductDimensions(e.target.value)}
                    placeholder="e.g. 12 x 12 inches circular, 4mm thick"
                    className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Description & Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Artisan story, ingredients, colors used, packaging specifications..."
                    className="w-full px-4 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-[#C5A880] leading-relaxed"
                  />
                </div>

                {error && <div className="p-2.5 text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl">{error}</div>}
                {successMsg && <div className="p-2.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">{successMsg}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 select-none cursor-pointer bg-[#0F2C59] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 transition-colors shadow-lg shadow-cyan-900/10"
                >
                  {loading ? 'Adding Listing Spec...' : 'Upload Product Profile'}
                </button>
              </form>
            </div>

            {/* Inventory table control */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-md text-[#0F2C59]">Active Inventory Table</h3>
              
              {products.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed rounded-3xl">
                  Empty catalog. Add a new design profile on the left input.
                </div>
              ) : (
                <div className="border border-rose-100 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#0F2C59]/10 text-[#0F2C59] uppercase tracking-wider text-[10px] font-bold">
                        <th className="p-3">Product Photo</th>
                        <th className="p-3">Design Title & Category</th>
                        <th className="p-3 text-right">Value (₹)</th>
                        <th className="p-3">Discount / Festival Setting</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {products.map(p => {
                        const currentPct = editDiscountPct[p.id] !== undefined ? editDiscountPct[p.id] : (p.discountPercent || 0);
                        const currentTag = editFestivalTag[p.id] !== undefined ? editFestivalTag[p.id] : (p.festivalName || '');
                        const finalPrice = Math.round(p.price * (1 - currentPct / 100));

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-[#0F2C59]">{p.name}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="capitalize px-1.5 py-0.2 bg-slate-100 rounded text-[9px] font-bold text-slate-500">
                                  {p.category}
                                </span>
                                {p.festivalName && (
                                  <span className="bg-amber-100/70 text-amber-800 border border-amber-200/50 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                    🎉 {p.festivalName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="font-extrabold text-slate-800">₹{p.price}</div>
                              {currentPct > 0 && (
                                <div className="text-[10px] text-emerald-600 font-extrabold mt-0.5">
                                  Net: ₹{finalPrice}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="space-y-1 max-w-[150px]">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase w-8">Dis %:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={currentPct}
                                    onChange={(e) => {
                                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                      setEditDiscountPct(prev => ({ ...prev, [p.id]: val }));
                                    }}
                                    className="w-12 px-1 py-0.5 text-center text-xs font-mono font-bold bg-white border border-rose-100 rounded focus:outline-none focus:border-[#C5A880]"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase w-8">Tag:</span>
                                  <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => {
                                      setEditFestivalTag(prev => ({ ...prev, [p.id]: e.target.value }));
                                    }}
                                    placeholder="e.g. Diwali Special"
                                    className="w-24 px-1 py-0.5 text-[10px] bg-white border border-rose-100 rounded focus:outline-none focus:border-[#C5A880]"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDiscount(p.id, currentPct, currentTag)}
                                  className="px-2 py-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all select-none cursor-pointer"
                                  title="Apply & Save Discount Settings"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded hover:text-rose-700 transition-all select-none cursor-pointer"
                                  title="Delete listing profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Detailed Purchase Orders Lists */}
        {activeTab === 'orders' && (
          <div className="space-y-4 text-left">
            <h3 className="font-serif font-bold text-md text-[#0F2C59]">Purchase Approval Ledger</h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-[#FCFAF7] border border-dashed border-rose-100 p-8 rounded-3xl">
                No orders registered in the ledger yet. Continue shopping in frontend to trigger orders.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => {
                  const isCurrentPending = o.paymentStatus === 'PENDING';
                  return (
                    <div
                      key={o.id}
                      className="border border-rose-100/70 p-5 rounded-2xl bg-white hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                    >
                      {/* Customer Name, Address & Order Code */}
                      <div className="md:col-span-1 space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="font-serif font-extrabold text-[#0F2C59] text-[13px]">#{o.id}</span>
                          <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-bold uppercase border border-sky-100">
                            {o.paymentMethod}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-xs">{o.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">+91 {o.customerPhone}</div>
                        <div className="text-[10px] text-slate-400 italic line-clamp-1 truncate max-w-[180px]" title={o.shippingAddress}>
                          Addr: {o.shippingAddress}
                        </div>
                      </div>

                      {/* Purchased products, Quantities */}
                      <div className="md:col-span-1 text-xs">
                        <div className="font-bold text-[#0F2C59] text-[10px] uppercase tracking-wide">Acquisitions:</div>
                        <div className="space-y-1 mt-1">
                          {o.items.map((item, idz) => (
                            <div key={idz} className="text-slate-600 text-[11px] font-medium line-clamp-1">
                              • {item.productName} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                        <div className="font-bold text-slate-800 mt-1">Total: ₹{o.totalAmount}</div>
                      </div>

                      {/* Transaction reference & payment status */}
                      <div className="md:col-span-1 text-xs text-left">
                        {o.paymentMethod === 'UPI' ? (
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-400">Transaction Ref/UTR:</span>
                            <div className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50/50 p-1.5 rounded border border-indigo-100 select-all max-w-[150px] truncate">
                              {o.transactionId || 'None Provided'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="p-1 px-2 bg-amber-50 text-amber-800 border border-amber-100 font-bold text-[9px] rounded uppercase">
                              🔒 Cash Delivery Pledge
                            </span>
                          </div>
                        )}
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">Payment Check:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            o.paymentStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            o.paymentStatus === 'DECLINED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Actions and Status Updates */}
                      <div className="md:col-span-1 flex flex-col gap-2 justify-center">
                        {isCurrentPending ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmOrder(o.id, 'CONFIRMED')}
                              className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                            >
                              Approve Pay
                            </button>
                            <button
                              onClick={() => handleConfirmOrder(o.id, 'DECLINED')}
                              className="flex-1 py-1 px-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            {/* Deliver tracking selectors */}
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Fulfillment Status</label>
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-rose-100 rounded-lg text-[10px] font-bold text-slate-600 focus:outline-none capitalize"
                            >
                              <option value="PENDING">Preparing Order</option>
                              <option value="PREPARING">Artisan Handcrafting</option>
                              <option value="SHIPPED">Handed to Courier</option>
                              <option value="DELIVERED">Delivered Safe</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            
                            {/* Direct Invoice preview */}
                            <button
                              onClick={() => onOpenInvoice(o)}
                              className="mt-1.5 w-full py-1 text-[#C5A880] hover:text-[#0F2C59] text-[10px] font-bold flex items-center justify-center gap-1 select-none border border-rose-100 rounded-lg shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Tax Invoice
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

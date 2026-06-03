import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, CheckCircle, Clock, Download, CircleAlert } from 'lucide-react';
import { Order } from '../types';
import DomasLogo from './DomasLogo';

interface InvoiceViewerProps {
  order: Order | null;
  onClose: () => void;
}

export default function InvoiceViewer({ order, onClose }: InvoiceViewerProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // Handles standard print rendering
  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Temporarily swap body content for printing, then restore
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${order.id}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { background: white; color: black; padding: 2cm; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <div>${printContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback standard print if popups are blocked
        window.print();
      }
    }
  };

  const isConfirmed = order.paymentStatus === 'CONFIRMED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white text-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 border border-slate-100 flex flex-col"
      >
        {/* Actions header, excluded from prints */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0F2C59] uppercase tracking-wide">
              Invoice Portal
            </span>
            {isConfirmed ? (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> Ready to Download
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border border-amber-200">
                <Clock className="w-3 h-3" /> Awaiting Admin Pay Confirmation
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConfirmed ? (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] hover:bg-cyan-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cyan-900/10 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed opacity-50"
                title="Only generated after payment confirmation"
              >
                <CircleAlert className="w-3.5 h-3.5" /> Unconfirmed
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outer scrollable viewport for users to preview */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
          {/* Printable Invoice Container */}
          <div ref={printAreaRef} className="bg-white p-2">
            {/* Logo, Letterhead & Metal labels */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b-2 border-dashed border-rose-100 pb-6 gap-4">
              <div className="flex items-center gap-3">
                <DomasLogo size="sm" />
                <div className="text-left">
                  <h1 className="font-serif text-xl font-extrabold text-[#0F2C59]">Doma&apos;s Resin Art</h1>
                  <p className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase leading-tight">
                    Infusing Art Into Every Resin Creation
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right font-mono text-xs">
                <div className="text-lg font-bold text-[#0F2C59] font-serif tracking-tight">TAX RECEIPT</div>
                <div className="mt-1.5 text-slate-600">
                  <span className="font-semibold text-slate-400 font-sans">Invoice #:</span> {order.invoiceNumber || 'PENDING-VERIFY'}
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-400 font-sans">Order ID:</span> #{order.id}
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-400 font-sans">Date:</span> {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              </div>
            </div>

            {/* Bill To & Bill From info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs text-left">
              <div className="bg-[#FCFAF7] border border-rose-100/50 p-4 rounded-2xl">
                <h4 className="font-bold text-[#0F2C59] uppercase tracking-wide text-[10px] mb-2 font-sans">
                  Billing Details
                </h4>
                <div className="space-y-1 font-sans text-slate-600">
                  <div className="font-extrabold text-slate-800">{order.customerName}</div>
                  <div>Phone: +91 {order.customerPhone}</div>
                  <div>Email: {order.customerEmail}</div>
                  <div className="pt-1.5 border-t border-dashed border-rose-100/40 mt-1.5">
                    <span className="font-semibold text-[#0F2C59]">Shipping Destination:</span><br />
                    <span className="italic">{order.shippingAddress}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FCFAF7] border border-rose-100/50 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#0F2C59] uppercase tracking-wide text-[10px] mb-2 font-sans">
                    Fulfillment & Terms
                  </h4>
                  <div className="space-y-1 font-sans text-slate-600">
                    <div><span className="font-semibold">Merchant:</span> Doma&apos;s Resin Art</div>
                    <div><span className="font-semibold">Mode of Payment:</span> {order.paymentMethod === 'UPI' ? 'UPI Custom Transfer Gateway' : 'Cash on Delivery (COD)'}</div>
                    {order.transactionId && (
                      <div className="font-mono text-[11px] text-cyan-900 bg-cyan-50/55 px-1.5 py-0.5 rounded border border-cyan-100 inline-block mt-1">
                        UTR: {order.transactionId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-dashed border-rose-100/40 text-[10px] text-slate-400">
                  Standard delivery completes in 5-7 business working days with courier insurance.
                </div>
              </div>
            </div>

            {/* Product description Table */}
            <div className="overflow-x-auto my-6 border border-rose-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F2C59]/10 text-[#0F2C59] uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-3">Artisan Product Details</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FCFAF7]">
                      <td className="p-3 font-medium text-slate-800">
                        <div className="font-bold text-[#0F2C59]">{item.productName}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">Product ID: {item.productId}</div>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-600">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total blocks & Certification seal */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-4 border-t border-rose-100">
              {/* Dynamic stamp/seal box based on status */}
              <div className="flex items-center">
                {isConfirmed ? (
                  <div className="relative border-4 border-double border-emerald-500 text-emerald-500 rounded-2xl p-3 transform -rotate-3 select-none flex flex-col items-center">
                    <span className="font-extrabold text-[14px] uppercase tracking-[0.18em]">VERIFIED INVOICE</span>
                    <span className="text-[9px] font-mono mt-1 uppercase text-center">Approved by Doma&apos;s Resin Art</span>
                    <span className="text-[8px] font-mono opacity-80 mt-0.5">{order.verifiedAt ? new Date(order.verifiedAt).toLocaleString() : ''}</span>
                    <div className="absolute top-0 right-0 w-full h-full bg-emerald-50 mix-blend-multiply opacity-20 pointer-events-none" />
                  </div>
                ) : (
                  <div className="relative border-4 border-double border-amber-500 text-amber-500 rounded-2xl p-3 transform -rotate-3 select-none flex flex-col items-center">
                    <span className="font-extrabold text-[13px] uppercase tracking-[0.14em]">AWAITING PAYMENT</span>
                    <span className="text-[9px] font-mono mt-1 uppercase">COD / UPI Pending Check</span>
                    <span className="text-[8px] font-mono mt-0.5">Will generate Invoice upon approval</span>
                    <div className="absolute top-0 right-0 w-full h-full bg-amber-50 mix-blend-multiply opacity-20 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Total Calculation breakdown */}
              <div className="w-full sm:w-64 space-y-1.5 text-xs text-left">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Amount:</span>
                  <span>₹{(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-slate-400">
                  <span>Fulfillment & Delivery:</span>
                  <span className="text-emerald-500 font-bold uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-[#0F2C59] font-extrabold text-base pt-2 border-t border-rose-100">
                  <span>Total Due:</span>
                  <span>₹{(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Decorative bottom seal */}
            <div className="text-center text-[10px] text-slate-400 mt-10 pt-4 border-t border-slate-100 font-sans">
              Thank you for supporting Doma&apos;s Resin Art! This invoice is electronic and legally binding upon transaction verification.
            </div>
          </div>
        </div>

        {/* Warning messages for unconfirmed invoices, excluded from prints */}
        {!isConfirmed && (
          <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start gap-2 text-left text-amber-800 text-[11px] font-sans no-print">
            <CircleAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Awaiting Admin Confirmation:</span> This order is registered but payment or Cash-on-Delivery is not yet verified. Please copy the Order ID (<span className="font-mono">{order.id}</span>), check back in your profile once Doma\'s Admin updates its verification status, and your printable official receipt will automatically become active!
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

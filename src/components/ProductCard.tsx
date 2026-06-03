import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Star, Sparkles, Scale, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewInvoice?: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Advanced mouse move tracking for physical 3D shiny resin reflection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within card
    const y = e.clientY - rect.top;  // y position within card
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    // Max 12 degrees tilt
    setRotateX(((yc - y) / yc) * 10);
    setRotateY(((x - xc) / xc) * 10);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className="relative flex flex-col h-full bg-[#FCFAF7] rounded-3xl border border-rose-100 p-4 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(252,202,208,0.3)] group overflow-hidden"
    >
      {/* Glossy resin light-reflection highlight layer overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-white/40 mix-blend-overlay z-10 rounded-2xl"
          style={{
            transform: `translate(${rotateY * 2.5}px, ${rotateX * 2.5}px)`,
          }}
        />
      )}

      {/* Categories Badge & Favorites */}
      <div className="absolute top-6 left-6 z-10 flex justify-between items-start w-[calc(100%-3rem)] pointer-events-auto">
        <div className="flex flex-col gap-1.5 items-start">
          <span className="capitalize px-3 py-1 bg-white/95 backdrop-blur-md text-[11px] font-bold tracking-wider text-[#0F2C59] border border-cyan-100 rounded-full shadow-sm">
            {product.category === 'festival' ? 'Festival Special ✨' : product.category}
          </span>
          {(product.category === 'festival' || (product.discountPercent && product.discountPercent > 0) || product.festivalName) ? (
            <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-md animate-pulse flex items-center gap-1">
              🔥 Special Offer
            </span>
          ) : null}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(!favorite);
          }}
          className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#0F2C59] border border-rose-50 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${favorite ? 'fill-current scale-110 text-white' : ''}`} />
        </button>
      </div>

      {/* Main image stage with 3D shifting shadow */}
      <div
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-rose-50/50 to-blue-50/50 flex items-center justify-center transition-transform duration-500 ease-out z-0 select-none border border-rose-50/40"
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateZ(15px)`
            : 'rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)',
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(15, 44, 89, 0.2)'
            : '0 4px 12px -5px rgba(0,0,0,0.05)',
        }}
      >
        {/* Direct image render (Works flawlessly with base64 embedded files) */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Shimmer glitter spark effect */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            className="absolute top-4 right-4 text-[#D4AF37] pointer-events-none"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
        )}
      </div>

      {/* Product Information details */}
      <div className="flex flex-col flex-grow mt-4 select-text">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif font-bold text-base text-[#0F2C59] line-clamp-1 group-hover:text-cyan-900 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 mt-1 shrink-0 text-[#E5C158] bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{product.rating || '4.8'}</span>
          </div>
        </div>

        {/* Pricing tag and specifications */}
        <div className="flex flex-col gap-1 mt-1.5 text-left">
          <div className="flex items-baseline gap-2.5">
            {product.discountPercent && product.discountPercent > 0 ? (
              <>
                <span className="text-lg font-black text-red-600">
                  ₹{Math.round(product.price * (1 - (product.discountPercent || 0) / 100))}
                </span>
                <span className="text-xs line-through text-slate-400 font-bold">₹{product.price}</span>
                <span className="text-[10px] font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded shadow-sm">
                  {product.discountPercent}% OFF
                </span>
              </>
            ) : (
              <span className="text-lg font-extrabold text-[#0F2C59]">₹{product.price}</span>
            )}

            {product.dimensions && (
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto">
                <Scale className="w-3 h-3" /> {product.dimensions}
              </span>
            )}
          </div>

          {product.discountPercent && product.discountPercent > 0 && product.festivalName && (
            <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 self-start">
              ✨ {product.festivalName} Festive Offer
            </div>
          )}
        </div>

        {/* Short description with expandable details view drawer */}
        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {product.description}
        </p>

        {/* Detail expansion toggle */}
        <div className="mt-2.5">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-[10px] font-bold tracking-wider text-[#C5A880] uppercase flex items-center gap-1 hover:text-[#0F2C59] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showDetail ? 'Hide Specifications' : 'Show Artisan Story'}
          </button>
          
          {showDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 bg-[#FAF3F3]/60 border border-rose-50/50 p-2.5 rounded-xl text-[11px] text-slate-600 leading-relaxed font-sans"
            >
              <div className="font-semibold text-[#0F2C59] mb-1">Domas Workshop Details:</div>
              • Food grade, FDA compliant crystal clear resin layers.<br/>
              • Scratch resistant, UV filtered protection coating.<br/>
              • Packaged safely with silk custom ribbons and hand-signed greeting cards.
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="mt-4 pt-3 border-t border-rose-100/40">
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.isAvailable}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
            product.isAvailable
              ? 'bg-[#0F2C59] text-white hover:bg-cyan-900 shadow-cyan-900/10 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.isAvailable ? 'Add To Basket' : 'Out of Stock'}</span>
        </button>
      </div>
    </motion.div>
  );
}

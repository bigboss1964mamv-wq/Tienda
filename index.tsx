
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- Configuración Supabase ---
const SUPABASE_URL = 'https://dnjtsfymqmhupallnkvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanRzZnltcW1odXBhbGxua3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTUwNTQsImV4cCI6MjA4MjQ3MTA1NH0.0FKal89pt4a1GNN1GGZ1C1ztzCTY-ykErkTzvt8oNUA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
  description: string;
  img: string;
  color: string;
  order: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  sizes: string[];
}

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

interface SiteSettings {
  name: string;
  title: string;
  primaryColor: string;
  whatsapp: string;
  socialLink: string;
  logo: string;
  heroImage: string;
  heroTitle: string;
  heroDescription: string;
}

// --- Utils ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Components ---

const ProductCard: React.FC<{ product: Product, onAdd: (p: Product, s: string) => void, onSelect: (p: Product) => void, primaryColor: string }> = ({ product, onAdd, onSelect, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Única');

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all duration-500 group flex flex-col h-full shadow-2xl hover:shadow-cyan-500/10 hover:bg-zinc-900/80">
      {/* Contenedor de Imagen ajustado para ver el producto completo */}
      <div 
        className="relative aspect-square overflow-hidden bg-black/60 flex items-center justify-center p-6 cursor-pointer"
        onClick={() => onSelect(product)}
      >
        {product.mediaType === 'image' ? (
          <img 
            src={product.mediaUrl} 
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-1000" 
            alt={product.name} 
          />
        ) : (
          <video src={product.mediaUrl} className="max-w-full max-h-full object-contain" muted autoPlay loop />
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-cyan-500/20">Premium</span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 
          className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter line-clamp-1 cursor-pointer"
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h3>
        {/* Descripción con visibilidad mejorada en hover */}
        <p className="text-zinc-400 text-xs mb-4 line-clamp-2 h-10 leading-relaxed transition-colors duration-300 group-hover:text-white">
          {product.description}
        </p>
        
        <div className="mt-auto space-y-4">
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Única' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {product.sizes.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSize(s)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg font-bold border transition-all whitespace-nowrap ${selectedSize === s ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                >{s}</button>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xl font-black text-white">${Number(product.price).toLocaleString()}</span>
            <button 
              onClick={() => onAdd(product, selectedSize)}
              className="bg-white text-black text-[11px] font-black px-5 py-2.5 rounded-xl hover:bg-cyan-400 transition-all active:scale-95 uppercase tracking-widest"
            >Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ cart, updateQuantity, checkout, onClose, primaryColor }: any) => {
  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-zinc-950 h-full flex flex-col border-l border-white/10 animate-slide-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Mi Carrito</h2>
            <p className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest">{cart.length} artículos</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white text-3xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 py-20 text-center">
              <i className="fas fa-box-open text-6xl mb-4 opacity-20"></i>
              <p className="font-bold text-sm uppercase tracking-widest">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
                <img src={item.mediaUrl} className="w-20 h-20 object-contain bg-black/40 rounded-2xl border border-white/5" alt="" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-white uppercase italic">{item.name}</h4>
                    <button onClick={() => updateQuantity(item.id, item.selectedSize, -item.quantity)} className="text-zinc-600 hover:text-red-500"><i className="fas fa-trash-alt text-xs"></i></button>
                  </div>
                  <p className="text-cyan-500 text-[10px] font-black mb-3">OPCIÓN: {item.selectedSize}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="text-zinc-400 hover:text-white">-</button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="text-zinc-400 hover:text-white">+</button>
                    </div>
                    <span className="font-black text-sm text-white">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-8 bg-black/40 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Inversión Total</span>
            <span className="text-4xl font-black text-white italic">${total.toLocaleString()}</span>
          </div>
          <button 
            onClick={checkout}
            disabled={cart.length === 0}
            className="w-full bg-cyan-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-lg shadow-cyan-500/20"
          >
            Confirmar Pedido vía WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetailModal = ({ product, onAdd, onClose }: { product: Product, onAdd: (p: Product, s: string) => void, onClose: () => void }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Única');

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-zinc-950 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row animate-scale-in">
        <div className="w-full md:w-1/2 bg-black/40 flex items-center justify-center p-8 relative">
          <button onClick={onClose} className="absolute top-6 left-6 md:hidden w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-2xl z-10">&times;</button>
          {product.mediaType === 'image' ? (
            <img src={product.mediaUrl} className="max-w-full max-h-[60vh] object-contain" alt={product.name} />
          ) : (
            <video src={product.mediaUrl} className="max-w-full max-h-[60vh] object-contain" muted autoPlay loop />
          )}
        </div>
        
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Detalles del Producto</span>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{product.name}</h2>
            </div>
            <button onClick={onClose} className="hidden md:flex w-12 h-12 items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white text-4xl">&times;</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 mb-8">
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {product.description}
            </p>
            
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Única' && (
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Opciones Disponibles</h4>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedSize(s)}
                      className={`px-6 py-3 rounded-2xl font-bold border transition-all ${selectedSize === s ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-8 border-t border-white/5 flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Inversión</span>
              <span className="text-4xl font-black text-white italic">${Number(product.price).toLocaleString()}</span>
            </div>
            <button 
              onClick={() => { onAdd(product, selectedSize); onClose(); }}
              className="flex-1 bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-white/10 active:scale-95"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    name: 'COPASYSONIDO',
    title: 'Solo Copas y Sonido - Tienda Oficial',
    primaryColor: '#00f2ff',
    whatsapp: '+573196968646',
    socialLink: 'https://instagram.com',
    logo: '',
    heroImage: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1600',
    heroTitle: 'AUDIO DE ALTO NIVEL',
    heroDescription: 'Transforma tu vehículo con la mejor tecnología de sonido y accesorios exclusivos.'
  });

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => setIsLoading(false), 5000);

    const fetchData = async () => {
      try {
        // Cargar desde localStorage primero (fallback rápido)
        const localBackup = localStorage.getItem('site_settings_backup');
        if (localBackup) {
          try {
            const parsed = JSON.parse(localBackup);
            setSettings(prev => ({ ...prev, ...parsed }));
          } catch (e) { console.error("Error parsing local backup", e); }
        }

        const { data: setRes } = await supabase.from('settings').select('data').eq('id', 'site_config').maybeSingle();
        if (setRes && setRes.data) {
          setSettings(prev => ({...prev, ...setRes.data}));
          // Actualizar backup local con datos reales de la nube
          localStorage.setItem('site_settings_backup', JSON.stringify(setRes.data));
        }

        const { data: catRes } = await supabase.from('categories').select('*').order('order', { ascending: true });
        if (catRes) setCategories(catRes);

        const { data: prodRes } = await supabase.from('products').select('*');
        if (prodRes) {
          const grouped: Record<string, Product[]> = {};
          prodRes.forEach((p: any) => {
            const mapped: Product = {
              id: p.id,
              category_id: p.category_id,
              name: p.name,
              description: p.description,
              price: Number(p.price),
              mediaUrl: p.media_url,
              mediaType: p.media_type,
              sizes: p.sizes || []
            };
            if (!grouped[p.category_id]) grouped[p.category_id] = [];
            grouped[p.category_id].push(mapped);
          });
          setProducts(grouped);
        }
      } catch (err) { 
        console.error(err); 
      } finally { 
        clearTimeout(safetyTimeout);
        setIsLoading(false); 
      }
    };
    
    const savedUser = localStorage.getItem('tcl_user');
    if (savedUser === 'admin') setIsAdmin(true);
    fetchData();
  }, []);

  const syncAddCategory = async (newCat: any) => {
    const id = newCat.name.toLowerCase().replace(/\s+/g, '-');
    const catData = { ...newCat, id, order: categories.length + 1 };
    const { error } = await supabase.from('categories').insert([catData]);
    if (!error) {
      setCategories(prev => [...prev, catData]);
      setProducts(prev => ({ ...prev, [id]: [] }));
    }
  };

  const syncUpdateCategory = async (cat: Category) => {
    const { error } = await supabase.from('categories').update(cat).eq('id', cat.id);
    if (!error) {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    }
  };

  const syncRemoveCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const syncAddProduct = async (catId: string, prod: any) => {
    const dbProd = {
      id: Date.now().toString(),
      category_id: catId,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      media_url: prod.mediaUrl,
      media_type: prod.mediaType,
      sizes: prod.sizes
    };
    const { error } = await supabase.from('products').insert([dbProd]);
    if (!error) {
      const mappedProd: Product = { ...prod, id: dbProd.id, category_id: catId };
      setProducts(prev => ({ ...prev, [catId]: [...(prev[catId] || []), mappedProd] }));
    }
  };

  const syncUpdateProduct = async (catId: string, prod: Product) => {
    const { error } = await supabase.from('products').update({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      media_url: prod.mediaUrl,
      media_type: prod.mediaType,
      sizes: prod.sizes
    }).eq('id', prod.id);
    if (!error) {
      setProducts(prev => ({ ...prev, [catId]: prev[catId].map(p => p.id === prod.id ? prod : p) }));
    }
  };

  const syncRemoveProduct = async (catId: string, prodId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', prodId);
    if (!error) {
      setProducts(prev => ({ ...prev, [catId]: prev[catId].filter(p => p.id !== prodId) }));
    }
  };

  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => item.id === product.id && item.selectedSize === size 
          ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    let msg = `🔥 *NUEVO PEDIDO - ${settings.name}*\n\n`;
    cart.forEach(item => {
      msg += `🔊 *${item.name}*\nOpción: ${item.selectedSize} | Cant: ${item.quantity}\nSub: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    msg += `🏁 *TOTAL: $${total.toLocaleString()}*`;
    window.location.href = `https://wa.me/${settings.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950">
        <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        <p className="text-cyan-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Iniciando Sistemas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => { setActiveTab('all'); if (!isAdmin) setIsLoginOpen(true); }}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500 ${settings.logo ? 'bg-transparent' : 'bg-zinc-900 border border-white/10 group-hover:border-cyan-500/50'}`}>
              {settings.logo ? (
                <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <div className="w-full h-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <i className="fas fa-volume-up text-2xl"></i>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-cyan-400 transition-colors leading-none">{settings.name}</span>
              <span className="text-[9px] font-bold text-cyan-500 tracking-[0.3em] uppercase mt-1 opacity-70">Premium Garage</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href={settings.socialLink} 
              target="_blank" 
              className="hidden md:block text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-500 transition-colors"
            >Síguenos</a>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 group">
              <i className="fas fa-shopping-basket text-2xl group-hover:text-cyan-500 transition-colors"></i>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-4 ring-zinc-950 shadow-lg">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Cat Nav */}
        <div className="max-w-7xl mx-auto px-4 border-t border-white/5 flex gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-xl whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:border-zinc-700'}`}
          >Todos</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-6 py-2 rounded-xl whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === cat.id ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-zinc-700'}`}
            >{cat.name}</button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${activeTab === 'all' ? settings.heroImage : (categories.find(c => c.id === activeTab)?.img || settings.heroImage)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative text-center p-6 z-10 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none">
            {activeTab === 'all' ? settings.heroTitle : categories.find(c => c.id === activeTab)?.name}
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed mb-8">
            {activeTab === 'all' ? settings.heroDescription : categories.find(c => c.id === activeTab)?.description}
          </p>
          {activeTab === 'all' && (
            <div className="flex justify-center gap-4">
               <button onClick={() => {document.getElementById('main-grid')?.scrollIntoView({behavior: 'smooth'})}} className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all">Explorar Catálogo</button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main id="main-grid" className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-16">
          <div className="relative">
            <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Nuestra Colección</span>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Equipos Destacados</h2>
          </div>
          <div className="hidden md:block h-px flex-1 bg-white/5 mx-10"></div>
          <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            {activeTab === 'all' ? Object.values(products).flat().length : (products[activeTab]?.length || 0)} Items
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {(activeTab === 'all' ? Object.values(products).flat() : products[activeTab] || []).map(prod => (
            <ProductCard key={prod.id} product={prod} onAdd={addToCart} onSelect={setSelectedProduct} primaryColor={settings.primaryColor} />
          ))}
        </div>
      </main>

      {/* Admin Button */}
      {isAdmin && (
        <button onClick={() => setIsAdminPanelOpen(true)} className="fixed bottom-8 left-8 w-16 h-16 bg-cyan-500 text-black rounded-3xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] z-[90] hover:scale-110 transition-transform">
          <i className="fas fa-tools"></i>
        </button>
      )}

      {/* Modals */}
      {isLoginOpen && <LoginModal onLogin={(p: string) => { if(p==='admin123'){ setIsAdmin(true); localStorage.setItem('tcl_user', 'admin'); setIsLoginOpen(false); }else{alert('Contraseña Incorrecta')} }} onClose={() => setIsLoginOpen(false)} />}
      {isAdminPanelOpen && (
        <AdminPanel 
          onClose={() => setIsAdminPanelOpen(false)} 
          categories={categories}
          products={products}
          settings={settings}
          syncAddCategory={syncAddCategory}
          syncUpdateCategory={syncUpdateCategory}
          syncRemoveCategory={syncRemoveCategory}
          syncAddProduct={syncAddProduct}
          syncUpdateProduct={syncUpdateProduct}
          syncRemoveProduct={syncRemoveProduct}
          syncUpdateSettings={async (s: SiteSettings) => {
             try {
               // Guardar en localStorage inmediatamente para feedback instantáneo
               localStorage.setItem('site_settings_backup', JSON.stringify(s));
               setSettings(s);

               const { error } = await supabase.from('settings').upsert({ id: 'site_config', data: s });
               if (error) {
                 console.error("Error saving to Supabase:", error);
                 // No alertamos aquí si el backup local funcionó, pero informamos en consola
                 console.warn("Los cambios se guardaron localmente pero hubo un problema con la nube. Verifica las políticas RLS de Supabase.");
                 alert("Guardado localmente. Nota: Hubo un problema al sincronizar con la nube (Supabase).");
               } else {
                 alert("¡Ajustes guardados y sincronizados correctamente!");
               }
             } catch (err) {
               console.error("Unexpected error:", err);
               alert("Error al guardar. Los cambios se mantendrán solo en esta sesión.");
             }
          }}
        />
      )}
      {isCartOpen && <CartSidebar cart={cart} updateQuantity={updateQuantity} checkout={checkout} onClose={() => setIsCartOpen(false)} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onAdd={addToCart} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

// --- Admin Components ---

const AdminPanel = ({ onClose, categories, products, settings, ...sync }: any) => {
  const [tab, setTab] = useState('cats');
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex justify-end">
      <div className="w-full max-w-xl bg-zinc-950 h-full flex flex-col border-l border-white/10 shadow-2xl animate-slide-in">
        <div className="p-8 bg-zinc-900 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">System Admin</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="flex bg-black/40 border-b border-white/5">
          {[
            { id: 'cats', label: 'Categorías' },
            { id: 'prods', label: 'Productos' },
            { id: 'config', label: 'Ajustes' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-zinc-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {tab === 'cats' && <AdminCats categories={categories} onAdd={sync.syncAddCategory} onUpdate={sync.syncUpdateCategory} onRemove={sync.syncRemoveCategory} />}
           {tab === 'prods' && <AdminProds categories={categories} products={products} onAdd={sync.syncAddProduct} onUpdate={sync.syncUpdateProduct} onRemove={sync.syncRemoveProduct} />}
           {tab === 'config' && <AdminSettings settings={settings} onUpdate={sync.syncUpdateSettings} />}
        </div>
      </div>
    </div>
  );
};

const AdminCats = ({ categories, onAdd, onUpdate, onRemove }: any) => {
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', img: '', color: '#00f2ff' });

  const handleSubmit = () => {
    if (editing) { onUpdate({ ...editing, ...form }); setEditing(null); }
    else { onAdd(form); }
    setForm({ name: '', description: '', img: '', color: '#00f2ff' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
        <h3 className="text-white font-black uppercase italic text-sm mb-4">{editing ? 'Editar' : 'Nueva'} Categoría</h3>
        <div className="space-y-4">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" placeholder="Nombre" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm h-20" placeholder="Descripción" />
          <input type="file" onChange={async e => { if(e.target.files?.[0]) setForm({...form, img: await fileToBase64(e.target.files[0])})}} className="text-xs text-zinc-500" />
          <button onClick={handleSubmit} className="w-full bg-cyan-500 text-black py-3 rounded-xl font-black uppercase text-xs">{editing ? 'Actualizar' : 'Crear'}</button>
        </div>
      </div>
      <div className="space-y-2">
        {categories.map((c: Category) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl group">
             <span className="text-sm font-bold">{c.name}</span>
             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setEditing(c); setForm({name:c.name, description:c.description, img:c.img, color:c.color}) }} className="text-cyan-500 p-2"><i className="fas fa-edit"></i></button>
               <button onClick={() => onRemove(c.id)} className="text-red-500 p-2"><i className="fas fa-trash"></i></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProds = ({ categories, products, onAdd, onUpdate, onRemove }: any) => {
  const [selectedCat, setSelectedCat] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, mediaUrl: '', mediaType: 'image' as 'image'|'video', sizes: ['Única'] });

  const handleSubmit = () => {
    if (!selectedCat) return alert("Selecciona categoría");
    if (editing) { onUpdate(selectedCat, { ...editing, ...form }); setEditing(null); }
    else { onAdd(selectedCat, form); }
    setForm({ name: '', description: '', price: 0, mediaUrl: '', mediaType: 'image', sizes: ['Única'] });
  };

  return (
    <div className="space-y-8">
      <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-2xl text-white font-bold mb-4">
        <option value="">-- Seleccionar Categoría --</option>
        {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      
      {selectedCat && (
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-white font-black uppercase italic text-sm">{editing ? 'Editar' : 'Nuevo'} Producto</h3>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" placeholder="Nombre" />
          <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" placeholder="Precio" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm h-20" placeholder="Descripción" />
          <input type="file" onChange={async e => { 
            if(e.target.files?.[0]) {
              const file = e.target.files[0];
              setForm({...form, mediaUrl: await fileToBase64(file), mediaType: file.type.startsWith('video') ? 'video' : 'image'});
            }
          }} className="text-xs text-zinc-500" />
          <button onClick={handleSubmit} className="w-full bg-cyan-500 text-black py-3 rounded-xl font-black uppercase text-xs">{editing ? 'Guardar' : 'Añadir'}</button>
        </div>
      )}

      {selectedCat && products[selectedCat]?.map((p: Product) => (
        <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl group">
           <div className="flex items-center gap-3">
             <img src={p.mediaUrl} className="w-10 h-10 object-contain bg-black/40 rounded-lg" />
             <span className="text-xs font-bold">{p.name}</span>
           </div>
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => { setEditing(p); setForm({name:p.name, description:p.description, price:p.price, mediaUrl:p.mediaUrl, mediaType:p.mediaType, sizes:p.sizes}) }} className="text-cyan-500 p-2"><i className="fas fa-edit"></i></button>
             <button onClick={() => onRemove(selectedCat, p.id)} className="text-red-500 p-2"><i className="fas fa-trash"></i></button>
           </div>
        </div>
      ))}
    </div>
  );
};

const AdminSettings = ({ settings, onUpdate }: any) => {
  const [form, setForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(form);
    setIsSaving(false);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 space-y-4">
      <h3 className="text-white font-black uppercase italic text-sm">Ajustes del Sitio</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-black text-zinc-500">Logo del Sitio</label>
          <div className="flex items-center gap-4 mt-2">
            {form.logo && (
              <div className="relative group">
                <img src={form.logo} className="w-16 h-16 object-contain bg-black rounded-xl border border-white/10 p-2" alt="Preview" />
                <button 
                  onClick={() => setForm({...form, logo: ''})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >&times;</button>
              </div>
            )}
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*"
                onChange={async e => { 
                  if(e.target.files?.[0]) {
                    const base64 = await fileToBase64(e.target.files[0]);
                    setForm({...form, logo: base64});
                  }
                }} 
                className="text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white/5 file:text-white hover:file:bg-white/10 cursor-pointer" 
              />
            </div>
          </div>
        </div>
        <div><label className="text-[10px] uppercase font-black text-zinc-500">Nombre</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" /></div>
        <div><label className="text-[10px] uppercase font-black text-zinc-500">WhatsApp</label><input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" /></div>
        <div><label className="text-[10px] uppercase font-black text-zinc-500">Instagram</label><input value={form.socialLink} onChange={e => setForm({...form, socialLink: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" /></div>
        
        <div className="pt-4 border-t border-white/5 space-y-4">
          <h4 className="text-[10px] uppercase font-black text-cyan-500">Ajustes de Portada (Hero)</h4>
          
          <div>
            <label className="text-[10px] uppercase font-black text-zinc-500 block mb-2">Imagen de Portada</label>
            <div className="flex flex-col gap-3">
              {form.heroImage && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 group">
                  <img src={form.heroImage} className="w-full h-full object-cover" alt="Hero Preview" />
                  <button 
                    onClick={() => setForm({...form, heroImage: ''})}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 bg-zinc-900 border border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-zinc-800 transition-all group">
                  <i className="fas fa-image text-xl mb-2 text-zinc-500 group-hover:text-cyan-500"></i>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Subir desde ordenador</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({...form, heroImage: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase px-1">O usar URL externa</span>
                  <input 
                    value={form.heroImage} 
                    onChange={e => setForm({...form, heroImage: e.target.value})} 
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div><label className="text-[10px] uppercase font-black text-zinc-500">Título de Portada</label><input value={form.heroTitle} onChange={e => setForm({...form, heroTitle: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm" /></div>
          <div><label className="text-[10px] uppercase font-black text-zinc-500">Descripción de Portada</label><textarea value={form.heroDescription} onChange={e => setForm({...form, heroDescription: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white text-sm h-20" /></div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              Guardando...
            </>
          ) : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

const LoginModal = ({ onLogin, onClose }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-zinc-900 p-12 rounded-[40px] w-full max-w-md border border-white/5 shadow-2xl text-center">
        <div className="w-20 h-20 bg-cyan-500/10 text-cyan-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <i className="fas fa-shield-alt"></i>
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Acceso Restringido</h2>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Introduce la contraseña maestra</p>
        <input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && onLogin(pass)}
          className="w-full p-6 bg-black border border-white/5 rounded-3xl mb-8 text-center text-2xl tracking-[0.5em] font-black text-white focus:border-cyan-500 focus:outline-none transition-all" 
          placeholder="••••" 
          autoFocus
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
          <button onClick={() => onLogin(pass)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-white/10">Ingresar</button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

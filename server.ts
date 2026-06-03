import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Database file path
const DB_FILE = path.join(process.cwd(), 'db.json');

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // Generate initial catalog of beautiful resin arts using styled inline vector SVGs
    const initialProducts = [
      {
        id: 'p1',
        name: 'Ocean Wave Resin Accent Wall Clock',
        price: 2499,
        description: 'A luxurious 12-inch circular wall clock featuring deep Prussian blue and turquoise acrylic-resin layers, styled to emulate real ocean depths with a textured sandy shore and genuine shimmering gold sand lines. Handcrafted to order under Doma\'s special curating guidelines.',
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><radialGradient id="ocean" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="%2300b4d8"/><stop offset="60%" stop-color="%230077b6"/><stop offset="100%" stop-color="%2303045e"/></radialGradient><linearGradient id="sand" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23e9c46a"/><stop offset="100%" stop-color="%23f4a261"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(%23ocean)" stroke="%23e9c46a" stroke-width="1.5"/><path d="M 10 75 Q 35 60 55 70 T 90 72 L 95 95 L 5 95 Z" fill="url(%23sand)" opacity="0.95"/><path d="M 8 74 Q 32 55 52 65 T 92 68" stroke="white" stroke-width="1" fill="none" opacity="0.6"/><circle cx="50" cy="50" r="1.5" fill="%23e9c46a"/><line x1="50" y1="50" x2="50" y2="20" stroke="%23e9c46a" stroke-width="1" stroke-linecap="round"/><line x1="50" y1="50" x2="70" y2="50" stroke="%23e9c46a" stroke-width="1" stroke-linecap="round"/><text x="46" y="15" fill="%23e9c46a" font-family="sans-serif" font-size="6" font-weight="bold">XII</text><text x="47" y="92" fill="%2303045e" font-family="sans-serif" font-size="6" font-weight="bold">VI</text></svg>',
        category: 'clocks',
        dimensions: '12 inch diameter',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        rating: 4.9
      },
      {
        id: 'p2',
        name: 'Preserved Lavender Floral Coasters (Set of 4)',
        price: 599,
        description: 'Beautiful transparent resin coasters encasing real dried lavender petals, delicate baby-breath buds, and premium gold foil flakes. Designed with high-heat resistant, food-safe resin, ideal for hot and cold beverages alike.',
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><radialGradient id="glare" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="0.8"/><stop offset="100%" stop-color="%23ffccd5" stop-opacity="0.2"/></radialGradient></defs><rect width="100" height="100" fill="%23fff0f3"/><circle cx="50" cy="50" r="42" fill="white" fill-opacity="0.85" stroke="%23d4af37" stroke-width="0.75" stroke-dasharray="2,2"/><circle cx="50" cy="50" r="38" fill="url(%23glare)"/><g transform="translate(50,50) rotate(45)"><path d="M0,0 Q5,-15 15,-20 Q10,-5 0,0" fill="%23b5179e" opacity="0.7"/><circle cx="10" cy="-12" r="1.5" fill="%23d4af37"/></g><g transform="translate(50,50) rotate(135)"><path d="M0,0 Q5,-15 15,-20 Q10,-5 0,0" fill="%237209b7" opacity="0.6"/><circle cx="12" cy="-14" r="1.2" fill="%23d4af37"/></g><g transform="translate(50,50) rotate(225)"><path d="M0,0 Q5,-15 15,-20 Q10,-5 0,0" fill="%23b5179e" opacity="0.8"/><circle cx="5" cy="-8" r="1.8" fill="%23d4af37"/></g><g transform="translate(50,50) rotate(315)"><path d="M0,0 Q5,-15 15,-20 Q10,-5 0,0" fill="%237209b7" opacity="0.5"/><circle cx="8" cy="-10" r="1.5" fill="%23d4af37"/></g><circle cx="50" cy="50" r="6" fill="none" stroke="%23b5179e" stroke-width="0.5" opacity="0.4"/></svg>',
        category: 'coasters',
        dimensions: '4 inch diameter',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        rating: 4.8
      },
      {
        id: 'p3',
        name: 'Cosmic Amethyst Resin Bookmark',
        price: 249,
        description: 'Immerse your books in stardust with this handcrafted transparent bookmark showcasing swirling magenta-purple amethyst clouds and heavy sprinkles of reflective golden celestial dust. Features an elegant gold-tasseled ribbon.',
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><linearGradient id="purpleG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%233a0ca3"/><stop offset="50%" stop-color="%237209b7"/><stop offset="100%" stop-color="%23f72585"/></linearGradient></defs><rect width="100" height="100" fill="%23faf0ca"/><rect x="35" y="10" width="30" height="80" rx="4" fill="url(%23purpleG)" stroke="%23d4af37" stroke-width="1"/><circle cx="50" cy="18" r="1.5" fill="%23fafcca"/><line x1="50" y1="18" x2="50" y2="6" stroke="%23d4af37" stroke-width="0.75"/><circle cx="50" cy="6" r="1.2" fill="%23d4af37"/><circle cx="45" cy="40" r="1" fill="white" opacity="0.8"/><circle cx="55" cy="55" r="1.5" fill="white" opacity="0.9"/><circle cx="42" cy="70" r="0.8" fill="%23d4af37"/><circle cx="52" cy="75" r="2" fill="%23d4af37" opacity="0.7"/><path d="M 40 30 Q 50 25 60 35" stroke="white" stroke-width="0.5" fill="none" opacity="0.4"/></svg>',
        category: 'bookmarks',
        dimensions: '6 x 1.5 inches',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        rating: 5.0
      },
      {
        id: 'p4',
        name: 'Custom Dried Bloom Alphabet Keychain',
        price: 180,
        description: 'Fully personalized resin alphabet letters from A-Z. Each letter includes hand-selected colored baby\'s-breath flowers, dried blossoms, and real gold leaf flakes, suspended in solid crystal resin with a sturdy gold lobster-clasp ring.',
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><radialGradient id="glass" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="white" stop-opacity="0.9"/><stop offset="70%" stop-color="%23e8e8e8" stop-opacity="0.3"/><stop offset="100%" stop-color="%23b5b5b5" stop-opacity="0.5"/></radialGradient></defs><rect width="100" height="100" fill="%23e0f2fe"/><path d="M 40 25 L 60 25 L 60 35 L 53 35 L 53 75 L 47 75 L 47 35 L 40 35 Z" fill="url(%23glass)" stroke="%23d4af37" stroke-width="1" filter="drop-shadow(2px 3px 2px rgba(0,0,0,0.15))"/><circle cx="43" cy="30" r="1" fill="%23ff007f"/><circle cx="57" cy="30" r="1.5" fill="%23ff007f"/><circle cx="50" cy="45" r="1.2" fill="%23ffccd5"/><circle cx="53" cy="65" r="1.8" fill="%23d4af37"/><path d="M 46 22 C 46 12, 54 12, 54 22" fill="none" stroke="%23d4af37" stroke-width="1.2"/></svg>',
        category: 'keychains',
        dimensions: '1.6 inches height',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        rating: 4.7
      }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify({ products: initialProducts, orders: [], users: [] }, null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!parsed.users) {
    parsed.users = [];
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
  }
  return parsed;
}

// Helper to write database
function writeDB(data: { products: any[]; orders: any[]; users?: any[] }) {
  if (!data.users) {
    data.users = [];
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing configurations
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ limit: '30mb', extended: true }));

  // Ensure DB initializes
  readDB();

  // API - Products List
  app.get('/api/products', (req, res) => {
    try {
      const data = readDB();
      res.json(data.products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to read products' });
    }
  });

  // API - Add Product (by Admin)
  app.post('/api/products', (req, res) => {
    try {
      const { name, price, description, image, category, dimensions, discountPercent, festivalName } = req.body;
      if (!name || !price || !category || !image) {
        return res.status(400).json({ error: 'Please provide all required fields including product image.' });
      }

      const data = readDB();
      const newProduct = {
        id: 'p_' + Date.now(),
        name,
        price: Number(price),
        description: description || '',
        image, // Base64 direct upload
        category,
        dimensions: dimensions || 'Standard size',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        discountPercent: discountPercent ? Number(discountPercent) : 0,
        festivalName: festivalName || ''
      };

      data.products.unshift(newProduct);
      writeDB(data);
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // API - Update Product (by Admin)
  app.put('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, description, image, category, dimensions, discountPercent, festivalName, isAvailable } = req.body;
      const data = readDB();
      const product = data.products.find(p => p.id === id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (name !== undefined) product.name = name;
      if (price !== undefined) product.price = Number(price);
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category;
      if (dimensions !== undefined) product.dimensions = dimensions;
      if (discountPercent !== undefined) product.discountPercent = Number(discountPercent);
      if (festivalName !== undefined) product.festivalName = festivalName;
      if (isAvailable !== undefined) product.isAvailable = !!isAvailable;

      writeDB(data);
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // API - Delete Product (by Admin)
  app.delete('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const data = readDB();
      const updatedProducts = data.products.filter(p => p.id !== id);
      data.products = updatedProducts;
      writeDB(data);
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // API - Create Order (by Customer)
  app.post('/api/orders', (req, res) => {
    try {
      const { customerName, customerPhone, customerEmail, shippingAddress, items, paymentMethod, transactionId, totalAmount, paymentStatus } = req.body;
      
      if (!customerName || !customerPhone || !customerEmail || !shippingAddress || !items || !items.length || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required order fields.' });
      }

      const data = readDB();
      const currentCount = data.orders ? data.orders.length : 0;
      const orderId = 'DRA-' + String(currentCount + 1).padStart(4, '0');
      
      let initialPaymentStatus = 'PENDING';
      let verifiedAt = undefined;
      let invoiceNumber = undefined;

      if (paymentStatus === 'CONFIRMED') {
        initialPaymentStatus = 'CONFIRMED';
        verifiedAt = new Date().toISOString();
        invoiceNumber = 'DRA-INV-' + String(currentCount + 1).padStart(4, '0');
      }

      const newOrder = {
        id: orderId,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        items,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: 'PENDING',
        transactionId: transactionId || '',
        totalAmount: Number(totalAmount),
        createdAt: new Date().toISOString(),
        verifiedAt,
        invoiceNumber
      };

      data.orders.unshift(newOrder);
      writeDB(data);
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  // API - Orders List (filtered by customerPhone or admin scope)
  app.get('/api/orders', (req, res) => {
    try {
      const { phone } = req.query;
      const data = readDB();

      if (phone) {
        // Customer viewing their own history
        const userOrders = data.orders.filter(o => o.customerPhone === phone);
        return res.json(userOrders);
      }

      // If no phone filter, return all (restricted on front-end to admin mode)
      res.json(data.orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // API - Update Order/Payment (by Admin)
  app.put('/api/orders/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, orderStatus } = req.body;
      const data = readDB();

      const orderIndex = data.orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = data.orders[orderIndex];

      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        if (paymentStatus === 'CONFIRMED' && !order.invoiceNumber) {
          order.verifiedAt = new Date().toISOString();
          const numericPart = order.id.startsWith('DRA-') ? order.id.replace('DRA-', '') : order.id.replace('ord_', '');
          order.invoiceNumber = 'DRA-INV-' + numericPart;
        }
      }

      if (orderStatus) {
        order.orderStatus = orderStatus;
      }

      data.orders[orderIndex] = order;
      writeDB(data);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // API - Custom Simulated OTP Auth Flow
  const otps = new Map<string, string>(); // In-memory OTP store (email or phone -> otp)

  app.post('/api/auth/send-otp', (req, res) => {
    const { email, phone } = req.body;
    let identifier = '';
    
    if (email) {
      if (!email.includes('@') || email.length < 5) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
      identifier = email.toLowerCase().trim();
    } else if (phone) {
      if (phone.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
      }
      identifier = phone;
    } else {
      return res.status(400).json({ error: 'Please enter a valid email address or mobile number.' });
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    otps.set(identifier, generatedOtp);

    // Check if user has a password set
    const data = readDB();
    const user = data.users.find((u: any) => 
      (email && u.email?.toLowerCase() === identifier) || 
      (phone && u.phone === identifier)
    );

    res.json({
      success: true,
      message: 'Verification OTP dispatched!',
      simulatedOtp: generatedOtp,
      hasPassword: !!(user?.password),
      isRegistered: !!user
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, phone, code, name } = req.body;
    let identifier = '';

    if (email) {
      identifier = email.toLowerCase().trim();
    } else if (phone) {
      identifier = phone;
    } else {
      return res.status(400).json({ error: 'Email or Mobile number is required.' });
    }

    if (!code) {
      return res.status(400).json({ error: 'OTP verification code is required.' });
    }

    const savedOtp = otps.get(identifier);
    if (savedOtp !== code && code !== '1234') {
      return res.status(400).json({ error: 'Incorrect OTP entered. Use the simulated code displayed above or 1234.' });
    }

    // OTP validated successfully! Let's find or create user in db.json
    const data = readDB();
    let userIndex = data.users.findIndex((u: any) => 
      (email && u.email?.toLowerCase() === identifier) || 
      (phone && u.phone === identifier)
    );

    let user: any;
    let isNewUser = false;

    // Detect if this phone number or email warrants ADMIN access
    const isPhoneAdmin = (phone === '9558818775');
    const isEmailAdmin = (email?.toLowerCase().trim() === 'vrsm2004@gmail.com' || email?.toLowerCase().trim() === 'domasresinart@gmail.com');
    const finalRole = (isPhoneAdmin || isEmailAdmin) ? 'admin' : 'customer';

    if (userIndex === -1) {
      isNewUser = true;
      user = {
        id: 'u_' + Date.now(),
        email: email ? email.toLowerCase().trim() : '',
        phone: phone || '',
        name: name || (finalRole === 'admin' ? 'Domas Admin' : 'Valued Customer'),
        password: '', // will be set
        role: finalRole,
        createdAt: new Date().toISOString()
      };
      data.users.push(user);
      writeDB(data);
    } else {
      user = data.users[userIndex];
      // Update phone/email if missing
      let changed = false;
      if (email && !user.email) { user.email = email.toLowerCase().trim(); changed = true; }
      if (phone && !user.phone) { user.phone = phone; changed = true; }
      if (name && (!user.name || user.name.startsWith('Valued User') || user.name.startsWith('Valued Customer'))) { user.name = name; changed = true; }
      if (user.role !== finalRole) { user.role = finalRole; changed = true; }
      if (changed) {
        data.users[userIndex] = user;
        writeDB(data);
      }
    }

    res.json({
      success: true,
      session: {
        phone: user.phone || '',
        name: user.name || 'Valued Customer',
        email: user.email || '',
        role: user.role
      },
      mustSetPassword: !user.password
    });
  });

  // New API: Set password for user
  app.post('/api/auth/set-password', (req, res) => {
    const { email, phone, password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    const data = readDB();
    let foundIndex = -1;

    if (email) {
      foundIndex = data.users.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());
    } else if (phone) {
      foundIndex = data.users.findIndex((u: any) => u.phone === phone);
    }

    if (foundIndex === -1) {
      return res.status(404).json({ error: 'User account not found. Please log in with OTP first.' });
    }

    data.users[foundIndex].password = password;
    writeDB(data);

    res.json({ success: true, message: 'Password set successfully!' });
  });

  // New API: Login with Email & Password
  app.post('/api/auth/login-password', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email/mobile and password.' });
    }

    const data = readDB();
    const cleanMailOrPhone = email.toLowerCase().trim();

    // Support logging in with email OR phone as the "ID"
    const user = data.users.find((u: any) => 
      u.email?.toLowerCase() === cleanMailOrPhone || 
      u.phone === email
    );

    if (!user) {
      return res.status(400).json({ 
        error: 'No registered account found with this Email/Mobile. Please use the "First-Time / OTP Login" option to get started instantly!' 
      });
    }

    if (!user.password) {
      return res.status(400).json({ 
        error: 'No password has been set for this account yet. Please log in using the "First-Time / OTP Login" option to set up your password.' 
      });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password entered.' });
    }

    res.json({
      success: true,
      session: {
        phone: user.phone || '',
        name: user.name || 'Valued Customer',
        email: user.email || '',
        role: user.role
      }
    });
  });

  // Vite development / production static asset hosting middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Doma's Resin Art Backend] Running server on http://localhost:${PORT}`);
  });
}

startServer();

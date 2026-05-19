class ShoppingCart {
    constructor() {
        // Prices in KSh (converted from USD example: $1 = KSh 150)
        this.products = [
            // 🍎 APPLES - Red apples on table
            { id: 1, name: 'Organic Apples', price: 449.00, stock: 15, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop' },
            // 🍊 ORANGES - Fresh oranges sliced
            { id: 2, name: 'Fresh Oranges', price: 524.00, stock: 12, image: 'https://images.pexels.com/photos/3903202/pexels-photo-3903202.jpeg' },
            // 🥑 AVOCADOS - Green avocados cut open
            { id: 3, name: 'Avocados', price: 299.00, stock: 8, image: 'https://images.pexels.com/photos/33702904/pexels-photo-33702904.jpeg?w=400&h=250&fit=crop' },
            // 🍌 BANANAS - Yellow banana bunch
            { id: 4, name: 'Bananas', price: 224.00, stock: 20, image: 'https://images.pexels.com/photos/30558166/pexels-photo-30558166.jpeg' },
            // 🍓 STRAWBERRIES - Red strawberries
            { id: 5, name: 'Strawberries', price: 749.00, stock: 6, image: 'https://images.pexels.com/photos/31508572/pexels-photo-31508572.jpeg' },
            // 🫐 BLUEBERRIES - Blueberries in bowl
            { id: 6, name: 'Blueberries', price: 899.00, stock: 10, image: 'https://images.pexels.com/photos/33102411/pexels-photo-33102411.jpeg' }
        ];
        
        this.cart = [];
        this.init();
    }

    init() {
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartIcon();
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200/f8f9ff/667eea?text=${product.emoji||product.name.substring(0,8)}'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">KSh ${product.price.toFixed(2)}</div>
                    <div class="stock-info">
                        <span>Stock:</span>
                        <span class="stock-count">${product.stock} available</span>
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">
                        ${this.isInCart(product.id) ? '✅ Added' : '🛒 Add to Cart'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Cart toggle
        document.getElementById('cartIcon').onclick = () => this.toggleCart();
        document.getElementById('closeCart').onclick = () => this.closeCart();
        
        // Modal close
        document.getElementById('cartModal').onclick = (e) => {
            if (e.target.id === 'cartModal') this.closeCart();
        };
        
        // Checkout
        document.getElementById('checkoutBtn').onclick = () => this.checkout();
        
        // Products
        document.getElementById('productsGrid').onclick = (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.addToCart(parseInt(e.target.dataset.id));
            }
        };
    }

    addToCart(id) {
        const product = this.products.find(p => p.id === id);
        if (!product?.stock) {
            alert('❌ Out of stock!');
            return;
        }

        const cartItem = this.cart.find(item => item.id === id);
        if (cartItem) {
            if (cartItem.quantity >= product.stock) {
                alert('⚠️ Max stock reached!');
                return;
            }
            cartItem.quantity++;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        product.stock--;
        this.refreshUI();
    }

    updateQuantity(id, delta) {
        const item = this.cart.find(c => c.id === id);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            this.removeFromCart(id);
            return;
        }

        const product = this.products.find(p => p.id === id);
        if (newQty > product.stock + delta) {
            alert('⚠️ Not enough stock!');
            return;
        }

        item.quantity = newQty;
        product.stock -= delta;
        this.refreshUI();
    }

    removeFromCart(id) {
        const item = this.cart.find(c => c.id === id);
        if (item) {
            this.products.find(p => p.id === id).stock += item.quantity;
            this.cart = this.cart.filter(c => c.id !== id);
            this.refreshUI();
        }
    }

    isInCart(id) {
        return this.cart.some(item => item.id === id);
    }

    refreshUI() {
        this.updateProductButtons();
        this.updateCartDisplay();
        this.updateCartIcon();
    }

    updateProductButtons() {
        this.products.forEach(product => {
            // 1. Find the specific product card in the DOM
            const card = document.querySelector(`.product-card[data-id="${product.id}"]`);
            if (!card) return;

            // 2. Get references to the button and the stock text inside this card
            const btn = card.querySelector('.add-to-cart');
            const stockSpan = card.querySelector('.stock-count');

            // 3. UPDATE THE STOCK DISPLAY
            if (stockSpan) {
                stockSpan.textContent = `${product.stock} available`;
            }

            // 4. Update the button state logic
            if (btn) {
                if (product.stock === 0) {
                    btn.textContent = '❌ Sold Out';
                    btn.disabled = true;
                    btn.classList.add('out-of-stock');
                } else if (this.isInCart(product.id)) {
                    btn.textContent = '✅ Added';
                    btn.disabled = true;
                    btn.classList.remove('out-of-stock');
                } else {
                    btn.textContent = '🛒 Add to Cart';
                    btn.disabled = false;
                    btn.classList.remove('out-of-stock');
                }
            }
        });
    }

    updateCartDisplay() {
        const cartEl = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (this.cart.length === 0) {
            cartEl.innerHTML = '<p class="empty-cart">🛒 Your cart is empty</p>';
            totalEl.textContent = '0.00';
            checkoutBtn.disabled = true;
            return;
        }

        cartEl.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" 
                     style="width:60px;height:60px;border-radius:10px;object-fit:cover;"
                     onerror="this.style.background='linear-gradient(45deg,#f8f9ff,#e8f0fe);color:#667eea;font-size:2rem;padding:1rem';this.innerHTML='🍎'">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">KSh ${item.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="cart.updateQuantity(${item.id},-1)">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="cart.updateQuantity(${item.id},1)">+</button>
                </div>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalEl.textContent = total.toFixed(2);
        checkoutBtn.disabled = false;
    }

    updateCartIcon() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count || 0;
    }

    toggleCart() {
        const modal = document.getElementById('cartModal');
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        if (modal.style.display === 'block') this.updateCartDisplay();
    }

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    checkout() {
        if (!this.cart.length) return;
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const items = this.cart.map(item => `${item.name} (x${item.quantity})`).join('\n');
        
        alert(`🎉 ORDER CONFIRMED!\n\n${items}\n\n💰 Total: KSh ${total.toFixed(2)}\n\n✅ Thank you!`);
        
        // Reset cart
        this.cart.forEach(item => {
            this.products.find(p => p.id === item.id).stock += item.quantity;
        });
        this.cart = [];
        this.refreshUI();
        this.closeCart();
    }
}

// START
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    console.log('✅ FreshMart loaded with KSh prices!');
});
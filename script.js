// Sample Product Data
const products = [
    { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', rating: 4.5, emoji: '🎧' },
    { id: 2, name: 'Smart Watch', price: 199.99, category: 'electronics', rating: 4.7, emoji: '⌚' },
    { id: 3, name: 'USB-C Cable', price: 12.99, category: 'electronics', rating: 4.2, emoji: '🔌' },
    { id: 4, name: 'Designer T-Shirt', price: 49.99, category: 'clothing', rating: 4.3, emoji: '👕' },
    { id: 5, name: 'Running Shoes', price: 89.99, category: 'clothing', rating: 4.6, emoji: '👟' },
    { id: 6, name: 'Winter Jacket', price: 129.99, category: 'clothing', rating: 4.4, emoji: '🧥' },
    { id: 7, name: 'JavaScript Guide', price: 34.99, category: 'books', rating: 4.8, emoji: '📚' },
    { id: 8, name: 'Web Design Handbook', price: 44.99, category: 'books', rating: 4.5, emoji: '📖' },
    { id: 9, name: 'Plant Pot', price: 24.99, category: 'home', rating: 4.1, emoji: '🪴' },
    { id: 10, name: 'Desk Lamp', price: 59.99, category: 'home', rating: 4.4, emoji: '💡' },
    { id: 11, name: 'Coffee Maker', price: 89.99, category: 'home', rating: 4.6, emoji: '☕' },
    { id: 12, name: 'Bluetooth Speaker', price: 69.99, category: 'electronics', rating: 4.5, emoji: '🔊' }
];

// Cart Array
let cart = [];
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    setupEventListeners();
    loadCartFromStorage();
});

// Display Products
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 18px;">No products found.</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <div class="product-rating">${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', () => openModal('cartModal'));

    // Auth button
    document.getElementById('authBtn').addEventListener('click', () => openModal('authModal'));

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// Filter Products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesPrice = !priceRange || checkPriceRange(product.price, priceRange);

        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

// Check Price Range
function checkPriceRange(price, range) {
    if (range === '0-50') return price <= 50;
    if (range === '50-100') return price > 50 && price <= 100;
    if (range === '100-500') return price > 100 && price <= 500;
    if (range === '500+') return price > 500;
    return true;
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showNotification('Product added to cart!');
}

// Update Cart
function updateCart() {
    updateCartCount();
    saveCartToStorage();
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Display Cart Items
function displayCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center;">Your cart is empty</p>';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="quantity-control">
                <button onclick="decreaseQuantity(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity(${item.id})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsDiv.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Increase Quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCart();
        displayCartItems();
    }
}

// Decrease Quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            displayCartItems();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    displayCartItems();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Cart is empty!', 'error');
        return;
    }

    if (!currentUser) {
        showNotification('Please login to proceed with checkout', 'error');
        closeModal('cartModal');
        openModal('authModal');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Order confirmed!\nTotal: $${total.toFixed(2)}\nThank you for shopping with ShopHub!`);
    
    // Clear cart
    cart = [];
    updateCart();
    displayCartItems();
    closeModal('cartModal');
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';

    if (modalId === 'cartModal') {
        displayCartItems();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const authModal = document.getElementById('authModal');

    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Tab Switching
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabs[1].classList.add('active');
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = e.target.querySelector('input[type="email"]').value;
    
    currentUser = { email, name: email.split('@')[0] };
    showNotification(`Welcome, ${currentUser.name}!`);
    
    // Reset form
    e.target.reset();
    closeModal('authModal');
    updateAuthButton();
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelectorAll('input[type="email"]')[0].value;

    currentUser = { name, email };
    showNotification(`Welcome, ${name}! Account created successfully.`);
    
    // Reset form
    e.target.reset();
    closeModal('authModal');
    updateAuthButton();
}

// Update Auth Button
function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    if (currentUser) {
        authBtn.textContent = `👤 ${currentUser.name}`;
    } else {
        authBtn.textContent = '👤 Login';
    }
}

// Handle Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    showNotification('Thank you! We will get back to you soon.');
    e.target.reset();
}

// Scroll to Products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4ecdc4' : '#ff6b6b'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Local Storage Functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

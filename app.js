// Global variables
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch data from DummyJSON API
async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        products = data.products;
        displayProducts(products);
    } catch (error) {
        console.error("Failed to fetch products", error);
        document.getElementById('product-container').innerHTML = '<p>Error fetching products. Please try again later.</p>';
    }
}

// Display products dynamically
function displayProducts(items) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';
    items.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>Price: $${item.price}</p>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
        `;
        productContainer.appendChild(productDiv);
    });
}

// Sort products
document.getElementById('sort').addEventListener('change', function() {
    const sortValue = this.value;
    let sortedProducts = [...products];

    if (sortValue === 'highest-price') {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'lowest-price') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else {
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    }

    displayProducts(sortedProducts);
});

// Change items per page
document.getElementById('items-per-page').addEventListener('change', function() {
    const itemsPerPage = parseInt(this.value);
    displayProducts(products.slice(0, itemsPerPage));
});

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
}

// Update cart and save to localStorage
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const totalItems = document.getElementById('total-items');
    const totalPrice = document.getElementById('total-price');

    cartItems.innerHTML = '';
    let itemCount = 0;
    let priceTotal = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            ${item.title} (x${item.quantity}) - $${item.price * item.quantity}
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(cartItem);

        itemCount += item.quantity;
        priceTotal += item.price * item.quantity;
    });

    totalItems.textContent = itemCount;
    totalPrice.textContent = priceTotal.toFixed(2);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Checkout
document.getElementById('checkout').addEventListener('click', function() {
    alert('Checkout successful!');
    cart = [];
    updateCart();
});

// Initialize on page load
window.onload = function() {
    fetchProducts();
    updateCart();
};

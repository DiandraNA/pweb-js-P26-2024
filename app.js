    // Global variables
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fetch data from DummyJSON API
    async function fetchProducts() {
        try {
            const response = await fetch('https://dummyjson.com/products');
            const data = await response.json();
            products = data.products;
            totalItems = products.length;
            displayProducts(products, currentPage, itemsPerPage);
        } catch (error) {
            console.error("Failed to fetch products", error);
            document.getElementById('product-container').innerHTML = '<p>Error fetching products. Please try again later.</p>';
        }
    }

    let currentPage = 1;
    let itemsPerPage = 30; // Default to show all items
    let totalItems = 0; 

    // Display products dynamically
    function displayProducts(items, page = 1, itemsPerPage = 30) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = items.slice(startIndex, endIndex);

    itemsToDisplay.forEach(item => {
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

    setupPagination(items.length, itemsPerPage);
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
    //document.getElementById('items-per-page').addEventListener('change', function() {
    //   const itemsPerPage = parseInt(this.value);
    //   displayProducts(products.slice(0, itemsPerPage));
    // });
    

    function setupPagination(totalItems, itemsPerPage) {
        const pageCount = Math.ceil(totalItems / itemsPerPage);
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';
    
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.addEventListener('click', () => {
                currentPage = i;
                displayProducts(products, currentPage, itemsPerPage);
            });
            paginationElement.appendChild(button);
        }
    }
    
    document.getElementById('items-per-page').addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue === 'all') {
            itemsPerPage = products.length;
        } else {
            itemsPerPage = parseInt(selectedValue);
        }
        currentPage = 1;
        displayProducts(products, currentPage, itemsPerPage);
    });
    
    function showAllItems() {
        itemsPerPage = products.length;
        currentPage = 1;
        displayProducts(products, currentPage, itemsPerPage);
    }

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
                ${item.title} 
                <div class="quantity-controls">
                    <button onclick="decreaseQuantity(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})">+</button>
                </div>
                $${(item.price * item.quantity).toFixed(2)}
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

    // Increase quantity
    function increaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            updateCart();
        }
    }

    // Decrease quantity
    function decreaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity === 0) {
                removeFromCart(productId);
            } else {
                updateCart();
            }
        }
    }

    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    // Checkout
    document.getElementById('checkout').addEventListener('click', function() {
        if (!localStorage.getItem('token')) {
            alert('You must be logged in to proceed to checkout.');
            return;
        }
        alert('Checkout successful!');
        cart = [];
        updateCart();
    });

    function setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );
        currentPage = 1; // Reset to first page when searching
        displayProducts(filteredProducts);
    }

    // Add these functions to your app.js
    function setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        const logoutButton = document.getElementById('logout-button');
        loginForm.addEventListener('submit', handleLogin);
        logoutButton.addEventListener('click', handleLogout);
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                // Store the token and update UI
                localStorage.setItem('token', data.token);
                updateLoginState(true);
                alert('Login successful!');
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error', error);
            alert('An error occurred during login');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        updateLoginState(false);
    }

    function updateLoginState(isLoggedIn) {
        const loginContainer = document.getElementById('login-container');
        const logoutButton = document.getElementById('logout-button');
        if (isLoggedIn) {
            loginContainer.style.display = 'none';
            logoutButton.style.display = 'block';
        } else {
            loginContainer.style.display = 'block';
            logoutButton.style.display = 'none';
        }
    }

    // Update your window.onload function
    window.onload = function() {
        fetchProducts();
        updateCart();
        setupSearch();
        setupLoginForm();
        
        // Check if user is logged in
        if (localStorage.getItem('token')) {
            updateLoginState(true);
        }
    };
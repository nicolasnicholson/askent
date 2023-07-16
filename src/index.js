let products = [];

// Definición del objeto badge
const badge = {
    usd: { symbol: '$', multiplier: 1 },
    eur: { symbol: '€', multiplier: 1.10 },
    ars: { symbol: '$', multiplier: 258.36 },
    gbp: { symbol: '£', multiplier: 1.78 },
    jpy: { symbol: '¥', multiplier: 142.09 }
};

let monedaActual = 'usd';
const savedBadge = localStorage.getItem('divisa');
monedaActual = savedBadge ? JSON.parse(savedBadge) : 'usd';

// const savedBadge = localStorage.getItem('divisa');
// monedaActual = savedBadge ? JSON.parse(savedBadge) : 'usd';

// Obtención de la categoría actual de la página
const currentCategory = window.location.pathname.split('/').pop().split('.')[0];

// Actualización de la sección y título de la sección en la página
if (currentCategory !== 'index') {
    const section = document.getElementById('section');
    const titleSection = document.getElementById('title-section');
    section.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).toLowerCase();
    titleSection.textContent = currentCategory.toLocaleUpperCase();
}

// Obtención de los productos desde un archivo JSON
async function fetchData() {
    try {
        const response = await fetch('./products.json');
        const data = await response.json();
        if (currentCategory !== 'index') {
            const currentProducts = data.filter(product => product.section === currentCategory);
            products = currentProducts;
            loadProducts(currentProducts);
        }
    } catch (error) {
        // Manejar el error
    }
}

fetchData();


// Obtención de elementos del DOM
const productsDiv = document.getElementById('products');
const inputRange = document.getElementById('input-range');
const inputRangeValue = document.getElementById('input-range-value');
const checkFilter = document.querySelectorAll('.check-filter');
const lowEst = document.getElementById('lowest');
const highEst = document.getElementById('highest');
const filterButton = document.getElementById('filters-btn');
const filtersDiv = document.getElementById('filters');
const filtersText = document.getElementById('filters-text');
const sortByButton = document.getElementById('sortby-btn');
const sortByDiv = document.getElementById('sortby');
const sortByText = document.getElementById('sortby-text');
const showNav = document.getElementById('show-nav');
const closeNav = document.getElementById('close-nav');
const navbar = document.getElementById('navbar');
const cartAmount = document.getElementById('cart-amount');
const cartMenu = document.getElementById('cart-menu');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const buyButton = document.getElementById('buy-button');
const clearButton = document.getElementById('clear-button');
const dropdownToggle = document.getElementById('dropdown-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');

let filteredProducts = [];

function Toast(text, color) {
    Toastify({
        text: text,
        duration: 2000,
        destination: false,
        newWindow: true,
        close: false,
        gravity: 'bottom', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: color,
        },
      }).showToast();
}
// Función para formatear el precio
function formatPrice(price) {
    const roundedPrice = Math.round(price);
    const formattedPrice = roundedPrice.toLocaleString('es-ES');
    return formattedPrice;
}

// Función para crear el elemento de producto en el DOM
function createProductElement(product) {
    const { id, name, category, new: isNew } = product;

    const productDiv = document.createElement('div');
    productDiv.classList.add(
        'relative',
        'flex',
        'flex-col',
        'gap-2',
        'justify-center',
        'items-start',
        'product-container',
        '[&>p]:uppercase'
    );

    // Creación de elementos para la imagen, nombre, precio y botón de agregar al carrito
    const productImage = document.createElement('img');
    productImage.src = `../assets/img/${category}/${id}.jpg`;
    productImage.alt = name;

    const productHeartIcon = document.createElement('i');
    productHeartIcon.classList.add('absolute', 'top-5', 'right-5', 'text-xl', 'bi', 'bi-suit-heart');

    const productName = document.createElement('p');
    productName.textContent = name;
    productName.classList.add('font-semibold', 'text-lg');

    const productPrice = document.createElement('p');
    productPrice.textContent = `${badge[monedaActual].symbol}${formatPrice(product.price * badge[monedaActual].multiplier)}`;
    productPrice.classList.add('price', 'font-semibold', 'text-lg');

    const addToCartButton = document.createElement('button');
    addToCartButton.id = id;
    addToCartButton.classList.add(
        'add-product',
        'bg-black',
        'text-white',
        'font-semibold',
        'p-2',
        'uppercase',
        'rounded-tr-lg'
    );
    addToCartButton.innerHTML = '<i class=\'bi bi-cart-fill\'></i> Add to cart';

    productDiv.append(productImage, productHeartIcon, productName, productPrice, addToCartButton);

    // Si el producto es nuevo, se agrega una insignia "new" al elemento del producto
    if (isNew) {
        const newBadge = document.createElement('p');
        newBadge.textContent = 'new';
        newBadge.classList.add('absolute', 'top-5', 'left-5', 'text-xs', 'py-1', 'px-3', 'rounded-full', 'bg-white', 'font-semibold');
        productDiv.append(newBadge);
    }

    return productDiv;
}

// Función para cargar los productos en el DOM
function loadProducts(category) {
    productsDiv.innerHTML = '';

    category.forEach((product) => {
        const productElement = createProductElement(product);
        productsDiv.appendChild(productElement);
    });

    renderButtons();
}

// Obtención del carrito de la memoria local o creación de uno nuevo
const savedCart = localStorage.getItem('cart');
const cart = savedCart ? JSON.parse(savedCart) : [];

// Función para agregar un producto al carrito
function addToCart(e) {
    const idButton = e.currentTarget.id;
    const productAdded = products.find((product) => product.id === idButton);

    if (cart.some((product) => product.id === idButton)) {
        const index = cart.findIndex((product) => product.id === idButton);
        cart[index].amount++;
    } else {
        productAdded.amount = 1;
        cart.push(productAdded);
    }

    Toast('Added to cart', '#000');

    localStorage.setItem('cart', JSON.stringify(cart));

    renderCart();
}

// Función para renderizar el carrito
function renderCart() {
    let total = cart.reduce((acc, product) => acc + product.amount, 0);

    cartAmount.innerText = total;

    localStorage.setItem('cart', JSON.stringify(cart));

    renderCartItems();
}

// Función para renderizar los elementos del carrito
function renderCartItems() {
    cartItems.innerHTML = '';
    let totalCartItems = 0;

    cart.forEach((product) => {
        const { id, name, category, price, amount } = product;

        if (amount > 1) {
            totalCartItems += amount * price;
        } else {
            totalCartItems += price;
        }

        const cartItem = document.createElement('li');
        cartItem.classList.add('flex', 'items-center', 'gap-3');

        const image = document.createElement('img');
        image.classList.add('w-[90px]', 'object-cover');
        image.src = `../assets/img/${category}/${id}.jpg`;
        image.alt = name;

        const itemDetails = document.createElement('div');
        itemDetails.classList.add('flex', 'flex-col', 'gap-6');

        const itemName = document.createElement('p');
        itemName.classList.add('font-semibold', 'text-lg', 'uppercase');
        itemName.textContent = name;

        const itemDescription = document.createElement('p');
        itemDescription.classList.add('text-xs');
        itemDescription.textContent = 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.';

        const itemPrice = document.createElement('p');
        itemPrice.classList.add('font-semibold', 'text-base');
        itemPrice.textContent = `${amount} x ${badge[monedaActual].symbol}${formatPrice(amount * (price * badge[monedaActual].multiplier))}`;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('text-red-400', 'text-xl', 'trash-btn');
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.addEventListener('click', () => deleteCartItem(id));

        itemDetails.append(itemName, itemDescription, itemPrice);
        cartItem.append(image, itemDetails, deleteButton);
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `${badge[monedaActual].symbol}${formatPrice(totalCartItems * badge[monedaActual].multiplier)}`;

    renderButtons();
}

// Función para eliminar un elemento del carrito
function deleteCartItem(productId) {
    const index = cart.findIndex(product => product.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        renderCart();

        Toast('Removed from cart', 'rgb(239 68 68)');
    }
}

// Función para renderizar los botones de agregar al carrito y eliminar del carrito
function renderButtons() {
    const botonesAgregar = document.querySelectorAll('.add-product');
    botonesAgregar.forEach((button) => {
        button.addEventListener('click', addToCart);
    });

    const botonesEliimnar = document.querySelectorAll('.trash-btn');
    botonesEliimnar.forEach((button) => {
        button.addEventListener('click', deleteCartItem);
    });
}

// Función para aplicar los filtros a los productos
function applyFilters(filteredData) {
    filteredProducts = filteredData || products;

    const selectedCategory = Array.from(checkFilter)
        .filter(check => check.checked)
        .map(check => check.value);

    const selectedPrice = inputRange.value;

    filteredProducts = filteredProducts.filter(product => {

        if (selectedCategory.length > 0 && !selectedCategory.includes(product.category)) {
            return false;
        }

        return product.price <= selectedPrice;
    });

    loadProducts(filteredProducts);
}

// Aplicación de los filtros al cambiar el rango de precio
if (currentCategory !== 'index') {
    inputRange.addEventListener('input', () => {
        inputRangeValue.textContent = inputRange.value * badge[monedaActual].multiplier;

        applyFilters();
    });

    // Aplicación de los filtros al cambiar las opciones de filtro
    checkFilter.forEach(check => {
        check.addEventListener('change', () => {
            applyFilters();
        });
    });

    // Aplicación del filtro por precio más bajo
    lowEst.addEventListener('click', () => {
        const filterByLowest = products.slice().sort((a, b) => a.price - b.price);
        applyFilters(filterByLowest);
    });

    // Aplicación del filtro por precio más alto
    highEst.addEventListener('click', () => {
        const filterByHighest = products.slice().sort((a, b) => b.price - a.price);
        applyFilters(filterByHighest);
    });

    // Mostrar/ocultar los filtros
    filterButton.addEventListener('click', () => {
        filtersDiv.classList.toggle('invisible');
        if (filtersDiv.classList.contains('invisible')) {
            filtersText.innerHTML = 'Filters <i class="bi bi-arrow-bar-up"></i>';
        } else {
            filtersText.innerHTML = 'Filters <i class="bi bi-arrow-bar-down"></i>';
        }
    });

    // Mostrar/ocultar las opciones de ordenar por
    sortByButton.addEventListener('click', () => {
        sortByDiv.classList.toggle('invisible');
        if (sortByDiv.classList.contains('invisible')) {
            sortByText.innerHTML = 'Sort by <i class="bi bi-arrow-bar-up"></i>';
        } else {
            sortByText.innerHTML = 'Sort by <i class="bi bi-arrow-bar-down"></i>';
        }
    });
}

// Mostrar/ocultar la barra de navegación en dispositivos móviles
showNav.addEventListener('click', () => navbar.classList.remove('max-[550px]:hidden'));
closeNav.addEventListener('click', () => navbar.classList.add('max-[550px]:hidden'));

// Función de compra (aún no implementada)
buyButton.addEventListener('click', () => console.log('Función comprar aún no terminada.'));

// Mostrar/ocultar el menú del carrito
const bagButton = document.getElementById('bagButton');
bagButton.addEventListener('click', () => {
    if (cart.length) {
        cartMenu.classList.toggle('hidden');
    }
});

// Limpiar el carrito
clearButton.addEventListener('click', () => {
    cartMenu.classList.toggle('hidden');
    cart.length = 0;
    renderCart();
});

// Cambiar la divisa seleccionada
dropdownToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
});

dropdownMenu.addEventListener('click', (e) => {
    const targetElement = e.currentTarget;
    monedaActual = e.target.id;

    localStorage.setItem('divisa', JSON.stringify(e.target.id));

    if (currentCategory !== 'index') {
        applyFilters();
    }

    renderCart();

    if (!dropdownToggle.contains(targetElement)) {
        dropdownMenu.classList.add('hidden');
    }
});

// Renderizar el carrito
renderCart();
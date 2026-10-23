
import './style.css';

import {
  getProducts,
  getProductById,
  getCategories
} from './api.js';

import {
  renderLoading,
  renderError,
  renderEmpty,
  renderProducts,
  renderStats
} from './render.js';

const productsGrid = document.querySelector('#products-grid');
const statusMessage = document.querySelector('#status-message');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');

const productDialog = document.querySelector('#product-dialog');
const productDetails = document.querySelector('#product-details');
const closeDialogButton = document.querySelector('#close-dialog');

const state = {
  products: [],
  categories: [],
  searchTerm: '',
  category: 'all',
  sortBy: 'default',
  loading: false,
  error: null
};

function getVisibleItems(currentState) {
  const search = currentState.searchTerm.trim().toLowerCase();

  let visibleProducts = currentState.products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search);

    const matchesCategory =
      currentState.category === 'all' ||
      product.category === currentState.category;

    return matchesSearch && matchesCategory;
  });

  if (currentState.sortBy === 'price-asc') {
    visibleProducts = visibleProducts.toSorted(
      (a, b) => a.price - b.price
    );
  } else if (currentState.sortBy === 'price-desc') {
    visibleProducts = visibleProducts.toSorted(
      (a, b) => b.price - a.price
    );
  } else if (currentState.sortBy === 'name') {
    visibleProducts = visibleProducts.toSorted(
      (a, b) => a.title.localeCompare(b.title)
    );
  }

  return visibleProducts;
}

function renderCategories() {
  categoryFilter.replaceChildren();

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All categories';
  categoryFilter.append(allOption);

  state.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  categoryFilter.value = state.category;
}

function renderApp() {
  const visibleProducts = getVisibleItems(state);

  renderStats(state.products, visibleProducts.length);

  if (state.loading) {
    statusMessage.textContent = 'Loading products...';
    renderLoading(productsGrid);
    return;
  }

  if (state.error) {
    statusMessage.textContent = '';
    renderError(productsGrid, state.error);
    return;
  }

  statusMessage.textContent =
    `Showing ${visibleProducts.length} of ${state.products.length} products.`;

  if (visibleProducts.length === 0) {
    renderEmpty(
      productsGrid,
      state.searchTerm || state.category !== 'all'
        ? 'Try changing your search or category filter.'
        : 'No products are available right now.'
    );
    return;
  }

  renderProducts(productsGrid, visibleProducts, openProductDetails);
}

async function loadProducts() {
  state.loading = true;
  state.error = null;
  renderApp();

  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories()
    ]);

    state.products = products;
    state.categories = [...new Set(categories)];
    renderCategories();
  } catch (error) {
    state.error = error.message || 'Something went wrong.';
  } finally {
    state.loading = false;
    renderApp();
  }
}

async function openProductDetails(id) {
  productDetails.replaceChildren();

  const heading = document.createElement('h2');
  heading.id = 'dialog-title';
  heading.className = 'text-xl font-bold';
  heading.textContent = 'Loading product details...';
  productDetails.append(heading);

  if (!productDialog.open) {
    productDialog.showModal();
  }

  try {
    const product = await getProductById(id);

    productDetails.replaceChildren();

    const title = document.createElement('h2');
    title.id = 'dialog-title';
    title.className = 'mb-4 text-xl font-bold';
    title.textContent = product.title;

    const image = document.createElement('img');
    image.src = product.thumbnail || '';
    image.alt = product.title;
    image.className = 'mb-4 max-h-56 w-full rounded-lg bg-slate-800 object-contain';

    const description = document.createElement('p');
    description.className = 'mb-4 text-slate-300';
    description.textContent = product.description;

    const category = document.createElement('p');
    category.className = 'mb-2 text-sm text-indigo-300';
    category.textContent = `Category: ${product.category}`;

    const price = document.createElement('p');
    price.className = 'mb-2 font-bold text-emerald-400';
    price.textContent = `Price: $${Number(product.price).toFixed(2)}`;

    const rating = document.createElement('p');
    rating.className = 'mb-2 text-amber-300';
    rating.textContent = `Rating: ${product.rating ?? 'N/A'}`;

    const stock = document.createElement('p');
    stock.className = 'text-slate-400';
    stock.textContent = `Stock: ${product.stock ?? 0}`;

    productDetails.append(
      title,
      image,
      description,
      category,
      price,
      rating,
      stock
    );
  } catch (error) {
    productDetails.replaceChildren();

    const errorText = document.createElement('p');
    errorText.className = 'text-red-300';
    errorText.textContent = `Could not load details: ${error.message}`;

    productDetails.append(errorText);
  }
}

searchInput.addEventListener('input', () => {
  state.searchTerm = searchInput.value;
  renderApp();
});

categoryFilter.addEventListener('change', () => {
  state.category = categoryFilter.value;
  renderApp();
});

sortSelect.addEventListener('change', () => {
  state.sortBy = sortSelect.value;
  renderApp();
});

productsGrid.addEventListener('click', (event) => {
  if (event.target.closest('#retry-button')) {
    loadProducts();
  }
});

closeDialogButton.addEventListener('click', () => {
  productDialog.close();
});

productDialog.addEventListener('click', (event) => {
  if (event.target === productDialog) {
    productDialog.close();
  }
});

loadProducts();

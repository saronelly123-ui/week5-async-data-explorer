
export function renderLoading(container) {
  container.innerHTML = `
    <div class="col-span-full grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
         role="status"
         aria-label="Loading products">
      ${Array.from({ length: 8 }, () => `
        <article class="animate-pulse overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div class="mb-4 h-40 rounded-lg bg-slate-800"></div>
          <div class="mb-3 h-4 w-3/4 rounded bg-slate-800"></div>
          <div class="mb-5 h-4 w-1/2 rounded bg-slate-800"></div>
          <div class="h-8 w-1/3 rounded bg-slate-800"></div>
        </article>
      `).join('')}
    </div>
    <p class="sr-only">Loading products. Please wait.</p>
  `;
}

export function renderError(container, message) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className =
    'col-span-full rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center';

  const heading = document.createElement('h2');
  heading.className = 'mb-2 text-lg font-bold text-red-300';
  heading.textContent = 'Unable to load products';

  const description = document.createElement('p');
  description.className = 'mb-4 text-sm text-slate-300';
  description.textContent = message;

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.id = 'retry-button';
  retryButton.className =
    'rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400';
  retryButton.textContent = 'Try again';

  wrapper.append(heading, description, retryButton);
  container.append(wrapper);
}

export function renderEmpty(container, message = 'No products found.') {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className =
    'col-span-full rounded-xl border border-slate-800 bg-slate-900 p-10 text-center';

  const heading = document.createElement('h2');
  heading.className = 'mb-2 text-xl font-bold text-white';
  heading.textContent = 'Nothing to display';

  const description = document.createElement('p');
  description.className = 'text-slate-400';
  description.textContent = message;

  wrapper.append(heading, description);
  container.append(wrapper);
}

export function renderProducts(container, products, onProductClick) {
  container.innerHTML = '';

  if (products.length === 0) {
    renderEmpty(container);
    return;
  }

  const cards = products.map((product) => {
    const {
      id,
      title,
      description,
      category,
      price,
      thumbnail,
      rating,
      stock
    } = product;

    const article = document.createElement('article');
    article.className =
      'overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-950/30';

    const button = document.createElement('button');
    button.type = 'button';
    button.className =
      'block w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400';
    button.setAttribute('aria-label', `View details for ${title}`);

    const image = document.createElement('img');
    image.src = thumbnail || '';
    image.alt = title;
    image.loading = 'lazy';
    image.className = 'h-44 w-full bg-slate-800 object-contain p-4';

    image.addEventListener('error', () => {
      image.alt = `${title} image unavailable`;
      image.removeAttribute('src');
    }, { once: true });

    const content = document.createElement('div');
    content.className = 'p-4';

    const categoryText = document.createElement('p');
    categoryText.className =
      'mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400';
    categoryText.textContent = category;

    const titleText = document.createElement('h2');
    titleText.className = 'mb-2 line-clamp-1 text-lg font-bold text-white';
    titleText.textContent = title;

    const descriptionText = document.createElement('p');
    descriptionText.className = 'mb-4 line-clamp-2 text-sm text-slate-400';
    descriptionText.textContent = description;

    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-between gap-3';

    const priceText = document.createElement('p');
    priceText.className = 'font-bold text-emerald-400';
    priceText.textContent = `$${Number(price).toFixed(2)}`;

    const ratingText = document.createElement('p');
    ratingText.className = 'text-sm text-amber-300';
    ratingText.textContent = `★ ${rating ?? 'N/A'}`;

    const stockText = document.createElement('p');
    stockText.className = 'mt-3 text-xs text-slate-500';
    stockText.textContent = `Stock: ${stock ?? 0}`;

    footer.append(priceText, ratingText);
    content.append(categoryText, titleText, descriptionText, footer, stockText);
    button.append(image, content);

    button.addEventListener('click', () => onProductClick(id));

    article.append(button);
    return article;
  });

  container.append(...cards);
}

export function renderStats(products, visibleCount) {
  const totalElement = document.querySelector('#total-products');
  const shownElement = document.querySelector('#shown-products');
  const averageElement = document.querySelector('#average-price');

  const total = products.reduce((sum) => sum + 1, 0);

  const totalPrice = products.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  );

  const averagePrice = total > 0 ? totalPrice / total : 0;

  if (totalElement) totalElement.textContent = String(total);
  if (shownElement) shownElement.textContent = String(visibleCount);
  if (averageElement) averageElement.textContent = `$${averagePrice.toFixed(2)}`;
}


const BASE_URL = 'https://dummyjson.com';

export async function getJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Unable to load data: ${error.message}`);
  }
}

export async function getProducts() {
  const data = await getJSON(`${BASE_URL}/products?limit=100`);
  return data.products;
}

export async function getProductById(id) {
  return await getJSON(`${BASE_URL}/products/${id}`);
}

export async function getCategories() {
  return await getJSON(`${BASE_URL}/products/category-list`);
}

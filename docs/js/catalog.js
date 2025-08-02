// Catalog page functionality
document.addEventListener("DOMContentLoaded", function () {
  let allProducts = [];
  let filteredProducts = [];

  // Load all products
  loadProducts();

  // Set up event listeners
  setupFilters();

  // Check for URL parameters
  checkURLParameters();
});

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    allProducts = await response.json();
    filteredProducts = [...allProducts];

    displayProducts(filteredProducts);
    updateProductCount();
  } catch (error) {
    console.error("Error loading products:", error);
    showError("Error loading products. Please try again later.");
  }
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const featuredFilter = document.getElementById("featured-filter");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  if (featuredFilter) {
    featuredFilter.addEventListener("click", function () {
      this.classList.toggle("active");
      applyFilters();
    });
  }
}

function checkURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  if (category) {
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter) {
      categoryFilter.value = category;
      applyFilters();
    }
  }
}

function applyFilters() {
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const featuredFilter = document.getElementById("featured-filter");

  let filtered = [...allProducts];

  // Apply category filter
  const selectedCategory = categoryFilter ? categoryFilter.value : "";
  if (selectedCategory) {
    filtered = filtered.filter(
      (product) => product.category === selectedCategory
    );
  }

  // Apply featured filter
  const showOnlyFeatured = featuredFilter
    ? featuredFilter.classList.contains("active")
    : false;
  if (showOnlyFeatured) {
    filtered = filtered.filter((product) => product.is_featured);
  }

  // Apply sorting
  const sortBy = sortFilter ? sortFilter.value : "newest";
  filtered = sortProducts(filtered, sortBy);

  filteredProducts = filtered;
  displayProducts(filteredProducts);
  updateProductCount();
}

function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case "price-high":
      return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  }
}

function displayProducts(products) {
  const container = document.getElementById("catalog-products");
  const noProductsMessage = document.getElementById("no-products");

  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = "";
    if (noProductsMessage) {
      noProductsMessage.style.display = "block";
    }
    return;
  }

  if (noProductsMessage) {
    noProductsMessage.style.display = "none";
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                ${
                  product.image_url
                    ? `<img src="${product.image_url}" alt="${product.name}" />`
                    : `<div class="placeholder"><i class="fas fa-gem"></i></div>`
                }
                ${
                  product.is_featured
                    ? '<div class="featured-badge"><i class="fas fa-star"></i></div>'
                    : ""
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                <p class="description">${
                  product.description
                    ? product.description.substring(0, 100) + "..."
                    : ""
                }</p>
                <div class="product-meta">
                    <span class="material"><i class="fas fa-info-circle"></i> ${
                      product.material || "Silver"
                    }</span>
                    ${
                      product.weight
                        ? `<span class="weight"><i class="fas fa-weight"></i> ${product.weight}g</span>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function updateProductCount() {
  const count = filteredProducts.length;
  const total = allProducts.length;

  // Update page title or add a count display
  const pageHeader = document.querySelector(".page-header h1");
  if (pageHeader) {
    const baseTitle = "Our Jewelry Collection";
    if (count === total) {
      pageHeader.textContent = `${baseTitle} (${total} items)`;
    } else {
      pageHeader.textContent = `${baseTitle} (${count} of ${total} items)`;
    }
  }
}

// Open product modal (enhanced for catalog)
async function openProductModal(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();

    if (!product) {
      showError("Product not found");
      return;
    }

    // Update modal content
    const modal = document.getElementById("product-modal");
    const modalImage = document.getElementById("modal-image");
    const modalName = document.getElementById("modal-name");
    const modalPrice = document.getElementById("modal-price");
    const modalDescription = document.getElementById("modal-description");
    const modalCategory = document.getElementById("modal-category");
    const modalMaterial = document.getElementById("modal-material");
    const modalWeight = document.getElementById("modal-weight");
    const modalDimensions = document.getElementById("modal-dimensions");

    if (modalImage)
      modalImage.src = product.image_url || "/public/images/placeholder.jpg";
    if (modalName) modalName.textContent = product.name;
    if (modalPrice)
      modalPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;
    if (modalDescription)
      modalDescription.textContent =
        product.description || "No description available.";
    if (modalCategory) modalCategory.textContent = product.category;
    if (modalMaterial) modalMaterial.textContent = product.material || "Silver";
    if (modalWeight)
      modalWeight.textContent = product.weight ? `${product.weight}g` : "N/A";
    if (modalDimensions)
      modalDimensions.textContent = product.dimensions || "N/A";

    // Show modal
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  } catch (error) {
    console.error("Error loading product details:", error);
    showError("Error loading product details");
  }
}

function showError(message) {
  const container = document.getElementById("catalog-products");
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="loadProducts()" class="btn btn-primary">Try Again</button>
            </div>
        `;
  }
}

// Add CSS for featured badge and meta info
const style = document.createElement("style");
style.textContent = `
    .product-card {
        position: relative;
    }
    
    .featured-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #f39c12;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 15px;
        font-size: 0.8rem;
        z-index: 10;
    }
    
    .product-meta {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #666;
    }
    
    .product-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .error-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .error-message i {
        font-size: 3rem;
        color: #e74c3c;
        margin-bottom: 1rem;
    }
    
    .error-message h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .error-message p {
        color: #666;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
        .product-meta {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
`;
document.head.appendChild(style);

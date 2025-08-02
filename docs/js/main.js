// Main JavaScript for general functionality
document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation toggle
  const mobileMenu = document.getElementById("mobile-menu");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenu && navMenu) {
    mobileMenu.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking on nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) {
        navMenu.classList.remove("active");
      }
    });
  });

  // Load featured products on home page
  if (document.getElementById("featured-products")) {
    loadFeaturedProducts();
  }

  // Category card click handlers
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", function () {
      const category = this.dataset.category;
      if (category) {
        window.location.href = `/catalog?category=${category}`;
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
});

// Load featured products for home page
async function loadFeaturedProducts() {
  try {
    // Static sample data for GitHub Pages
    const products = [
      {
        id: 1,
        name: "Heritage Temple Ring",
        category: "rings",
        price: 2500,
        description:
          "Traditional temple-inspired silver ring with intricate carvings",
        image_url: "images/logo.png",
      },
      {
        id: 2,
        name: "Classic Chandelier Earrings",
        category: "earrings",
        price: 4200,
        description:
          "Elaborate traditional earrings perfect for festive occasions",
        image_url: "images/logo.png",
      },
      {
        id: 4,
        name: "Traditional Kada Bracelet",
        category: "bracelets",
        price: 3200,
        description: "Heavy traditional silver kada with embossed patterns",
        image_url: "images/logo.png",
      },
      {
        id: 6,
        name: "Peacock Feather Earrings",
        category: "earrings",
        price: 3600,
        description: "Beautiful peacock-inspired traditional earrings",
        image_url: "images/logo.png",
      },
    ];

    const container = document.getElementById("featured-products");
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML =
        '<p class="no-products">No featured products available.</p>';
      return;
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
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="category">${product.category}</p>
                    <p class="price">₹${parseFloat(product.price).toFixed(
                      0
                    )}</p>
                    <p class="description">${
                      product.description
                        ? product.description.substring(0, 100) + "..."
                        : ""
                    }</p>
                </div>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading featured products:", error);
    const container = document.getElementById("featured-products");
    if (container) {
      container.innerHTML =
        '<p class="error">Error loading products. Please try again later.</p>';
    }
  }
}

// Open product modal
async function openProductModal(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();

    if (!product) {
      alert("Product not found");
      return;
    }

    // Update modal content
    document.getElementById("modal-image").src =
      product.image_url || "/public/images/placeholder.jpg";
    document.getElementById("modal-name").textContent = product.name;
    document.getElementById("modal-price").textContent = `$${parseFloat(
      product.price
    ).toFixed(2)}`;
    document.getElementById("modal-description").textContent =
      product.description || "No description available.";
    document.getElementById("modal-category").textContent = product.category;
    document.getElementById("modal-material").textContent =
      product.material || "Silver";
    document.getElementById("modal-weight").textContent = product.weight
      ? `${product.weight}g`
      : "N/A";
    document.getElementById("modal-dimensions").textContent =
      product.dimensions || "N/A";

    // Show modal
    document.getElementById("product-modal").style.display = "block";
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error loading product details:", error);
    alert("Error loading product details");
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Modal event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Close modal when clicking the X
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  });
});

// Utility functions
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Style the notification
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transition: all 0.3s ease;
        transform: translateX(100%);
    `;

  // Set background color based on type
  switch (type) {
    case "success":
      notification.style.backgroundColor = "#28a745";
      break;
    case "error":
      notification.style.backgroundColor = "#dc3545";
      break;
    case "warning":
      notification.style.backgroundColor = "#ffc107";
      notification.style.color = "#212529";
      break;
    default:
      notification.style.backgroundColor = "#17a2b8";
  }

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Gallery page functionality
let allItems = [];
let filteredItems = [];
let currentImageIndex = 0;

// Test function
function testModal() {
  console.log("Test modal clicked");
  const testItem = {
    name: "Test Jewelry",
    description: "Test Description",
    image_url: "/public/images/placeholder.jpg",
  };

  // Create a test array with the test item
  filteredItems = [testItem];
  openGalleryModal(0);
}

// Make test function globally accessible
window.testModal = testModal;

document.addEventListener("DOMContentLoaded", function () {
  // Load gallery items
  loadGalleryItems();

  // Set up filter buttons
  setupFilterButtons();

  // Set up modal navigation
  setupModalNavigation();

  // Set up modal close functionality
  setupModalClose();
});

// Make openGalleryModal globally accessible
window.openGalleryModal = openGalleryModal;

async function loadGalleryItems() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();

    // Convert products to gallery items
    allItems = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      image_url: product.image_url,
      gallery_images: product.gallery_images || [],
    }));

    filteredItems = [...allItems];
    displayGalleryItems(filteredItems);
  } catch (error) {
    console.error("Error loading gallery items:", error);
    showError("Error loading gallery. Please try again later.");
  }
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Apply filter
      const filter = this.dataset.filter;
      applyFilter(filter);
    });
  });
}

function applyFilter(filter) {
  if (filter === "all") {
    filteredItems = [...allItems];
  } else {
    filteredItems = allItems.filter((item) => item.category === filter);
  }

  displayGalleryItems(filteredItems);
}

function displayGalleryItems(items) {
  const container = document.getElementById("gallery-grid");

  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
            <div class="no-items">
                <i class="fas fa-images"></i>
                <h3>No items found</h3>
                <p>Try selecting a different category.</p>
            </div>
        `;
    return;
  }

  console.log("Displaying", items.length, "gallery items"); // Debug log

  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="gallery-item" data-index="${index}" style="cursor: pointer;">
            <img src="${
              item.image_url || "/public/images/placeholder.jpg"
            }" alt="${item.name}" />
            <div class="overlay">
                <div class="overlay-content">
                    <h3>${item.name}</h3>
                    <p>${item.category}</p>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Remove any existing event listeners and add new ones
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);

  // Add click event listeners using event delegation
  newContainer.addEventListener("click", function (e) {
    const galleryItem = e.target.closest(".gallery-item");
    if (galleryItem) {
      const index = parseInt(galleryItem.getAttribute("data-index"));
      console.log("Gallery item clicked, index:", index); // Debug log
      openGalleryModal(index);
    }
  });

  console.log("Gallery items HTML generated successfully"); // Debug log
}

function openGalleryModal(index) {
  currentImageIndex = index;
  const item = filteredItems[index];

  if (!item) return;

  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("gallery-modal-img");
  const modalTitle = document.getElementById("gallery-modal-title");
  const modalDescription = document.getElementById("gallery-modal-description");

  console.log("Opening modal for item:", item); // Debug log

  if (modalImg) {
    modalImg.src = item.image_url || "/public/images/placeholder.jpg";
    modalImg.alt = item.name;
    // Add loading animation
    modalImg.style.opacity = "0";
    modalImg.onload = function () {
      this.style.transition = "opacity 0.3s ease";
      this.style.opacity = "1";
    };
  }

  if (modalTitle) modalTitle.textContent = item.name;
  if (modalDescription)
    modalDescription.textContent =
      item.description ||
      "A beautiful handcrafted silver jewelry piece from our traditional collection.";

  // Update navigation buttons
  updateNavigationButtons();

  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Add fade-in animation
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease";
      modal.style.opacity = "1";
    }, 10);

    console.log("Modal opened successfully"); // Debug log
  } else {
    console.error("Gallery modal not found!"); // Debug log
  }
}

function setupModalNavigation() {
  const prevBtn = document.getElementById("prev-image");
  const nextBtn = document.getElementById("next-image");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateModalContent();
        updateNavigationButtons();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (currentImageIndex < filteredItems.length - 1) {
        currentImageIndex++;
        updateModalContent();
        updateNavigationButtons();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    const modal = document.getElementById("gallery-modal");
    if (modal && modal.style.display === "block") {
      if (e.key === "ArrowLeft" && currentImageIndex > 0) {
        currentImageIndex--;
        updateModalContent();
        updateNavigationButtons();
      } else if (
        e.key === "ArrowRight" &&
        currentImageIndex < filteredItems.length - 1
      ) {
        currentImageIndex++;
        updateModalContent();
        updateNavigationButtons();
      } else if (e.key === "Escape") {
        closeGalleryModal();
      }
    }
  });
}

function updateModalContent() {
  const item = filteredItems[currentImageIndex];
  if (!item) return;

  const modalImg = document.getElementById("gallery-modal-img");
  const modalTitle = document.getElementById("gallery-modal-title");
  const modalDescription = document.getElementById("gallery-modal-description");

  if (modalImg) {
    // Smooth image transition
    modalImg.style.opacity = "0.5";
    modalImg.style.transform = "scale(0.95)";

    setTimeout(() => {
      modalImg.src = item.image_url || "/public/images/placeholder.jpg";
      modalImg.alt = item.name;
      modalImg.onload = function () {
        this.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        this.style.opacity = "1";
        this.style.transform = "scale(1)";
      };
    }, 150);
  }

  if (modalTitle) modalTitle.textContent = item.name;
  if (modalDescription)
    modalDescription.textContent =
      item.description ||
      "A beautiful handcrafted silver jewelry piece from our traditional collection.";
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById("prev-image");
  const nextBtn = document.getElementById("next-image");

  if (prevBtn) {
    prevBtn.disabled = currentImageIndex === 0;
    prevBtn.style.opacity = currentImageIndex === 0 ? "0.5" : "1";
  }

  if (nextBtn) {
    nextBtn.disabled = currentImageIndex === filteredItems.length - 1;
    nextBtn.style.opacity =
      currentImageIndex === filteredItems.length - 1 ? "0.5" : "1";
  }
}

function closeGalleryModal() {
  const modal = document.getElementById("gallery-modal");
  if (modal) {
    // Add fade-out animation
    modal.style.transition = "opacity 0.3s ease";
    modal.style.opacity = "0";

    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  }
}

function setupModalClose() {
  const modal = document.getElementById("gallery-modal");
  const closeBtn = modal ? modal.querySelector(".close") : null;

  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener("click", closeGalleryModal);
  }

  // Click outside modal to close
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeGalleryModal();
      }
    });
  }

  // Escape key to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("gallery-modal");
      if (modal && modal.style.display === "block") {
        closeGalleryModal();
      }
    }
  });
}

function showError(message) {
  const container = document.getElementById("gallery-grid");
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="loadGalleryItems()" class="btn btn-primary">Try Again</button>
            </div>
        `;
  }
}

// Gallery modal image zoom on hover
document.addEventListener("DOMContentLoaded", function () {
  const style = document.createElement("style");
  style.textContent = `
    .gallery-item {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .gallery-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px var(--shadow-elegant);
    }
    
    .no-items, .error-message {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: var(--primary-white);
      border-radius: 15px;
      box-shadow: 0 8px 25px var(--shadow-soft);
      border: 2px solid var(--border-silver);
    }
    
    .no-items i, .error-message i {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      color: var(--medium-silver);
    }
    
    .error-message i {
      color: var(--traditional-gold);
    }
    
    .no-items h3, .error-message h3 {
      margin-bottom: 1rem;
      color: var(--text-primary);
      font-family: "Georgia", serif;
    }
    
    .no-items p, .error-message p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      font-family: "Georgia", serif;
    }
  `;
  document.head.appendChild(style);
});

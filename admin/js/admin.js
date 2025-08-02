// Admin panel functionality
let currentUser = null;
let products = [];
let contacts = [];

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const token = localStorage.getItem("adminToken");
  if (token) {
    verifyToken(token);
  } else {
    showLoginModal();
  }

  setupEventListeners();
});

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Navigation
  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.dataset.section;
      if (section) {
        showSection(section);
        updateActiveNavLink(this);
      }
    });
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Add product button
  const addProductBtn = document.getElementById("add-product-btn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => openProductModal());
  }

  // Product form
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
  }

  // Cancel product button
  const cancelProductBtn = document.getElementById("cancel-product");
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", () =>
      closeModal("product-modal")
    );
  }

  // Modal close buttons
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Modal outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal(this.id);
      }
    });
  });
}

async function handleLogin(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem("adminToken", result.token);
      currentUser = result.user;
      hideLoginModal();
      showDashboard();
      loadDashboardData();
    } else {
      showLoginError(result.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showLoginError("Network error. Please try again.");
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch("/api/admin/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      hideLoginModal();
      showDashboard();
      loadDashboardData();
    } else {
      localStorage.removeItem("adminToken");
      showLoginModal();
    }
  } catch (error) {
    console.error("Token verification error:", error);
    localStorage.removeItem("adminToken");
    showLoginModal();
  }
}

function handleLogout() {
  localStorage.removeItem("adminToken");
  currentUser = null;
  showLoginModal();
  hideDashboard();
}

function showLoginModal() {
  const modal = document.getElementById("login-modal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function hideLoginModal() {
  const modal = document.getElementById("login-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function showDashboard() {
  const dashboard = document.getElementById("admin-dashboard");
  if (dashboard) {
    dashboard.style.display = "flex";
  }

  const adminUser = document.getElementById("admin-user");
  if (adminUser && currentUser) {
    adminUser.textContent = `Welcome, ${currentUser.email}`;
  }
}

function hideDashboard() {
  const dashboard = document.getElementById("admin-dashboard");
  if (dashboard) {
    dashboard.style.display = "none";
  }
}

function showLoginError(message) {
  const errorDiv = document.getElementById("login-error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  const section = document.getElementById(`${sectionName}-section`);
  if (section) {
    section.classList.add("active");
  }

  // Update page title
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    pageTitle.textContent =
      sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
  }

  // Load section-specific data
  switch (sectionName) {
    case "products":
      loadProducts();
      break;
    case "contacts":
      loadContacts();
      break;
    case "dashboard":
      loadDashboardData();
      break;
  }
}

function updateActiveNavLink(activeLink) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  activeLink.classList.add("active");
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("adminToken");

    // Load products for stats
    const productsResponse = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    products = await productsResponse.json();

    // Load contacts for stats
    const contactsResponse = await fetch("/api/admin/contacts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    contacts = await contactsResponse.json();

    updateDashboardStats();
    updateRecentActivity();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

function updateDashboardStats() {
  const totalProducts = products.length;
  const visibleProducts = products.filter((p) => p.is_visible).length;
  const featuredProducts = products.filter((p) => p.is_featured).length;
  const unreadMessages = contacts.filter((c) => !c.is_read).length;

  document.getElementById("total-products").textContent = totalProducts;
  document.getElementById("visible-products").textContent = visibleProducts;
  document.getElementById("featured-products").textContent = featuredProducts;
  document.getElementById("unread-messages").textContent = unreadMessages;
}

function updateRecentActivity() {
  const recentActivity = document.getElementById("recent-activity");
  if (!recentActivity) return;

  const activities = [];

  // Add recent product activities
  const recentProducts = products
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  recentProducts.forEach((product) => {
    activities.push({
      text: `Product "${product.name}" was created`,
      time: new Date(product.created_at),
    });
  });

  // Add recent contact activities
  const recentContacts = contacts
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  recentContacts.forEach((contact) => {
    activities.push({
      text: `New message from ${contact.name}`,
      time: new Date(contact.created_at),
    });
  });

  // Sort all activities by time
  activities.sort((a, b) => b.time - a.time);

  recentActivity.innerHTML =
    activities
      .slice(0, 5)
      .map(
        (activity) => `
        <div class="activity-item">
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">${formatTimeAgo(activity.time)}</div>
        </div>
    `
      )
      .join("") || "<p>No recent activity</p>";
}

async function loadProducts() {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    products = await response.json();
    displayProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    showNotification("Error loading products", "error");
  }
}

function displayProducts() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center;">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
        <tr>
            <td>
                ${
                  product.image_url
                    ? `<img src="${product.image_url}" alt="${product.name}" class="product-image-thumb" />`
                    : '<div style="width: 60px; height: 60px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 5px;"><i class="fas fa-image"></i></div>'
                }
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>
                <span class="status-badge ${
                  product.is_visible ? "visible" : "hidden"
                }">
                    ${product.is_visible ? "Visible" : "Hidden"}
                </span>
            </td>
            <td>
                ${
                  product.is_featured
                    ? '<span class="status-badge featured">Featured</span>'
                    : ""
                }
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editProduct(${
                      product.id
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn toggle" onclick="toggleProductVisibility(${
                      product.id
                    }, ${!product.is_visible})">
                        <i class="fas fa-eye${
                          product.is_visible ? "-slash" : ""
                        }"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${
                      product.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

async function loadContacts() {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch("/api/admin/contacts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    contacts = await response.json();
    displayContacts();
  } catch (error) {
    console.error("Error loading contacts:", error);
    showNotification("Error loading contacts", "error");
  }
}

function displayContacts() {
  const tbody = document.getElementById("contacts-table-body");
  if (!tbody) return;

  if (contacts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center;">No contact messages found</td></tr>';
    return;
  }

  tbody.innerHTML = contacts
    .map(
      (contact) => `
        <tr>
            <td>${formatDate(contact.created_at)}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>General Inquiry</td>
            <td>
                <span class="status-badge ${
                  contact.is_read ? "read" : "unread"
                }">
                    ${contact.is_read ? "Read" : "Unread"}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewContact(${
                      contact.id
                    })">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${
                      !contact.is_read
                        ? `<button class="action-btn edit" onclick="markAsRead(${contact.id})">
                        <i class="fas fa-check"></i>
                    </button>`
                        : ""
                    }
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

function openProductModal(product = null) {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form");
  const title = document.getElementById("product-modal-title");

  if (!modal || !form) return;

  // Reset form
  form.reset();

  // Hide current image preview
  const currentImage = document.getElementById("current-image");
  if (currentImage) {
    currentImage.style.display = "none";
  }

  if (product) {
    // Edit mode
    title.textContent = "Edit Product";

    // Populate form fields
    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-category").value = product.category || "";
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-material").value = product.material || "";
    document.getElementById("product-weight").value = product.weight || "";
    document.getElementById("product-dimensions").value =
      product.dimensions || "";
    document.getElementById("product-description").value =
      product.description || "";
    document.getElementById("product-stock").value =
      product.stock_quantity || "";
    document.getElementById("product-featured").checked =
      product.is_featured || false;
    document.getElementById("product-visible").checked =
      product.is_visible !== false;

    // Show current image if exists
    if (product.image_url && currentImage) {
      const preview = document.getElementById("current-image-preview");
      if (preview) {
        preview.src = product.image_url;
        currentImage.style.display = "block";
      }
    }

    // Store product ID for update
    form.dataset.productId = product.id;
  } else {
    // Add mode
    title.textContent = "Add Product";
    delete form.dataset.productId;
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const productId = form.dataset.productId;
  const isEdit = !!productId;

  try {
    const token = localStorage.getItem("adminToken");
    const url = isEdit
      ? `/api/admin/products/${productId}`
      : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      showNotification(
        `Product ${isEdit ? "updated" : "created"} successfully`,
        "success"
      );
      closeModal("product-modal");
      loadProducts();
      loadDashboardData(); // Refresh stats
    } else {
      throw new Error(result.message || "Operation failed");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    showNotification("Error saving product", "error");
  }
}

async function editProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    openProductModal(product);
  }
}

async function toggleProductVisibility(productId, isVisible) {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `/api/admin/products/${productId}/visibility`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_visible: isVisible }),
      }
    );

    if (response.ok) {
      showNotification(
        `Product ${isVisible ? "shown" : "hidden"} successfully`,
        "success"
      );
      loadProducts();
      loadDashboardData();
    } else {
      throw new Error("Failed to update visibility");
    }
  } catch (error) {
    console.error("Error toggling visibility:", error);
    showNotification("Error updating product visibility", "error");
  }
}

async function deleteProduct(productId) {
  if (
    !confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      showNotification("Product deleted successfully", "success");
      loadProducts();
      loadDashboardData();
    } else {
      throw new Error("Failed to delete product");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    showNotification("Error deleting product", "error");
  }
}

function viewContact(contactId) {
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return;

  // Update modal content
  document.getElementById("contact-name").textContent = contact.name;
  document.getElementById("contact-email").textContent = contact.email;
  document.getElementById("contact-phone").textContent =
    contact.phone || "Not provided";
  document.getElementById("contact-date").textContent = formatDate(
    contact.created_at
  );
  document.getElementById("contact-message").textContent = contact.message;

  // Update action buttons
  const markReadBtn = document.getElementById("mark-read-btn");
  const replyBtn = document.getElementById("reply-email-btn");

  if (markReadBtn) {
    markReadBtn.style.display = contact.is_read ? "none" : "inline-block";
    markReadBtn.onclick = () => markAsRead(contact.id);
  }

  if (replyBtn) {
    replyBtn.href = `mailto:${contact.email}?subject=Re: Your inquiry&body=Hello ${contact.name},%0D%0A%0D%0AThank you for your message...`;
  }

  // Show modal
  document.getElementById("contact-modal").style.display = "block";
  document.body.style.overflow = "hidden";

  // Mark as read automatically when viewed
  if (!contact.is_read) {
    markAsRead(contact.id);
  }
}

async function markAsRead(contactId) {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`/api/admin/contacts/${contactId}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      showNotification("Message marked as read", "success");
      loadContacts();
      loadDashboardData();

      // Hide the mark as read button in modal
      const markReadBtn = document.getElementById("mark-read-btn");
      if (markReadBtn) {
        markReadBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error marking as read:", error);
    showNotification("Error updating message status", "error");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
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
        max-width: 400px;
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

// Contact page functionality
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmission);
  }
});

async function handleContactSubmission(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate form data
  if (!validateContactForm(data)) {
    return;
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitButton.disabled = true;

  try {
    // For GitHub Pages - show demo message instead of actual submission
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate loading

    showFormMessage(
      "Demo Mode: Contact form is working! In the full version, your message would be sent to our artisans who will respond within 24 hours.",
      "success"
    );
    form.reset();
  } catch (error) {
    console.error("Error submitting contact form:", error);
    showFormMessage(
      "There was an error sending your message. Please try again.",
      "error"
    );
  } finally {
    // Restore button state
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

function validateContactForm(data) {
  const errors = [];

  // Validate required fields
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Please enter a valid name (at least 2 characters)");
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("Please enter a message (at least 10 characters)");
  }

  // Validate phone if provided
  if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
    errors.push("Please enter a valid phone number");
  }

  if (errors.length > 0) {
    showFormMessage(errors.join("<br>"), "error");
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  // Should have 10-15 digits
  return digits.length >= 10 && digits.length <= 15;
}

function showFormMessage(message, type) {
  const messageDiv = document.getElementById("form-message");
  if (!messageDiv) return;

  messageDiv.className = `form-message ${type}`;
  messageDiv.innerHTML = message;
  messageDiv.style.display = "block";

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: "smooth", block: "center" });

  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
  }
}

// Add form enhancement features
document.addEventListener("DOMContentLoaded", function () {
  // Add character counter for message field
  const messageField = document.getElementById("message");
  if (messageField) {
    addCharacterCounter(messageField);
  }

  // Add real-time validation
  addRealTimeValidation();

  // Auto-format phone number
  const phoneField = document.getElementById("phone");
  if (phoneField) {
    addPhoneFormatting(phoneField);
  }
});

function addCharacterCounter(textarea) {
  const counter = document.createElement("div");
  counter.className = "character-counter";
  counter.style.cssText = `
        text-align: right;
        margin-top: 0.25rem;
        font-size: 0.8rem;
        color: #666;
    `;

  textarea.parentNode.appendChild(counter);

  function updateCounter() {
    const length = textarea.value.length;
    const minLength = 10;
    counter.textContent = `${length} characters${
      length < minLength ? ` (minimum ${minLength})` : ""
    }`;
    counter.style.color = length < minLength ? "#e74c3c" : "#666";
  }

  textarea.addEventListener("input", updateCounter);
  updateCounter();
}

function addRealTimeValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input[required], textarea[required]");

  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this);
    });

    input.addEventListener("input", function () {
      // Clear error state while typing
      clearFieldError(this);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  switch (field.type) {
    case "email":
      if (value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = "Please enter a valid email address";
      }
      break;
    case "tel":
      if (value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = "Please enter a valid phone number";
      }
      break;
    default:
      if (field.required && !value) {
        isValid = false;
        errorMessage = "This field is required";
      } else if (field.name === "name" && value.length < 2) {
        isValid = false;
        errorMessage = "Name must be at least 2 characters";
      } else if (field.name === "message" && value.length < 10) {
        isValid = false;
        errorMessage = "Message must be at least 10 characters";
      }
  }

  if (!isValid) {
    showFieldError(field, errorMessage);
  } else {
    clearFieldError(field);
  }

  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);

  field.style.borderColor = "#e74c3c";

  const errorDiv = document.createElement("div");
  errorDiv.className = "field-error";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    `;

  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.style.borderColor = "";
  const existingError = field.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }
}

function addPhoneFormatting(phoneField) {
  phoneField.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");

    if (value.length >= 6) {
      value = value.replace(/(\d{3})(\d{3})(\d+)/, "($1) $2-$3");
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d+)/, "($1) $2");
    }

    this.value = value;
  });
}

// FAQ accordion functionality
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector("h3");
    if (question) {
      question.style.cursor = "pointer";
      question.addEventListener("click", function () {
        item.classList.toggle("active");

        // Close other FAQ items (optional - remove if you want multiple open)
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
          }
        });
      });
    }
  });
});

// Add CSS for FAQ accordion and form enhancements
const style = document.createElement("style");
style.textContent = `
    .faq-item {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .faq-item:hover {
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .faq-item h3::after {
        content: '+';
        float: right;
        font-weight: bold;
        transition: transform 0.3s ease;
    }
    
    .faq-item.active h3::after {
        transform: rotate(45deg);
    }
    
    .faq-item p {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .faq-item.active p {
        max-height: 200px;
    }
    
    .character-counter {
        transition: color 0.3s ease;
    }
    
    .form-group {
        position: relative;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }
    
    .field-error {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

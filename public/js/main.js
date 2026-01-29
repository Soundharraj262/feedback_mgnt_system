// Global JavaScript Functions

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 1.25rem; color: inherit;">
                &times;
            </button>
        </div>
    `;

    alertContainer.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Confirm dialog
function confirmAction(message) {
    return confirm(message);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Toggle active status
async function toggleStatus(url, itemName) {
    if (!confirmAction(`Are you sure you want to change the status of this ${itemName}?`)) {
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert(data.message, 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showAlert(data.message || 'Operation failed', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred', 'danger');
    }
}

// Delete item
async function deleteItem(url, itemName) {
    if (!confirmAction(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert(data.message, 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showAlert(data.message || 'Delete failed', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred', 'danger');
    }
}

// Submit form via AJAX
async function submitForm(formId, successCallback) {
    const form = document.getElementById(formId);
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert(result.message, 'success');
            if (successCallback) {
                successCallback(result);
            }
        } else {
            showAlert(result.message || 'Operation failed', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred', 'danger');
    }
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)';
        } else {
            input.style.borderColor = '';
        }
    });

    return isValid;
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Initialize tooltips (if needed)
document.addEventListener('DOMContentLoaded', function () {
    // Add any initialization code here
    console.log('Student Feedback Management System loaded');
});

// Handle form submissions
document.addEventListener('submit', function (e) {
    const form = e.target;

    // Check if form has ajax-form class
    if (form.classList.contains('ajax-form')) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    showAlert(result.message, 'success');

                    // Check for redirect
                    if (result.redirectUrl) {
                        setTimeout(() => {
                            window.location.href = result.redirectUrl;
                        }, 1000);
                    } else if (form.dataset.reload === 'true') {
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    } else {
                        form.reset();
                    }
                } else {
                    showAlert(result.message || 'Operation failed', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred', 'danger');
            });
    }
});

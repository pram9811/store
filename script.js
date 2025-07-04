// Global variables
let linkFieldCount = 1;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    calculate();
});

function setupEventListeners() {
    // Category selection
    document.getElementById('category-select').addEventListener('change', showServices);
    
    // Quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('input', calculate);
    });
    
    // Link inputs
    document.querySelectorAll('.link-input').forEach(input => {
        input.addEventListener('input', toggleOrderButton);
    });
}

function showServices() {
    const selectedCategory = document.getElementById('category-select').value;
    const allServices = document.querySelectorAll('.service-item');
    const linkSection = document.getElementById('link-section');
    
    // Hide all services
    allServices.forEach(service => {
        service.classList.remove('active');
    });
    
    // Show services for selected category
    if (selectedCategory) {
        const categoryServices = document.querySelectorAll(`[data-platform="${selectedCategory}"]`);
        categoryServices.forEach(service => {
            service.classList.add('active');
        });
        
        // Show link section when category is selected
        linkSection.style.display = 'block';
    } else {
        // Hide link section when no category selected
        linkSection.style.display = 'none';
    }
    
    // Recalculate total
    calculate();
    toggleOrderButton();
}

function calculate() {
    let total = 0;
    const activeServices = document.querySelectorAll('.service-item.active');
    
    activeServices.forEach(service => {
        const input = service.querySelector('.quantity-input');
        const resultDiv = service.querySelector('.service-result');
        const rate = parseFloat(input.dataset.rate) || 0;
        const value = parseInt(input.value) || 0;
        
        const cost = (value / 1000) * rate;
        total += cost;
        
        // Update individual result
        if (cost > 0) {
            resultDiv.textContent = `Total: Rp ${formatNumber(cost)}`;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.style.display = 'none';
        }
    });
    
    // Update total
    document.getElementById('total-amount').textContent = formatNumber(total);
    toggleOrderButton();
}

function formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
}

function addLinkField() {
    linkFieldCount++;
    const linksContainer = document.getElementById('links-container');
    
    const linkGroup = document.createElement('div');
    linkGroup.className = 'link-input-group';
    linkGroup.innerHTML = `
        <input type="text" class="form-input link-input" placeholder="Masukkan link atau username target jika pesan suntik sosmed, Masukan no wa jika pesan aplikasi premium">
        <button type="button" class="btn-remove-link" onclick="removeLinkField(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    linksContainer.appendChild(linkGroup);
    
    // Add event listener to new input
    const newInput = linkGroup.querySelector('.link-input');
    newInput.addEventListener('input', toggleOrderButton);
    
    // Show remove buttons when there are multiple fields
    updateRemoveButtons();
    toggleOrderButton();
}

function removeLinkField(button) {
    const linkGroup = button.parentElement;
    linkGroup.remove();
    linkFieldCount--;
    
    // Update remove buttons visibility
    updateRemoveButtons();
    toggleOrderButton();
}

function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.btn-remove-link');
    const linkGroups = document.querySelectorAll('.link-input-group');
    
    removeButtons.forEach(button => {
        button.style.display = linkGroups.length > 1 ? 'flex' : 'none';
    });
}

function toggleOrderButton() {
    const orderBtn = document.getElementById('order-btn');
    const selectedCategory = document.getElementById('category-select').value;
    const hasQuantity = Array.from(document.querySelectorAll('.service-item.active .quantity-input'))
        .some(input => parseInt(input.value) > 0);
    const hasLinks = Array.from(document.querySelectorAll('.link-input'))
        .some(input => input.value.trim().length > 0);
    const totalAmount = parseFloat(document.getElementById('total-amount').textContent.replace(/\./g, '')) || 0;
    
    // Enable button only if category selected, has quantity, has links, and total > 0
    const shouldEnable = selectedCategory && hasQuantity && hasLinks && totalAmount > 0;
    
    orderBtn.disabled = !shouldEnable;
    orderBtn.style.opacity = shouldEnable ? '1' : '0.5';
}

function createOrder() {
    const selectedCategory = document.getElementById('category-select').value;
    const categoryText = document.getElementById('category-select').selectedOptions[0].text;
    
    if (!selectedCategory) {
        alert('Silakan pilih kategori terlebih dahulu!');
        return;
    }
    
    // Get selected services with quantities
    const selectedServices = [];
    const activeServices = document.querySelectorAll('.service-item.active');
    
    activeServices.forEach(service => {
        const input = service.querySelector('.quantity-input');
        const quantity = parseInt(input.value) || 0;
        
        if (quantity > 0) {
            const serviceName = service.querySelector('.service-name').textContent.trim();
            const rate = parseFloat(input.dataset.rate) || 0;
            const cost = (quantity / 1000) * rate;
            
            selectedServices.push({
                name: serviceName,
                quantity: quantity,
                cost: cost
            });
        }
    });
    
    if (selectedServices.length === 0) {
        alert('Silakan masukkan jumlah untuk layanan yang ingin dipesan!');
        return;
    }
    
    // Get links/usernames
    const links = [];
    document.querySelectorAll('.link-input').forEach(input => {
        const value = input.value.trim();
        if (value) {
            links.push(value);
        }
    });
    
    if (links.length === 0) {
        alert('Silakan masukkan minimal satu link atau username target!');
        return;
    }
    
    // Calculate total
    const totalCost = selectedServices.reduce((sum, service) => sum + service.cost, 0);
    
// Create WhatsApp message
let message = `✨ *PESANAN BARU* ✨\n\n`;

// Category
message += `📦 *Kategori:* ${categoryText}\n\n`;

// Order Details
message += `📋 *Detail Pesanan:*\n`;
selectedServices.forEach((service, index) => {
    message += `👉 ${index + 1}. *${service.name}*\n`;
    message += `   ├ Jumlah: ${formatNumber(service.quantity)}\n`;
    message += `   └ Harga: Rp ${formatNumber(service.cost)}\n\n`;
});

// Target/Links
message += `🌐 *Target/Link:*\n`;
links.forEach((link, index) => {
    message += `🔗 ${index + 1}. ${link}\n`;
});

// Total Price
message += `\n💲 *Total Harga:* Rp ${formatNumber(totalCost)}\n\n`;
message += `⚡ Mohon segera diproses. Terima kasih! 🙏`;
    
    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/628567325691?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

function resetForm() {
    // Reset category
    document.getElementById('category-select').value = '';
    
    // Hide all services
    document.querySelectorAll('.service-item').forEach(service => {
        service.classList.remove('active');
        const input = service.querySelector('.quantity-input');
        input.value = '';
        const result = service.querySelector('.service-result');
        result.style.display = 'none';
    });
    
    // Reset links
    const linksContainer = document.getElementById('links-container');
    linksContainer.innerHTML = `
        <div class="link-input-group">
            <input type="text" class="form-input link-input" placeholder="Masukkan link atau username target jika pesan suntik sosmed, Masukan no wa jika pesan aplikasi premium">
            <button type="button" class="btn-remove-link" onclick="removeLinkField(this)" style="display: none;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Reset link field count
    linkFieldCount = 1;
    
    // Hide link section
    document.getElementById('link-section').style.display = 'none';
    
    // Reset total
    document.getElementById('total-amount').textContent = '0';
    
    // Setup event listeners for new inputs
    setupEventListeners();
    
    // Update button state
    toggleOrderButton();
}

// Utility function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Utility function to validate username
function isValidUsername(username) {
    // Basic validation for social media usernames
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    return usernameRegex.test(username) && username.length >= 1 && username.length <= 50;
}

// Enhanced validation for links/usernames
function validateLinksAndUsernames() {
    const linkInputs = document.querySelectorAll('.link-input');
    let allValid = true;
    
    linkInputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            const isUrl = isValidUrl(value);
            const isUsername = isValidUsername(value);
            
            if (!isUrl && !isUsername) {
                input.style.borderColor = 'var(--danger)';
                allValid = false;
            } else {
                input.style.borderColor = 'var(--border)';
            }
        }
    });
    
    return allValid;
}

// Add validation on input
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('link-input')) {
        validateLinksAndUsernames();
        toggleOrderButton();
    }
});

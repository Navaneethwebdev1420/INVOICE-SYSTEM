const API_URL = '/api';

// ============ UTILITY FUNCTIONS ============

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
};

// ============ DASHBOARD ============

async function loadDashboard() {
  try {
    const [statsRes, invoicesRes] = await Promise.all([
      fetch(`${API_URL}/stats`),
      fetch(`${API_URL}/invoices`)
    ]);
    
    const stats = await statsRes.json();
    const invoices = await invoicesRes.json();
    
    document.getElementById('totalInvoices').textContent = stats.totalInvoices;
    document.getElementById('totalClients').textContent = stats.totalClients;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('pendingAmount').textContent = formatCurrency(stats.pendingAmount);
    
    // Show recent invoices
    const tbody = document.getElementById('recentInvoices');
    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No invoices yet</td></tr>';
    } else {
      tbody.innerHTML = invoices.slice(0, 1).map(inv => `
        <tr>
          <td>${inv.invoiceNumber}</td>
          <td>${inv.clientName}</td>
          <td>${formatCurrency(inv.total)}</td>
          <td><span class="status status-${inv.status}">${inv.status}</span></td>
          <td>${formatDate(inv.createdAt)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

// ============ CLIENTS ============

async function loadClients() {
  try {
    const res = await fetch(`${API_URL}/clients`);
    const clients = await res.json();
    
    const tbody = document.getElementById('clientsTable');
    if (clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No clients yet</td></tr>';
    } else {
      tbody.innerHTML = clients.map(client => `
        <tr>
          <td>${client.name}</td>
          <td>${client.email || '-'}</td>
          <td>${client.phone || '-'}</td>
          <td>${client.address || '-'}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" onclick="editClient('${client._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteClient('${client._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading clients:', err);
  }
}

async function saveClient(e) {
  e.preventDefault();
  
  const id = document.getElementById('clientId').value;
  const data = {
    name: document.getElementById('clientName').value,
    email: document.getElementById('clientEmail').value,
    phone: document.getElementById('clientPhone').value,
    address: document.getElementById('clientAddress').value
  };
  
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/clients/${id}` : `${API_URL}/clients`;
  
  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    closeModal('clientModal');
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    loadClients();
  } catch (err) {
    alert('Error saving client');
  }
}

async function editClient(id) {
  try {
    const res = await fetch(`${API_URL}/clients`);
    const clients = await res.json();
    const client = clients.find(c => c._id === id);
    
    if (client) {
      document.getElementById('clientId').value = client._id;
      document.getElementById('clientName').value = client.name;
      document.getElementById('clientEmail').value = client.email || '';
      document.getElementById('clientPhone').value = client.phone || '';
      document.getElementById('clientAddress').value = client.address || '';
      document.getElementById('clientModalTitle').textContent = 'Edit Client';
      openModal('clientModal');
    }
  } catch (err) {
    console.error('Error editing client:', err);
  }
}

async function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  
  try {
    await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
    loadClients();
  } catch (err) {
    alert('Error deleting client');
  }
}

function searchClients() {
  const query = document.getElementById('searchClients').value.toLowerCase();
  const rows = document.querySelectorAll('#clientsTable tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// ============ PRODUCTS ============

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    
    const tbody = document.getElementById('productsTable');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No products yet</td></tr>';
    } else {
      tbody.innerHTML = products.map(product => `
        <tr>
          <td>${product.name}</td>
          <td>${product.description || '-'}</td>
          <td>${formatCurrency(product.price)}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

async function saveProduct(e) {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const data = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: parseFloat(document.getElementById('productPrice').value)
  };
  
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
  
  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    closeModal('productModal');
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    loadProducts();
  } catch (err) {
    alert('Error saving product');
  }
}

async function editProduct(id) {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const product = products.find(p => p._id === id);
    
    if (product) {
      document.getElementById('productId').value = product._id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productDescription').value = product.description || '';
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productModalTitle').textContent = 'Edit Product';
      openModal('productModal');
    }
  } catch (err) {
    console.error('Error editing product:', err);
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  
  try {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    loadProducts();
  } catch (err) {
    alert('Error deleting product');
  }
}

function searchProducts() {
  const query = document.getElementById('searchProducts').value.toLowerCase();
  const rows = document.querySelectorAll('#productsTable tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// ============ INVOICES ============

let allProducts = [];

async function loadClientsForSelect() {
  try {
    const res = await fetch(`${API_URL}/clients`);
    const clients = await res.json();
    
    const select = document.getElementById('invoiceClient');
    select.innerHTML = '<option value="">Select Client</option>' +
      clients.map(c => `<option value="${c._id}" data-name="${c.name}">${c.name}</option>`).join('');
  } catch (err) {
    console.error('Error loading clients:', err);
  }
}

async function loadProductsForSelect() {
  try {
    const res = await fetch(`${API_URL}/products`);
    allProducts = await res.json();
    
    document.querySelectorAll('.item-product').forEach(select => {
      select.innerHTML = '<option value="">Select Product</option>' +
        allProducts.map(p => `<option value="${p._id}" data-price="${p.price}" data-name="${p.name}">${p.name}</option>`).join('');
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

async function loadInvoices() {
  try {
    const res = await fetch(`${API_URL}/invoices`);
    const invoices = await res.json();
    
    const tbody = document.getElementById('invoicesTable');
    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No invoices yet</td></tr>';
    } else {
      tbody.innerHTML = invoices.map(inv => `
        <tr>
          <td>${inv.invoiceNumber}</td>
          <td>${inv.clientName}</td>
          <td>${formatCurrency(inv.total)}</td>
          <td><span class="status status-${inv.status}">${inv.status}</span></td>
          <td>${formatDate(inv.createdAt)}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" onclick="viewInvoice('${inv._id}')">View</button>
            <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${inv._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading invoices:', err);
  }
}

function addItem() {
  const container = document.getElementById('invoiceItems');
  const div = document.createElement('div');
  div.className = 'item-row';
  div.innerHTML = `
    <select class="item-product" onchange="updateItemPrice(this)">
      <option value="">Select Product</option>
      ${allProducts.map(p => `<option value="${p._id}" data-price="${p.price}" data-name="${p.name}">${p.name}</option>`).join('')}
    </select>
    <input type="number" class="item-qty" placeholder="Qty" value="1" min="1" onchange="calcItemTotal(this)">
    <input type="number" class="item-price" placeholder="Price" readonly>
    <input type="number" class="item-total" placeholder="Total" readonly>
    <button type="button" class="remove-item" onclick="removeItem(this)">×</button>
  `;
  container.appendChild(div);
}

function removeItem(btn) {
  const rows = document.querySelectorAll('.item-row');
  if (rows.length > 1) {
    btn.parentElement.remove();
  }
  calcInvoiceTotal();
}

function updateItemPrice(select) {
  const option = select.options[select.selectedIndex];
  const price = option.dataset.price || 0;
  const row = select.closest('.item-row');
  row.querySelector('.item-price').value = price;
  calcItemTotal(select);
}

function calcItemTotal(input) {
  const row = input.closest('.item-row');
  const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
  const price = parseFloat(row.querySelector('.item-price').value) || 0;
  row.querySelector('.item-total').value = (qty * price).toFixed(2);
  calcInvoiceTotal();
}

function calcInvoiceTotal() {
  let subtotal = 0;
  document.querySelectorAll('.item-row').forEach(row => {
    subtotal += parseFloat(row.querySelector('.item-total').value) || 0;
  });
  
  const tax = parseFloat(document.getElementById('invoiceTax').value) || 0;
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;
  
  document.getElementById('invoiceSubtotal').textContent = subtotal.toFixed(2);
  document.getElementById('invoiceTotal').textContent = total.toFixed(2);
}

async function saveInvoice(e) {
  e.preventDefault();
  
  const clientSelect = document.getElementById('invoiceClient');
  const clientOption = clientSelect.options[clientSelect.selectedIndex];
  const clientName = clientOption.dataset.name || clientSelect.options[clientSelect.selectedIndex].text;
  
  const items = [];
  document.querySelectorAll('.item-row').forEach(row => {
    const productSelect = row.querySelector('.item-product');
    const productOption = productSelect.options[productSelect.selectedIndex];
    if (productSelect.value) {
      items.push({
        product: productOption.dataset.name || productSelect.options[productSelect.selectedIndex].text,
        quantity: parseInt(row.querySelector('.item-qty').value) || 1,
        price: parseFloat(row.querySelector('.item-price').value) || 0,
        total: parseFloat(row.querySelector('.item-total').value) || 0
      });
    }
  });
  
  if (items.length === 0) {
    alert('Please add at least one item');
    return;
  }
  
  const subtotal = parseFloat(document.getElementById('invoiceSubtotal').textContent);
  const tax = parseFloat(document.getElementById('invoiceTax').value) || 0;
  const total = parseFloat(document.getElementById('invoiceTotal').textContent);
  
  const data = {
    client: clientSelect.value,
    clientName: clientName,
    items: items,
    subtotal: subtotal,
    tax: tax,
    total: total,
    status: document.getElementById('invoiceStatus').value,
    dueDate: document.getElementById('invoiceDueDate').value || null
  };
  
  const id = document.getElementById('invoiceId').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/invoices/${id}` : `${API_URL}/invoices`;
  
  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    closeModal('invoiceModal');
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
    document.getElementById('invoiceTax').value = 0;
    document.getElementById('invoiceItems').innerHTML = `
      <div class="item-row">
        <select class="item-product" onchange="updateItemPrice(this)">
          <option value="">Select Product</option>
          ${allProducts.map(p => `<option value="${p._id}" data-price="${p.price}" data-name="${p.name}">${p.name}</option>`).join('')}
        </select>
        <input type="number" class="item-qty" placeholder="Qty" value="1" min="1" onchange="calcItemTotal(this)">
        <input type="number" class="item-price" placeholder="Price" readonly>
        <input type="number" class="item-total" placeholder="Total" readonly>
        <button type="button" class="remove-item" onclick="removeItem(this)">×</button>
      </div>
    `;
    calcInvoiceTotal();
    loadInvoices();
  } catch (err) {
    alert('Error saving invoice');
  }
}

async function viewInvoice(id) {
  try {
    const res = await fetch(`${API_URL}/invoices/${id}`);
    const inv = await res.json();
    
    const details = document.getElementById('invoiceDetails');
    details.innerHTML = `
      <p><strong>Invoice #:</strong> ${inv.invoiceNumber}</p>
      <p><strong>Client:</strong> ${inv.clientName}</p>
      <p><strong>Date:</strong> ${formatDate(inv.createdAt)}</p>
      <p><strong>Due Date:</strong> ${formatDate(inv.dueDate)}</p>
      <p><strong>Status:</strong> <span class="status status-${inv.status}">${inv.status}</span></p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr>
              <td>${item.product}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="invoice-totals">
        <div>Subtotal: ${formatCurrency(inv.subtotal)}</div>
        <div>Tax: ${inv.tax}%</div>
        <div class="total">Total: ${formatCurrency(inv.total)}</div>
      </div>
    `;
    
    openModal('viewInvoiceModal');
  } catch (err) {
    console.error('Error viewing invoice:', err);
  }
}

async function deleteInvoice(id) {
  if (!confirm('Delete this invoice?')) return;
  
  try {
    await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
    loadInvoices();
  } catch (err) {
    alert('Error deleting invoice');
  }
}

function searchInvoices() {
  const query = document.getElementById('searchInvoices').value.toLowerCase();
  const rows = document.querySelectorAll('#invoicesTable tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}
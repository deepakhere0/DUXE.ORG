// src/components/common/Toast.js
let toastContainer = null;

// Create toast container if it doesn't exist
const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Show toast notification
export const showToast = (message, type = 'info', duration = 3000) => {
  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    min-width: 300px;
    max-width: 500px;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    transition: all 0.3s ease;
  `;

  // Set colors based on type
  const colors = {
    success: { bg: '#10b981', text: '#ffffff', icon: '✓' },
    error: { bg: '#ef4444', text: '#ffffff', icon: '✕' },
    warning: { bg: '#f59e0b', text: '#ffffff', icon: '⚠' },
    info: { bg: '#3b82f6', text: '#ffffff', icon: 'ℹ' }
  };

  const color = colors[type] || colors.info;
  toast.style.backgroundColor = color.bg;
  toast.style.color = color.text;

  // Add icon and message
  toast.innerHTML = `
    <span style="font-size: 18px; flex-shrink: 0;">${color.icon}</span>
    <span style="flex: 1;">${message}</span>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  if (!document.querySelector('#toast-animations')) {
    style.id = 'toast-animations';
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);

  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  });
};

// Export as default as well for compatibility
export default { showToast };
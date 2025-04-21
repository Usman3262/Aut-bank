export const formatCnic = (cnic) => {
    const digits = cnic.replace(/\D/g, '');
    if (digits.length !== 13) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };
  
  export const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  export const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };
  
  export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
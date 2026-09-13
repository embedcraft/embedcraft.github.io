/* localStorage-backed cart. Cart holds {productId, qty} pairs only —
   product details are always looked up fresh from window.PRODUCTS so
   catalog edits are reflected immediately. */
(function(){
  "use strict";
  var KEY = 'de-cart';

  function read(){
    try{
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function write(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('cart:change', { detail: { items: items } }));
  }

  function lines(){
    var items = read();
    return items.map(function(it){
      var product = window.getProduct(it.productId);
      return product ? { product: product, qty: it.qty } : null;
    }).filter(Boolean);
  }

  function add(productId, qty){
    qty = qty || 1;
    var items = read();
    var existing = items.find(function(it){ return it.productId === productId; });
    if(existing){ existing.qty += qty; }
    else{ items.push({ productId: productId, qty: qty }); }
    write(items);
  }

  function setQty(productId, qty){
    var items = read();
    if(qty <= 0){
      items = items.filter(function(it){ return it.productId !== productId; });
    } else {
      var existing = items.find(function(it){ return it.productId === productId; });
      if(existing) existing.qty = qty;
    }
    write(items);
  }

  function remove(productId){
    write(read().filter(function(it){ return it.productId !== productId; }));
  }

  function clear(){ write([]); }

  function count(){
    return read().reduce(function(sum, it){ return sum + it.qty; }, 0);
  }

  function subtotal(){
    return lines().reduce(function(sum, l){ return sum + l.product.price * l.qty; }, 0);
  }

  function hasPhysicalItem(){
    return lines().some(function(l){ return l.product.physical; });
  }

  window.Cart = {
    lines: lines,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    count: count,
    subtotal: subtotal,
    hasPhysicalItem: hasPhysicalItem
  };

  function formatINR(amount){
    return '₹' + amount.toLocaleString('en-IN');
  }
  window.formatINR = formatINR;

  function updateBadges(){
    var n = count();
    document.querySelectorAll('.cart-badge').forEach(function(el){
      el.textContent = n > 0 ? String(n) : '';
      el.setAttribute('data-count', String(n));
    });
  }
  document.addEventListener('cart:change', updateBadges);
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', updateBadges);
  } else {
    updateBadges();
  }
})();

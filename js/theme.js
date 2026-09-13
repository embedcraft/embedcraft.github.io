(function(){
  "use strict";
  var KEY = 'de-theme';

  function apply(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function current(){
    var saved = localStorage.getItem(KEY);
    if(saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  apply(current());

  function wireToggle(){
    var btn = document.getElementById('themeToggle');
    if(!btn) return;
    function sync(){
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.textContent = isDark ? '☀️' : '🌙';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    sync();
    btn.addEventListener('click', function(){
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(KEY, next);
      sync();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireToggle);
  } else {
    wireToggle();
  }
})();

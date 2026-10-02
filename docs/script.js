(() => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-mobile-menu]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = new Date().getFullYear();

  if (button && menu) {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        button.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      });
    });
  }
})();
(() => {
  'use strict';

  const TEMPO_MINIMO = 1500;
  const TEMPO_FADE = 500;

  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');

  loader.innerHTML = `
    <img src="fotos/loading.gif" alt="" width="620" height="620">
  `;

  document.body.appendChild(loader);

  let inicio;
  let espera;
  let finalizacao;
  let limite;
  let navegando = false;

  function mostrar() {
    clearTimeout(espera);
    clearTimeout(finalizacao);
    clearTimeout(limite);

    inicio = performance.now();
    loader.hidden = false;
    loader.classList.remove('page-loader--saindo');

    // Evita bloquear a tela por um recurso que não termina de carregar.
    limite = setTimeout(ocultar, 8000);
  }

  function ocultar() {
    clearTimeout(limite);
    clearTimeout(espera);

    const restante = Math.max(
      0,
      TEMPO_MINIMO - (performance.now() - inicio)
    );

    espera = setTimeout(() => {
      loader.classList.add('page-loader--saindo');

      clearTimeout(finalizacao);
      finalizacao = setTimeout(() => {
        loader.hidden = true;
        navegando = false;
      }, TEMPO_FADE);
    }, restante);
  }

  mostrar();

  if (document.readyState === 'complete') {
    ocultar();
  } else {
    window.addEventListener('load', () => {
      if (!navegando) ocultar();
    }, { once: true });
  }

  // Restaura a tela ao usar Voltar ou Avançar.
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      navegando = false;
      mostrar();
      ocultar();
    }
  });

  document.addEventListener('click', event => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const link = event.target.closest('a[href]');

    if (
      !link ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self')
    ) return;

    const url = new URL(link.href, location.href);

    if (
      url.origin !== location.origin ||
      !['http:', 'https:', 'file:'].includes(url.protocol) ||
      !/\.html?$/i.test(url.pathname)
    ) return;

    if (
      url.pathname === location.pathname &&
      url.search === location.search
    ) return;

    event.preventDefault();
    if (navegando) return;

    navegando = true;
    mostrar();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        location.assign(url.href);
      });
    });
  });
})();





(function () {
  'use strict';
  var root = document.documentElement;

  // Mode clair / sombre : suit le téléphone par défaut, puis retient le choix du visiteur
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mc-theme', next); } catch (e) {}
    });
  }

  // Menu mobile
  var header = document.getElementById('site-header');
  var menuBtn = document.querySelector('[data-menu]');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Galerie produit
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var main = document.getElementById('gallery-main');
    gallery.querySelectorAll('.thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!main) return;
        main.src = btn.getAttribute('data-src');
        main.alt = btn.getAttribute('data-alt') || '';
        gallery.querySelectorAll('.thumb').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
      });
    });
  }

  // Évite le double envoi des formulaires de commande et de devis
  document.querySelectorAll('form[data-once]').forEach(function (form) {
    form.addEventListener('submit', function () {
      var b = form.querySelector('button[type=submit]');
      if (b) { b.disabled = true; b.style.opacity = '.6'; }
    });
  });

  // Carrousel d'images du bandeau d'accueil (actif seulement s'il y a au moins 2 images)
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = [].slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = [].slice.call(carousel.querySelectorAll('.hero-dots button'));
    if (slides.length > 1) {
      var delay = parseInt(carousel.getAttribute('data-interval'), 10) || 6000;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var index = 0, timer = null, startX = null;

      var show = function (n) {
        index = (n + slides.length) % slides.length;
        slides.forEach(function (img, k) { img.classList.toggle('is-on', k === index); });
        dots.forEach(function (d, k) {
          if (k === index) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
        });
      };
      var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
      var play = function () {
        if (reduce || timer || document.hidden) return;
        timer = setInterval(function () { show(index + 1); }, delay);
      };
      var restart = function () { stop(); play(); };

      dots.forEach(function (d, k) {
        d.addEventListener('click', function () { show(k); restart(); });
      });

      // Glissement du doigt sur mobile
      carousel.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
      carousel.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); restart(); }
      }, { passive: true });

      // Pause quand la page est cachée ou quand on navigue aux points au clavier
      document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { play(); } });
      carousel.addEventListener('focusin', stop);
      carousel.addEventListener('focusout', play);

      play();
    }
  }

  // Ajout rapide au panier depuis les cartes produit (sans quitter la page)
  var toast = null, toastTimer = null;
  var say = function (text, isErr, withLink) {
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.className = 'toast' + (isErr ? ' err' : '');
    toast.textContent = text + ' ';
    if (withLink) {
      var a = document.createElement('a');
      a.href = withLink.href; a.textContent = withLink.label;
      toast.appendChild(a);
    }
    void toast.offsetWidth;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 3200);
  };
  var updateBadge = function (count) {
    var btn = document.querySelector('.cart-btn');
    if (!btn) return;
    var badge = btn.querySelector('.badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; btn.appendChild(badge); }
    badge.textContent = count;
    btn.setAttribute('aria-label', 'Panier, ' + count + ' article(s)');
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
  };
  document.querySelectorAll('form[data-quick-add]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.fetch || !window.FormData) return; // repli : envoi classique
      e.preventDefault();
      if (form.classList.contains('busy')) return;
      form.classList.add('busy');
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form),
        credentials: 'same-origin'
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
      }).then(function (r) {
        form.classList.remove('busy');
        if (r.ok) {
          updateBadge(r.data.count);
          form.classList.add('done');
          setTimeout(function () { form.classList.remove('done'); }, 1600);
          var cartLink = document.querySelector('.cart-btn');
          say('Ajouté au panier.', false, { href: cartLink ? cartLink.getAttribute('href') : '/panier', label: 'Voir le panier' });
        } else if (r.status === 422) {
          say((r.data && r.data.message) || 'Impossible d’ajouter ce produit.', true);
        } else {
          form.submit();
        }
      }).catch(function () {
        form.classList.remove('busy');
        form.submit();
      });
    });
  });

  // Copier le lien de suivi
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'Lien copié ✓';
        setTimeout(function () { btn.textContent = old; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copiez ce lien :', text); });
      } else {
        window.prompt('Copiez ce lien :', text);
      }
    });
  });

  // Demande de devis : fenêtre « Continuer sur WhatsApp » après quelques secondes, puis redirection
  var waModal = document.getElementById('wa-modal');
  if (waModal) {
    var waKey = waModal.getAttribute('data-key');
    var mark = function () { try { sessionStorage.setItem(waKey, '1'); } catch (e) {} };
    var seen = false;
    try { seen = sessionStorage.getItem(waKey) === '1'; } catch (e) {}
    document.querySelectorAll('[data-wa-link]').forEach(function (a) { a.addEventListener('click', mark); });

    if (!seen) {
      var waDelay = (parseInt(waModal.getAttribute('data-delay'), 10) || 12) * 1000;
      var waLeft = parseInt(waModal.getAttribute('data-countdown'), 10) || 5;
      var waTick = null;
      var counter = waModal.querySelector('[data-wa-count] span');
      var onKey = function (e) { if (e.key === 'Escape') closeWa(); };
      var closeWa = function () {
        clearInterval(waTick);
        waModal.hidden = true;
        mark();
        document.removeEventListener('keydown', onKey);
      };
      waModal.querySelector('[data-wa-later]').addEventListener('click', closeWa);

      setTimeout(function () {
        if (document.hidden) return; // la personne est déjà ailleurs (WhatsApp ouvert, autre onglet…)
        waModal.hidden = false;
        var first = waModal.querySelector('.btn');
        if (first) first.focus();
        document.addEventListener('keydown', onKey);
        counter.textContent = waLeft;
        waTick = setInterval(function () {
          waLeft -= 1;
          counter.textContent = Math.max(waLeft, 0);
          if (waLeft <= 0) {
            clearInterval(waTick);
            mark();
            window.location.href = waModal.getAttribute('data-url');
          }
        }, 1000);
      }, waDelay);
    }
  }
})();

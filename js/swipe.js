/* GIDIGBA STUDIOS — side swipe
   Rows of cards become a strip you drag sideways.
   - adds the rail class and the right column count
   - arrow keys on desktop, dots on the phone
   - a card never gets cut in half at the end of the row */

(function () {
  var RAILS = [
    { sel: '.price-grid',    cols: 'four-up'  },
    { sel: '.ba-rail',       cols: 'two-up'   },
    { sel: '.cat-grid',      cols: 'three-up' },
    { sel: '.smp-grid',      cols: 'four-up'  },
    { sel: '.needs-grid',    cols: 'four-up'  },
    { sel: '.reviews-grid',  cols: 'three-up' },
    { sel: '.journal-grid',  cols: 'three-up' },
    { sel: '.work-grid',     cols: 'four-up'  },
    { sel: '.brands-grid',   cols: 'many-up'  }
  ];

  function build(rail, spec) {
    if (rail.dataset.swipeReady) return;
    rail.dataset.swipeReady = '1';

    rail.classList.add('swipe-rail', spec.cols);
    rail.setAttribute('tabindex', '0');
    rail.setAttribute('role', 'group');
    rail.setAttribute('aria-label', 'Scrollable row — drag sideways or use the arrow keys');

    var items = Array.prototype.slice.call(rail.children);
    var shell = document.createElement('div');
    shell.className = 'swipe-shell';
    rail.parentNode.insertBefore(shell, rail);
    shell.appendChild(rail);

    // dots, one per card, only useful on a phone but always built
    var dots = document.createElement('div');
    dots.className = 'swipe-dots';
    dots.setAttribute('aria-hidden', 'true');
    items.forEach(function (item, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.addEventListener('click', function () { goTo(rail, items, i); });
      dots.appendChild(b);
    });
    shell.appendChild(dots);

    var hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.innerHTML = '<span>Swipe for more</span><span class="sh-line"></span>';
    shell.appendChild(hint);

    function nearest() {
      var mid = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestD = Infinity;
      items.forEach(function (item, i) {
        var c = item.offsetLeft + item.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    function paint() {
      var scrollable = rail.scrollWidth > rail.clientWidth + 4;
      var active = nearest();
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('on', i === active);
      });
      // when the whole row fits, nothing is dimmed — dimming only marks the
      // cards that are waiting off the edge
      items.forEach(function (item) {
        if (!scrollable) { item.classList.remove('is-off'); return; }
        var left = item.offsetLeft, right = left + item.offsetWidth;
        var visible = right > rail.scrollLeft + 8 && left < rail.scrollLeft + rail.clientWidth - 8;
        var fully = left >= rail.scrollLeft - 1 && right <= rail.scrollLeft + rail.clientWidth + 1;
        item.classList.toggle('is-off', !visible || (!fully && item.offsetWidth > rail.clientWidth * 0.7));
      });
      // the last card must be fully reachable
      var max = rail.scrollWidth - rail.clientWidth;
      if (rail.scrollLeft > max + 1) rail.scrollLeft = max;
    }

    rail.addEventListener('scroll', function () {
      window.clearTimeout(rail._t);
      rail._t = window.setTimeout(paint, 90);
    }, { passive: true });

    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(rail, items, Math.min(items.length - 1, nearest() + 1)); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(rail, items, Math.max(0, nearest() - 1)); }
      if (e.key === 'Home')       { e.preventDefault(); goTo(rail, items, 0); }
      if (e.key === 'End')        { e.preventDefault(); goTo(rail, items, items.length - 1); }
    });

    window.addEventListener('resize', function () {
      window.clearTimeout(rail._r);
      rail._r = window.setTimeout(paint, 120);
    });

    // a mouse cannot drag a scroll container, so give it shift-wheel and
    // click-drag on desktop
    var down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (e.target.closest('a, button')) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener('mouseup', function () {
      if (!down) return;
      down = false; rail.style.cursor = '';
      if (moved) {
        // a drag must not also count as a click on the card
        var block = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        rail.addEventListener('click', block, { capture: true, once: true });
        window.setTimeout(function () { rail.removeEventListener('click', block, true); }, 0);
      }
    });

    setTimeout(paint, 60);
  }

  function goTo(rail, items, i) {
    var item = items[i];
    if (!item) return;
    var left = item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

  function init() {
    RAILS.forEach(function (spec) {
      document.querySelectorAll(spec.sel).forEach(function (rail) {
        // a one-card row has nothing to swipe
        if (rail.children.length < 2) return;
        build(rail, spec);
      });
    });
    // the booking wardrobe grid stays a wrap-grid: 100 tiny thumbnails
    // scroll vertically inside the step, sideways would be unusable
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

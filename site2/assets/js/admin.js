/* ===============================
   Stable Grid Drag & Drop
   =============================== */

let dragged = null;
let placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';

let lastTarget = null;
const DEAD_ZONE = 8; // px

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('brandsGrid');
  if (!grid) return;

  document.querySelectorAll('.brand-card').forEach(card => {
    const handle = card.querySelector('.drag-handle');
    if (!handle) return;

    handle.draggable = true;

    handle.addEventListener('dragstart', e => {
      dragged = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';

      setTimeout(() => {
        card.style.display = 'none';
      }, 0);
    });

    handle.addEventListener('dragend', () => {
      if (!dragged) return;

      card.style.display = '';
      card.classList.remove('dragging');
      placeholder.remove();
      dragged = null;
      lastTarget = null;

      saveOrder();
    });
  });

  grid.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragged) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = el?.closest('.brand-card');

    if (!target || target === dragged) return;

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const delta = e.clientY - midY;

    // dead zone → μην αλλάζεις απόφαση
    if (Math.abs(delta) < DEAD_ZONE) return;

    const position = delta < 0 ? 'before' : 'after';

    // αν είναι ίδια απόφαση με πριν → μην κάνεις τίποτα
    if (lastTarget === target && placeholder.dataset.pos === position) {
      return;
    }

    placeholder.dataset.pos = position;
    lastTarget = target;

    if (position === 'before') {
      grid.insertBefore(placeholder, target);
    } else {
      grid.insertBefore(placeholder, target.nextSibling);
    }
  });

  grid.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragged) return;

    placeholder.replaceWith(dragged);
  });
});

/* ===============================
   Save Order
   =============================== */

function saveOrder() {
  const ids = [...document.querySelectorAll('.brand-card')]
    .map(c => c.dataset.id);

  fetch('brands_reorder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: ids })
  })
    .then(r => r.json())
    .then(res => {
      if (!res.success) {
        console.error('Reorder failed', res);
        alert('Δεν αποθηκεύτηκε η σειρά');
      }
    })
    .catch(err => console.error(err));
}

/* ===============================
   BONUS "UP TO" + IMAGE UPLOAD LOGIC
   =============================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- BONUS UP TO ---------- */

    document.querySelectorAll('.bonus-row').forEach(row => {
        const numberInput = row.querySelector('input[type="number"]');
        const checkbox = row.querySelector('input[type="checkbox"]');

        if (!numberInput || !checkbox) return;

        const syncState = () => {
            const hasValue = numberInput.value !== '';

            checkbox.disabled = !hasValue;

            if (!hasValue) {
                checkbox.checked = false;
            }
        };

        syncState();
        numberInput.addEventListener('input', syncState);
    });

    /* ---------- IMAGE UPLOAD CARDS ---------- */

    document.querySelectorAll('.upload-card').forEach(card => {
        const inputId = card.dataset.input;
        const input = document.getElementById(inputId);
        const preview = card.querySelector('.upload-preview');

        if (!input) return;

        // open file dialog
        card.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            input.click();
        });

        // file selected
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                card.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        });

        // drag & drop
        card.addEventListener('dragover', e => {
            e.preventDefault();
            card.style.borderColor = '#f5a524';
        });

        card.addEventListener('dragleave', () => {
            card.style.borderColor = '';
        });

        card.addEventListener('drop', e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        });

        // initial state (edit brand)
        if (preview.src && preview.src !== window.location.href) {
            card.classList.add('has-image');
        }
    });

});

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".info-trigger").forEach(trigger => {

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();

            const box = trigger.closest(".field").querySelector(".info-box");

            document.querySelectorAll(".info-box").forEach(b => {
                if (b !== box) b.classList.remove("active");
            });

            box.classList.toggle("active");
        });

    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".info-box").forEach(b => {
            b.classList.remove("active");
        });
    });

});
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 800,
    once: true,
    offset: 80,
  });
}

const mainNav = document.getElementById('mainNav');
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (mainNav) {
    if (window.scrollY > 50) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  }

  if (scrollTopBtn) {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  }
});

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function animateCounter(el, target, duration) {
  let start = 0;
  const suffix = el.dataset.suffix || '';
  const stepTime = Math.max(Math.floor(duration / target), 10);
  const increment = Math.ceil(target / (duration / stepTime));

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = start.toLocaleString('id-ID') + suffix;
  }, stepTime);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.counter, 10);
      if (!isNaN(target)) {
        animateCounter(el, target, 1500);
        counterObserver.unobserve(el);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

const LS_KEY = 'reservasiLinow';

function simpanReservasi(data) {
  const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  list.unshift(data);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function hapusReservasi(index) {
  if (confirm('Apakah Anda yakin ingin menghapus data reservasi ini?')) {
    const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    list.splice(index, 1);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    tampilkanReservasi();
  }
}
window.hapusReservasi = hapusReservasi;

function hapusSemuaReservasi() {
  if (confirm('Yakin ingin mengosongkan semua data reservasi di sistem?')) {
    localStorage.removeItem(LS_KEY);
    tampilkanReservasi();
  }
}
window.hapusSemuaReservasi = hapusSemuaReservasi;

function tampilkanReservasi() {
  const tbody = document.getElementById('tabelBody');
  if (!tbody) return;

  const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-3">Belum ada reservasi tersimpan.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="badge bg-light text-dark border">${escapeHtml(r.kode || '-')}</span></td>
      <td><strong>${escapeHtml(r.nama)}</strong><br><small class="text-muted">${escapeHtml(r.email)}</small></td>
      <td>${escapeHtml(r.telepon || '-')}</td>
      <td>${escapeHtml(r.tanggal)}</td>
      <td>${escapeHtml(String(r.jumlah))} org</td>
      <td>${labelPaket(r.paket)}</td>
      <td>${escapeHtml(r.waktu)}</td>
      <td><strong style="color:#2E8B75;">${r.totalBiaya}</strong></td>
      <td>
        <button class="btn btn-outline-danger btn-sm" onclick="hapusReservasi(${i})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function labelPaket(paket) {
  const labels = {
    reguler: 'Tiket Reguler',
    tur: 'Edukasi & Geothermal',
    camping: 'Camping Linow',
    gathering: 'Gathering / Rombongan',
  };
  return labels[paket] || paket;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const hargaPaket = {
  reguler: 20000,
  tur: 50000,
  camping: 150000,
  gathering: 0,
};

function hitungTotal() {
  const jumlahEl = document.getElementById('jumlahOrang');
  const paketEl = document.getElementById('paketWisata');
  const totalEl = document.getElementById('totalBiaya');
  if (!jumlahEl || !paketEl || !totalEl) return;

  const jumlah = parseInt(jumlahEl.value, 10) || 1;
  const paket = paketEl.value;
  const harga = hargaPaket[paket] ?? 0;

  if (paket === 'gathering') {
    totalEl.textContent = 'Estimasi: Hubungi pengelola untuk harga rombongan.';
    totalEl.classList.remove('d-none');
    return;
  }

  const total = jumlah * harga;
  totalEl.textContent = `Total Biaya: Rp ${total.toLocaleString('id-ID')}`;
  totalEl.classList.remove('d-none');
}

const jumlahOrangEl = document.getElementById('jumlahOrang');
const paketWisataEl = document.getElementById('paketWisata');
if (jumlahOrangEl) jumlahOrangEl.addEventListener('input', hitungTotal);
if (paketWisataEl) paketWisataEl.addEventListener('change', hitungTotal);
hitungTotal();

function submitReservasi(event) {
  event.preventDefault();
  const form = document.getElementById('formReservasi');
  if (!form) return;

  const nama    = document.getElementById('nama')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const telepon = document.getElementById('telepon')?.value.trim();
  const tanggal = document.getElementById('tanggal')?.value;
  const jumlah  = document.getElementById('jumlahOrang')?.value;
  const paket   = document.getElementById('paketWisata')?.value;
  const waktu   = form.querySelector('input[name="waktu"]:checked')?.value || '-';
  const catatan = document.getElementById('catatan')?.value.trim() || '';

  if (!nama || !email || !telepon || !tanggal || !jumlah || !paket) {
    alert('Mohon lengkapi semua data wajib.');
    return;
  }

  const jml = parseInt(jumlah, 10);
  const harga = hargaPaket[paket] ?? 0;
  const total = paket === 'gathering' ? 'Paket Rombongan' : `Rp ${(jml * harga).toLocaleString('id-ID')}`;
  const kodeBooking = 'LNW-' + Math.floor(1000 + Math.random() * 9000);

  const data = {
    kode: kodeBooking,
    nama, email, telepon, tanggal,
    jumlah: jml, paket, waktu, catatan,
    totalBiaya: total,
    createdAt: new Date().toLocaleString('id-ID'),
  };

  simpanReservasi(data);
  tampilkanReservasi();

  const tiketKode = document.getElementById('tiketKode');
  const tiketNama = document.getElementById('tiketNama');
  const tiketTanggal = document.getElementById('tiketTanggal');
  const tiketPaket = document.getElementById('tiketPaket');
  const tiketJumlah = document.getElementById('tiketJumlah');
  const tiketTotal = document.getElementById('tiketTotal');
  const buktiReservasi = document.getElementById('buktiReservasi');

  if (tiketKode) tiketKode.textContent = kodeBooking;
  if (tiketNama) tiketNama.textContent = nama;
  if (tiketTanggal) tiketTanggal.textContent = tanggal;
  if (tiketPaket) tiketPaket.textContent = labelPaket(paket);
  if (tiketJumlah) tiketJumlah.textContent = jml + ' Orang';
  if (tiketTotal) tiketTotal.textContent = total;

  if (form) form.classList.add('d-none');
  if (buktiReservasi) {
    buktiReservasi.classList.remove('d-none');
    buktiReservasi.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const toastEl = document.getElementById('toastReservasi');
  if (toastEl && window.bootstrap?.Toast) {
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
  }
}

function buatReservasiBaru() {
  const form = document.getElementById('formReservasi');
  const buktiReservasi = document.getElementById('buktiReservasi');
  if (form) {
    form.reset();
    form.classList.remove('d-none');
    hitungTotal();
  }
  if (buktiReservasi) {
    buktiReservasi.classList.add('d-none');
  }
}
window.buatReservasiBaru = buatReservasiBaru;

const formReservasi = document.getElementById('formReservasi');
if (formReservasi) {
  formReservasi.addEventListener('submit', submitReservasi);
}

tampilkanReservasi();

const modalAdminEl = document.getElementById('modalAdmin');
if (modalAdminEl) {
  modalAdminEl.addEventListener('show.bs.modal', tampilkanReservasi);
}


let activeGalleryItems = [];
let currentPhotoIndex = 0;

function updateActiveGalleryItems() {
  activeGalleryItems = Array.from(document.querySelectorAll('.bento-item')).filter(
    item => window.getComputedStyle(item).display !== 'none'
  );
}

const filterBtns = document.querySelectorAll('.gallery-filter-btn');
const bentoItems = document.querySelectorAll('.bento-item');

if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      bentoItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
        }
      });
      updateActiveGalleryItems();
    });
  });
  updateActiveGalleryItems();
}

function showModalPhoto(index) {
  if (!activeGalleryItems.length) updateActiveGalleryItems();
  if (index < 0) index = activeGalleryItems.length - 1;
  if (index >= activeGalleryItems.length) index = 0;
  currentPhotoIndex = index;

  const target = activeGalleryItems[currentPhotoIndex];
  if (!target) return;

  const img = target.querySelector('img');
  const modalSrc = document.getElementById('imgModalSrc');
  const modalCaption = document.getElementById('imgModalCaption');
  const modalBadge = document.getElementById('imgModalBadge');
  const modalDesc = document.getElementById('imgModalDesc');
  const modalIndex = document.getElementById('imgModalIndex');

  if (modalSrc && img) {
    modalSrc.src = img.src;
    modalSrc.alt = target.dataset.title || img.alt;
  }
  if (modalCaption) modalCaption.textContent = target.dataset.title || img?.alt || 'Foto Danau Linow';
  if (modalBadge) modalBadge.textContent = target.dataset.badge || 'Koleksi';
  if (modalDesc) modalDesc.textContent = target.dataset.desc || '';
  if (modalIndex) modalIndex.textContent = (currentPhotoIndex + 1) + ' / ' + activeGalleryItems.length;
}

bentoItems.forEach(item => {
  item.addEventListener('click', () => {
    updateActiveGalleryItems();
    const idx = activeGalleryItems.indexOf(item);
    showModalPhoto(idx !== -1 ? idx : 0);

    const modalEl = document.getElementById('imgModal');
    if (modalEl && window.bootstrap?.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  });
});

const prevBtn = document.getElementById('modalPrevBtn');
const nextBtn = document.getElementById('modalNextBtn');

if (prevBtn) {
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showModalPhoto(currentPhotoIndex - 1);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showModalPhoto(currentPhotoIndex + 1);
  });
}

document.addEventListener('keydown', (e) => {
  const modalEl = document.getElementById('imgModal');
  if (modalEl && modalEl.classList.contains('show')) {
    if (e.key === 'ArrowLeft') showModalPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showModalPhoto(currentPhotoIndex + 1);
  }
});

document.querySelectorAll('.galeri-item img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    const modalSrc = document.getElementById('imgModalSrc');
    const modalCaption = document.getElementById('imgModalCaption');
    if (modalSrc) modalSrc.src = img.src;
    if (modalCaption) modalCaption.textContent = img.alt;
    const modalEl = document.getElementById('imgModal');
    if (modalEl && window.bootstrap?.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  });
});


const fenomenaData = {
  hijau: {
    title: 'Hijau Zamrud yang Menyejukkan',
    tag: 'Pagi Hari · 08.00 - 10.30 WITA',
    img: 'images/Danau Hijau Zambrut.webp',
    badge: 'Hijau Zamrud',
    badgeClass: 'simulator-badge bg-success text-white',
    desc: 'Saat matahari terbit dengan sudut rendah, berkas sinar berinteraksi dengan alga mikroskopis dan endapan belerang terlarut. Permukaan kawah memancarkan warna hijau zamrud jernih yang tenang, sering diiringi embusan uap belerang hangat.',
    waktu: '08.00 – 10.30 WITA',
    cahaya: 'Sudut Rendah (Pagi)',
    reaksi: 'Alga + Belerang Terlarut',
    tips: 'Angle rendah dekat dermaga kayu'
  },
  biru: {
    title: 'Biru Toska yang Memukau',
    tag: 'Siang Hari · 11.00 - 14.30 WITA',
    img: 'images/Danau Toska.webp',
    badge: 'Biru Toska',
    badgeClass: 'simulator-badge bg-primary text-white',
    desc: 'Di tengah hari yang cerah saat matahari berada tegak lurus di atas kawah, air danau merefleksikan birunya langit Sulawesi Utara berpadu partikel belerang tersuspensi, menghasilkan gradasi biru toska spektakuler yang sangat jernih.',
    waktu: '11.00 – 14.30 WITA',
    cahaya: 'Terik Vertikal (Maksimal)',
    reaksi: 'Refleksi Langit + Dispersi Cahaya',
    tips: 'Waktu terbaik foto panorama lanskap'
  },
  kuning: {
    title: 'Kuning Keemasan yang Magis & Langka',
    tag: 'Sore / Geotermal Aktif',
    img: 'images/Danau Kuning emas.webp',
    badge: 'Kuning Keemasan',
    badgeClass: 'simulator-badge bg-warning text-dark',
    desc: 'Fenomena paling langka terjadi saat konsentrasi belerang dari ventilasi dasar danau sedang sangat tinggi. Lapisan sulfur pekat menyinari permukaan air hingga berwarna kuning keemasan berkilauan laksana danau emas purba.',
    waktu: 'Sore / Fluktuatif',
    cahaya: 'Cahaya Hangat Golden Hour',
    reaksi: 'Konsentrasi Sulfur Murni Tinggi',
    tips: 'Gunakan lensa tele / zoom untuk detail uap'
  }
};

const simBtns = document.querySelectorAll('.simulator-btn');
if (simBtns.length > 0) {
  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      simBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const color = btn.dataset.color;
      const data = fenomenaData[color];
      if (!data) return;

      const img = document.getElementById('simImg');
      const badge = document.getElementById('simBadge');
      const tag = document.getElementById('simTag');
      const title = document.getElementById('simTitle');
      const desc = document.getElementById('simDesc');
      const waktu = document.getElementById('simWaktu');
      const cahaya = document.getElementById('simCahaya');
      const reaksi = document.getElementById('simReaksi');
      const tips = document.getElementById('simTips');

      if (img) {
        img.style.opacity = '0';
        setTimeout(() => {
          img.src = data.img;
          img.alt = data.title;
          img.style.opacity = '1';
        }, 200);
      }

      if (badge) {
        badge.className = data.badgeClass;
        badge.textContent = data.badge;
      }
      if (tag) tag.textContent = data.tag;
      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.desc;
      if (waktu) waktu.textContent = data.waktu;
      if (cahaya) cahaya.textContent = data.cahaya;
      if (reaksi) reaksi.textContent = data.reaksi;
      if (tips) tips.textContent = data.tips;
    });
  });
}


function pilihPaketForm(paketVal) {
  const paketEl = document.getElementById('paketWisata');
  if (paketEl) {
    paketEl.value = paketVal;
    hitungTotal();
  }
  const formSection = document.getElementById('reservasi');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.pilihPaketForm = pilihPaketForm;

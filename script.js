// script.js - Logika interaktivitas BookSpace

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi elemen DOM yang sudah ada
  const categoryButtons = document.querySelectorAll('.category-btn');
  let bookCards = document.querySelectorAll('.book-card');
  const booksGrid = document.querySelector('.books-grid');
  const searchInput = document.getElementById('search-input');
  const searchForm = document.querySelector('.search-form');
  const sortSelect = document.getElementById('sort-select');

  let activeCategory = 'Semua';

  // --- Fitur Tema (Dark/Light Mode) ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function initTheme() {
    const savedTheme = localStorage.getItem('bookspace_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bookspace_theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    showToast(`Tema ${newTheme === 'dark' ? 'Gelap' : 'Terang'} aktif`, 'success');
  });
  // --- Akhir Fitur Tema ---

  // --- Fitur Toast Notification ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }
  // --- Akhir Fitur Toast ---

  // --- Fitur Penyimpanan Buku (localStorage) ---
  const BOOKS_STORAGE_KEY = 'bookspace_books';
  
  function getStoredBooks() {
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Gagal memuat data buku dari localStorage:', e);
      return [];
    }
  }

  function saveBooksToStorage(books) {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Gagal menyimpan data buku ke localStorage:', e);
    }
  }

  function createBookCard(book) {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.setAttribute('data-id', book.id);
    
    article.innerHTML = `
      <div class="book-cover">
        <img src="${book.cover}" alt="Sampul buku ${book.title}" loading="lazy">
        <span class="badge badge-category">${book.category}</span>
      </div>
      <div class="book-details">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <p class="book-synopsis">${book.synopsis}</p>
        <div class="book-meta">
          <span class="book-rating">⭐ ${parseFloat(book.rating).toFixed(1)} / 5.0</span>
          <span class="book-year">${book.year}</span>
        </div>
      </div>
      <div class="book-actions">
        <button type="button" class="btn btn-sm btn-detail">Lihat Detail</button>
        <button type="button" class="btn btn-sm btn-edit">Edit</button>
        <button type="button" class="btn btn-sm btn-delete">Hapus</button>
        <button type="button" class="btn btn-sm btn-favorite">❤️ Favorit</button>
      </div>
    `;
    
    return article;
  }

  // Muat buku dari storage saat awal
  const customBooks = getStoredBooks();
  customBooks.forEach(book => {
    booksGrid.appendChild(createBookCard(book));
  });

  // Perbarui daftar bookCards setelah memuat data tambahan
  bookCards = document.querySelectorAll('.book-card');

  // --- Akhir Fitur Penyimpanan Buku ---

  // Elemen pesan ramah pengguna jika filter menghasilkan 0 buku
  let emptyMessage = document.getElementById('empty-state-msg');
  if (!emptyMessage && booksGrid) {
    emptyMessage = document.createElement('p');
    emptyMessage.id = 'empty-state-msg';
    emptyMessage.style.gridColumn = '1 / -1';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#64748b';
    emptyMessage.style.padding = '3rem 1rem';
    emptyMessage.style.fontSize = '1rem';
    emptyMessage.style.display = 'none';
    emptyMessage.textContent = 'Tidak ada buku yang ditemukan untuk kriteria ini.';
    booksGrid.appendChild(emptyMessage);
  }

  // --- Fitur Favorit ---
  const STORAGE_KEY = 'bookspace_favorites';
  let favorites = [];

  // Muat data favorit dari localStorage dengan penanganan error
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      favorites = JSON.parse(stored);
      if (!Array.isArray(favorites)) {
        favorites = [];
      }
    }
  } catch (e) {
    console.error('Gagal memuat data favorit dari localStorage:', e);
    favorites = [];
  }

  // Fungsi untuk menyimpan data favorit ke localStorage
  function saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Gagal menyimpan data favorit ke localStorage:', e);
    }
  }

  // Fungsi untuk memperbarui tampilan tombol favorit pada sebuah kartu
  function updateFavoriteUI(card) {
    const bookId = card.getAttribute('data-id');
    const favBtn = card.querySelector('.btn-favorite');
    if (!favBtn || !bookId) return;

    if (favorites.includes(bookId)) {
      favBtn.classList.add('active');
      favBtn.innerHTML = '❤️ Favorit';
    } else {
      favBtn.classList.remove('active');
      favBtn.innerHTML = '🤍 Favorit';
    }
  }

  // Inisialisasi tampilan favorit untuk semua kartu yang ada di DOM saat ini
  bookCards.forEach((card) => {
    updateFavoriteUI(card);
  });

  // Event listener menggunakan delegation pada booksGrid
  if (booksGrid) {
    booksGrid.addEventListener('click', (e) => {
      // Cari apakah yang diklik adalah tombol favorit atau elemen di dalamnya
      const favBtn = e.target.closest('.btn-favorite');
      if (!favBtn) return;

      // Cegah aksi default jika perlu (opsional untuk button type="button")
      e.preventDefault();

      const card = favBtn.closest('.book-card');
      if (!card) return;

      const bookId = card.getAttribute('data-id');
      if (!bookId) return;

      const favIndex = favorites.indexOf(bookId);
      if (favIndex === -1) {
        // Tambahkan ke favorit
        favorites.push(bookId);
      } else {
        // Hapus dari favorit
        favorites.splice(favIndex, 1);
      }

      // Simpan perubahan dan perbarui UI
      saveFavorites();
      updateFavoriteUI(card);
    });
  }
  // --- Akhir Fitur Favorit ---

  // --- Fitur Modal Detail ---
  const modal = document.getElementById('book-detail-modal');
  const modalClose = modal.querySelector('.modal-close');
  const modalOverlay = modal.querySelector('.modal-overlay');

  const modalElements = {
    title: document.getElementById('modal-title'),
    author: document.getElementById('modal-author'),
    category: document.getElementById('modal-category'),
    rating: document.getElementById('modal-rating'),
    year: document.getElementById('modal-year'),
    synopsis: document.getElementById('modal-synopsis'),
    cover: document.getElementById('modal-cover')
  };

  function openModal(card) {
    const data = getCardData(card);
    const coverSrc = card.querySelector('.book-cover img').src;
    const synopsis = card.querySelector('.book-synopsis').textContent.trim();

    // Isi data ke modal
    modalElements.title.textContent = data.title;
    modalElements.author.textContent = data.author;
    modalElements.category.textContent = data.category;
    modalElements.rating.textContent = `⭐ ${data.rating} / 5.0`;
    modalElements.year.textContent = `Tahun: ${data.year}`;
    modalElements.synopsis.textContent = synopsis;
    modalElements.cover.src = coverSrc;
    modalElements.cover.alt = `Sampul buku ${data.title}`;

    // Tampilkan modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Event Delegation untuk tombol detail
  if (booksGrid) {
    booksGrid.addEventListener('click', (e) => {
      const detailBtn = e.target.closest('.btn-detail');
      if (detailBtn) {
        const card = detailBtn.closest('.book-card');
        if (card) openModal(card);
      }
    });
  }

  // Event listeners untuk menutup modal
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  // --- Akhir Fitur Modal Detail ---

  // --- Fitur Tambah Buku ---
  const addBookModal = document.getElementById('add-book-modal');
  const addBookForm = document.getElementById('add-book-form');
  const addModalTitle = document.getElementById('add-modal-title');
  const addSubmitBtn = addBookForm.querySelector('button[type="submit"]');
  const cancelAddBtn = addBookModal.querySelector('.btn-cancel');
  const closeAddModalBtn = addBookModal.querySelector('.modal-close');
  const addModalOverlay = addBookModal.querySelector('.modal-overlay');
  const addBookBtn = document.getElementById('btn-add-book');

  let isEditMode = false;
  let editingBookId = null;

  function openAddModal(editData = null) {
    if (editData) {
      isEditMode = true;
      editingBookId = editData.id;
      addModalTitle.textContent = 'Edit Buku';
      addSubmitBtn.textContent = 'Simpan Perubahan';

      // Isi field form
      document.getElementById('book-title-input').value = editData.title;
      document.getElementById('book-author-input').value = editData.author;
      document.getElementById('book-category-input').value = editData.category;
      document.getElementById('book-year-input').value = editData.year;
      document.getElementById('book-rating-input').value = editData.rating;
      document.getElementById('book-cover-input').value = editData.cover;
      document.getElementById('book-synopsis-input').value = editData.synopsis;
    } else {
      isEditMode = false;
      editingBookId = null;
      addModalTitle.textContent = 'Tambah Buku Baru';
      addSubmitBtn.textContent = 'Simpan Buku';
      addBookForm.reset();
    }

    addBookModal.classList.add('active');
    addBookModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeAddModal() {
    addBookModal.classList.remove('active');
    addBookModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    addBookForm.reset();
    isEditMode = false;
    editingBookId = null;
  }


  addBookBtn.addEventListener('click', () => openAddModal());
  cancelAddBtn.addEventListener('click', closeAddModal);
  closeAddModalBtn.addEventListener('click', closeAddModal);
  addModalOverlay.addEventListener('click', closeAddModal);

  addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookData = {
      title: document.getElementById('book-title-input').value,
      author: document.getElementById('book-author-input').value,
      category: document.getElementById('book-category-input').value,
      year: parseInt(document.getElementById('book-year-input').value),
      rating: parseFloat(document.getElementById('book-rating-input').value),
      cover: document.getElementById('book-cover-input').value,
      synopsis: document.getElementById('book-synopsis-input').value
    };

    if (bookData.rating < 0 || bookData.rating > 5) {
      showToast('Rating harus antara 0 sampai 5', 'error');
      return;
    }

    const currentStored = getStoredBooks();

    if (isEditMode) {
      // MODE EDIT
      const index = currentStored.findIndex(b => b.id === editingBookId);
      if (index === -1) {
        showToast('Data buku tidak ditemukan!', 'error');
        return;
      }

      // Update data di array
      currentStored[index] = { ...bookData, id: editingBookId };
      saveBooksToStorage(currentStored);

      // Perbarui kartu di DOM
      const existingCard = document.querySelector(`.book-card[data-id="${editingBookId}"]`);
      if (existingCard) {
        // Buat kartu baru sementara untuk ambil isinya
        const tempCard = createBookCard(currentStored[index]);
        existingCard.innerHTML = tempCard.innerHTML;
        updateFavoriteUI(existingCard);
      }
      showToast('Buku berhasil diperbarui', 'success');
    } else {
      // MODE TAMBAH
      const newBook = { ...bookData, id: 'book-custom-' + Date.now() };
      currentStored.push(newBook);
      saveBooksToStorage(currentStored);

      const newCard = createBookCard(newBook);
      booksGrid.appendChild(newCard);
      updateFavoriteUI(newCard);
      showToast('Buku baru berhasil ditambah', 'success');
    }
    
    bookCards = document.querySelectorAll('.book-card');
    filterAndSortBooks();
    closeAddModal();
  });

  // Event Delegation untuk tombol detail & edit & delete
  if (booksGrid) {
    booksGrid.addEventListener('click', (e) => {
      // Tombol Detail
      const detailBtn = e.target.closest('.btn-detail');
      if (detailBtn) {
        const card = detailBtn.closest('.book-card');
        if (card) openModal(card);
        return;
      }

      // Tombol Edit
      const editBtn = e.target.closest('.btn-edit');
      if (editBtn) {
        const card = editBtn.closest('.book-card');
        const bookId = card.getAttribute('data-id');
        
        // Hanya bisa edit buku kustom
        if (bookId && bookId.startsWith('book-custom-')) {
          const currentStored = getStoredBooks();
          const bookData = currentStored.find(b => b.id === bookId);
          if (bookData) {
            openAddModal(bookData);
          }
        } else {
          showToast('Buku bawaan tidak dapat diedit', 'error');
        }
        return;
      }

      // Tombol Delete
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const card = deleteBtn.closest('.book-card');
        const bookId = card.getAttribute('data-id');
        
        if (bookId && bookId.startsWith('book-custom-')) {
          openDeleteModal(bookId);
        } else {
          showToast('Buku bawaan tidak dapat dihapus', 'error');
        }
        return;
      }
    });
  }

  // --- Fitur Delete Confirmation ---
  let bookIdToDelete = null;
  const deleteModal = document.getElementById('delete-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  const cancelDeleteBtn = document.getElementById('cancel-delete');

  function openDeleteModal(id) {
    bookIdToDelete = id;
    deleteModal.classList.add('active');
    deleteModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeDeleteModal() {
    bookIdToDelete = null;
    deleteModal.classList.remove('active');
    deleteModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  confirmDeleteBtn.addEventListener('click', () => {
    if (bookIdToDelete) {
      // 1. Hapus dari LocalStorage
      let books = getStoredBooks();
      books = books.filter(b => b.id !== bookIdToDelete);
      saveBooksToStorage(books);

      // 2. Hapus dari DOM
      const card = document.querySelector(`.book-card[data-id="${bookIdToDelete}"]`);
      if (card) card.remove();

      // 3. Cleanup
      closeDeleteModal();
      showToast('Buku berhasil dihapus', 'success');
      
      // 4. Update daftar bookCards
      bookCards = document.querySelectorAll('.book-card');
      filterAndSortBooks();
    }
  });

  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Integrasi Escape untuk semua modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('active')) closeModal();
      if (addBookModal.classList.contains('active')) closeAddModal();
      if (deleteModal.classList.contains('active')) closeDeleteModal();
    }
  });
  // --- Akhir Fitur Delete ---

  // Inisialisasi tema saat load
  initTheme();
  // --- Akhir Fitur Tambah Buku ---

  // Helper untuk mengekstrak data aktual dari elemen kartu buku
  function getCardData(card) {
    const title = card.querySelector('.book-title')?.textContent.trim() || '';
    const author = card.querySelector('.book-author')?.textContent.trim() || '';
    const category = card.querySelector('.badge-category')?.textContent.trim() || '';

    // Ekstrak nilai rating numerik aktual (misal: "⭐ 4.8 / 5.0" -> 4.8)
    const ratingText = card.querySelector('.book-rating')?.textContent || '';
    const ratingMatch = ratingText.match(/[\d.]+/);
    const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;

    // Ekstrak tahun publikasi aktual (misal: "1999" -> 1999) sebagai acuan tanggal
    const yearText = card.querySelector('.book-year')?.textContent || '';
    const yearMatch = yearText.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;

    return { title, author, category, rating, year };
  }

  // Fungsi pemfilteran dan pengurutan koleksi buku secara terpadu
  function filterAndSortBooks() {
    const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const sortOption = sortSelect ? sortSelect.value : 'latest';
    let visibleCount = 0;

    // Salin array elemen tanpa memutasi koleksi asli
    const sortedCards = Array.from(bookCards);

    // Jalankan pengurutan berdasarkan opsi dropdown yang aktif
    sortedCards.sort((cardA, cardB) => {
      const dataA = getCardData(cardA);
      const dataB = getCardData(cardB);

      switch (sortOption) {
        case 'title-asc':
          return dataA.title.localeCompare(dataB.title, 'id', { sensitivity: 'base' });
        case 'title-desc':
          return dataB.title.localeCompare(dataA.title, 'id', { sensitivity: 'base' });
        case 'rating':
          return dataB.rating - dataA.rating;
        case 'latest':
        default:
          return dataB.year - dataA.year;
      }
    });

    // Susun ulang urutan elemen kartu di dalam DOM grid
    sortedCards.forEach((card) => {
      booksGrid.appendChild(card);
    });

    // Pastikan pesan empty state selalu berada di posisi paling akhir
    if (emptyMessage) {
      booksGrid.appendChild(emptyMessage);
    }

    // Jalankan penyaringan berdasarkan kategori dan kata kunci pencarian
    sortedCards.forEach((card) => {
      const data = getCardData(card);

      const matchesCategory =
        activeCategory === 'Semua' ||
        data.category.toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        data.title.toLowerCase().includes(searchQuery) ||
        data.author.toLowerCase().includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Tampilkan pesan jika tidak ada buku yang memenuhi kriteria
    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Fungsi terpusat untuk memilih kategori dan menyinkronkan tombol aktif
  function selectCategory(categoryName) {
    activeCategory = categoryName;

    // Perbarui status aktif pada tombol-tombol kategori utama
    categoryButtons.forEach((btn) => {
      if (btn.textContent.trim().toLowerCase() === categoryName.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Jalankan pemfilteran & pengurutan
    filterAndSortBooks();
  }

  // Event listener untuk tombol filter kategori utama
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectCategory(btn.textContent.trim());
    });
  });

  // Event listener untuk tautan kategori di footer
  const footerLinksColumns = document.querySelectorAll('.footer-links');
  footerLinksColumns.forEach((col) => {
    const heading = col.querySelector('h4');
    if (heading && heading.textContent.trim().toLowerCase() === 'kategori') {
      const categoryLinks = col.querySelectorAll('a');
      categoryLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const categoryName = link.textContent.trim();

          // Jalankan filter kategori utama
          selectCategory(categoryName);

          // Arahkan tampilan secara mulus ke bagian koleksi buku
          const collectionSection = document.getElementById('collection');
          if (collectionSection) {
            collectionSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  });

  // Tautan yang mewakili seluruh koleksi (misal link "Koleksi" pada navigasi footer)
  const collectionNavLinks = document.querySelectorAll('.footer-links a[href="#collection"]');
  collectionNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      selectCategory('Semua');
    });
  });

  // Event listener untuk pengurutan buku saat opsi dropdown berubah
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterAndSortBooks();
    });
  }

  // Integrasi pencarian real-time jika elemen input pencarian tersedia
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndSortBooks();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      filterAndSortBooks();
    });
  }
});

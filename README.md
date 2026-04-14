# Try! N2 Interactive Learning Website

Website pembelajaran bahasa Jepang level N2 berbasis materi buku "Try! N2" dengan fokus pada Bab 1: Staff Recruitment Announcement.

## 📁 Struktur File

```
project/
├── database.xml          # Database konten grammar & latihan
├── index.html           # Website utama (Single Page Application)
└── README.md           # Dokumentasi
```

## 🎨 Fitur Utama

### 1. Navigasi Berbasis Daftar Isi
- **Beranda**: Hero section dengan Job Ad interaktif
- **Bab 1**: Konten utama "Staff Recruitment"
- **Grammar**: 8 pola kalimat dengan contoh
- **Latihan**: Quiz interaktif dengan scoring

### 2. Konten Bab 1 (Blueprint)
Materi yang diambil dari scan buku:
- **オープンにつき** (Dikarenakan)
- **国籍を問わず** (Tanpa memandang kebangsaan)
- **N2レベル以上の方に限り** (Hanya level N2 ke atas)
- **経験年数に応じ** (Sesuai pengalaman)
- **採否にかかわらず** (Terlepas dari diterima/tidak)
- **当店において** (Di toko kami)
- **面接の際に** (Pada saat wawancara)
- **履歴書持参のこと** (Wajib membawa CV)

### 3. Database XML
Struktur XML menyimpan:
- Metadata buku
- Daftar isi (navigasi)
- Grammar points lengkap dengan contoh
- Soal-soal latihan

## 🚀 Cara Menjalankan

1. Buka `index.html` di browser modern (Chrome/Firefox/Safari)
2. Tidak memerlukan server karena menggunakan client-side JavaScript
3. XML dapat di-edit untuk menambah konten bab lainnya

## 🛠️ Teknologi

- **HTML5**: Struktur semantik
- **Tailwind CSS**: Styling modern via CDN
- **Vanilla JavaScript**: Interaktivitas tanpa framework
- **XML**: Database terpisah untuk konten

## 📱 Responsive Design

- Desktop: Layout multi-kolom
- Tablet: Layout adaptable
- Mobile: Single column dengan menu hamburger

## 🎯 Interaktivitas

1. **Grammar Cards**: Expand/collapse contoh kalimat
2. **Quiz System**: 
   - Pilihan gaya interaktif
   - Validasi jawaban real-time
   - Score tracking
3. **Smooth Scrolling**: Navigasi halus antar section
4. **Animations**: Fade-in, slide-up, hover effects

## 📝 Catatan Pengembangan

Untuk menambah bab baru:
1. Edit `database.xml` → tambah node `<bab>` di `<daftar_isi>`
2. Tambah konten grammar di `<konten_bab>`
3. Update JavaScript di `index.html` untuk bab baru

# 🧪 ChemLab - Final Project II3140

Aplikasi pembelajaran kimia berbasis mobile dan web yang interaktif, dikembangkan sebagai proyek **Ujian Akhir Semester (UAS)** mata kuliah **II3140 - Pengembangan Aplikasi Web dan Mobile**.
Dibuat oleh Kelompok 14 K02

### 👥 Anggota Kelompok

| NIM | Nama |
|-----|------|
| 18223042 | Darryl Rayhananta Adenan |
| 18223096 | Matthew Sebastian Kurniawan |c

---

## 📖 Deskripsi Aplikasi

**ChemLab Mobile** adalah aplikasi virtual lab pembelajaran kimia yang dirancang untuk membantu pengguna mempelajari konsep-konsep kimia melalui pembelajaran interaktif. Aplikasi ini menyediakan:

- 📚 **Pathway Pembelajaran** - Jalur belajar terstruktur dengan berbagai topik kimia
- ✍️ **Quiz Interaktif** - Latihan soal untuk menguji pemahaman
- 🔬 **Simulasi Laboratorium** - Simulasi eksperimen kimia virtual
- 📝 **Tes Akhir** - Evaluasi komprehensif di akhir setiap pathway
- 📊 **Progress Tracking** - Pelacakan kemajuan belajar pengguna

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Framework utama untuk pengembangan cross-platform
- **Expo** - Platform untuk mempermudah development React Native
- **Expo Router** - File-based routing untuk navigasi
- **NativeWind** - Tailwind CSS untuk React Native
- **TypeScript** - Type-safe JavaScript

### Backend & Database
- **Supabase** - Backend-as-a-Service untuk:
  - Autentikasi (termasuk Google OAuth)
  - Database PostgreSQL
  - Real-time subscriptions

### UI/UX
- **Expo Linear Gradient** - Gradien untuk tampilan yang menarik
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Animasi yang smooth

### Lainnya
- **Expo AV** - Audio/Video support
- **Async Storage** - Penyimpanan data lokal
- **Expo Auth Session** - Autentikasi OAuth

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app di smartphone (untuk testing di device)

### Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/Matthew12-t/UAS_PAWM-II3140-Kelompok_14.git
   cd UAS_PAWM-II3140-Kelompok_14
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi**
   ```bash
   # Development mode
   npm start
   
   # Untuk web
   npm run web
   
   # Untuk Android
   npm run android
   
   # Untuk iOS
   npm run ios
   ```

4. **Scan QR code** dengan Expo Go app untuk menjalankan di perangkat fisik

---

## 📱 Fitur Utama

### 1. Autentikasi
- Login dengan Email/Password
- Login dengan Google OAuth
- Registrasi akun baru

### 2. Dashboard
- Daftar pathway pembelajaran
- Status progress (Not Started, In Progress, Completed)
- Quick access ke pathway yang sedang dikerjakan

### 3. Pathway Pembelajaran
- **Topic View** - Materi pembelajaran dengan penjelasan lengkap
- **Quiz View** - Latihan soal pilihan ganda
- **Simulation View** - Simulasi eksperimen kimia interaktif
- **Final Test View** - Tes akhir untuk evaluasi

### 4. Progress Tracking
- Melacak progress setiap pathway
- Menyimpan skor quiz dan tes
- Riwayat pembelajaran

### 5. Pengaturan
- Pengaturan tema (Light/Dark mode)
- Pengaturan audio
- Manajemen akun

---

// ─── LOT Quest App Data ─────────────────────────────────────────
// Extracted to keep App.tsx under Babel's 500KB transpilation threshold.

// ── Types ─────────────────────────────────────────────────────
export type Rarity = "mythic" | "legendary" | "epic" | "rare" | "common";

// ── Help Page Data ─────────────────────────────────────────────
export const FAQ_DATA = [
  { 
    q: "Bagaimana cara mendapatkan XP dan apa saja batas maksimumnya?", 
    a: "XP diperoleh dari berbagai aktivitas produktif agen: Daily Login (+100 XP), input New Listing (+100 XP, Cap 500 XP/hari), upload New Content (+300 XP, Cap 300 XP/hari), Listing Promotion (+100 XP, Cap 300 XP/hari), input New Prospect (+100 XP, Cap 2.500 XP/minggu), menyelesaikan video Academy (+200 XP/video), dan New Recruit (+5.000 XP). Detail lengkap dapat dilihat di XP Guide." 
  },
  { 
    q: "Mengapa input New Prospect dibatasi maksimal 2.500 XP per minggu?", 
    a: "Berdasarkan SOP LOT Property Group, batas mingguan 2.500 XP (setara 25 prospek baru per minggu) diterapkan untuk memastikan kualitas data prospek yang dimasukkan valid, terverifikasi, dan menghindari manipulasi atau spam database oleh agen." 
  },
  { 
    q: "Bagaimana cara melakukan klaim komisi (Commission Claim)?", 
    a: "Semua pengajuan klaim komisi harus disubmit melalui Google Form resmi LOT Property yang terintegrasi (tombol klaim ada di halaman Quest). Setelah diserahkan, tim Finance akan melakukan verifikasi manual. Setelah disetujui (Approved), XP akan didistribusikan ke akun Anda sesuai dengan Commission XP Matrix." 
  },
  { 
    q: "Berapa XP yang didapatkan dari closing transaksi (SALE & RENT)?", 
    a: "XP dihitung berdasarkan tipe transaksi dan properti. Untuk RENT (Sewa): Apartemen (+2.000 XP), Rumah (+3.000 XP), Properti Komersial/Ruko/Tanah (+5.000 XP). Untuk SALE (Jual): Apartemen (+5.000 XP), Rumah (+7.500 XP), Ruko/Tanah/Gudang/Primary (+10.000 XP)." 
  },
  { 
    q: "Apa saja syarat untuk membuka badge 'Dedicated' dan 'Exceptional'?", 
    a: "Badge 'Dedicated Agent' (Epic) dibuka dengan menyelesaikan seluruh rangkaian Daily Quest selama 7 hari berturut-turut. Badge 'Exceptional Agent' (Legendary) membutuhkan 30 hari berturut-turut, sedangkan 'Perfectionist Agent' (Mythic) membutuhkan 100 hari berturut-turut. Jika absen satu hari saja, streak harian akan kembali ke 0." 
  },
  { 
    q: "Kapan Weekly Leaderboard dan Hall of Fame bulanan direset?", 
    a: "Weekly Leaderboard direset setiap hari Senin pukul 00:00 WIB. Hall of Fame bulanan direset pada tanggal 1 setiap bulan, di mana Top 5 agen dari setiap kategori secara otomatis diabadikan ke dalam 'Hall of Fame History' di profil permanen mereka." 
  },
  { 
    q: "Apakah level agen bisa berkurang atau ter-reset?", 
    a: "Tidak. Akumulasi total XP dan level agen bersifat permanen dan tidak akan pernah berkurang atau ter-reset, sehingga melambangkan kematangan karir dan prestise agen secara jangka panjang di LOT Property." 
  },
];

export const TERMS_SECTIONS = [
  // ── BAGIAN 1: ATURAN UMUM ──
  {
    title: "1. ATURAN UMUM — Eksklusivitas & Kepatuhan",
    content: "(1) Eksklusivitas Agen — Agen hanya boleh mewakili PT LOT PROPERTY GROUP dan dilarang bekerja untuk agency lain selama masa kerja sama. Seluruh transaksi dan komisi dari jual, beli, atau sewa properti wajib dilaporkan kepada perusahaan. (2) Kepatuhan Hukum — Seluruh aktivitas agen harus sesuai dengan ketentuan hukum properti yang berlaku di Indonesia. (3) Menjaga Reputasi Kantor — Agen mewakili nama baik LOT Property dan wajib menjaga sikap profesional, termasuk di media sosial, komunikasi dengan klien, dan interaksi di lapangan.",
  },
  // ── BAGIAN 2: ETIKA AGEN ──
  {
    title: "2. ETIKA AGEN — Penampilan, Kejujuran & Solidaritas",
    content: "(1) Penampilan dan Perilaku — Berpakaian rapi (celana panjang, sepatu tertutup, name tag). Bertutur kata sopan dan profesional. Tepat waktu dan fast response. Menjaga etika dalam komunikasi kepada klien maupun rekan kerja. (2) Kejujuran dan Tanggung Jawab — Memberikan informasi jujur dan akurat. Tidak menyembunyikan informasi penting dari klien atau kantor. (3) Hubungan Antar Agen — Tidak menjatuhkan sesama agen atau kompetitor. Menjaga solidaritas dan kerja sama antar agen LOT Property.",
  },
  // ── BAGIAN 3: PERATURAN LISTING ──
  {
    title: "3. PERATURAN LISTING — Sistem Bebas & DP Absolut",
    content: "(1) Sistem Listing Bebas — Kantor tidak meminta listing dari pihak agen. Semua listing bersifat umum dan tidak ada eksklusivitas yang diakui kantor. Saat membagikan listing di dalam grup kantor, dilarang menyebutkan alamat unit. (2) DP Bersifat Absolut — Jika sudah ada DP, maka tidak ada agen LOT lainnya yang boleh mengganggu transaksi tersebut. Dilarang menghasut customer maupun owner yang sudah masuk DP. Apabila DP berupa cash atau uang tunai, wajib melapor kepada FINANCE kantor lalu disetorkan ke kantor ataupun ke owner.",
  },
  {
    title: "3.1. PERATURAN LISTING — Booking, Privasi & Fire Fight",
    content: "(3) Booking Unit — Unit tidak boleh di-hold atau dibooking tanpa DP resmi. DILARANG TANDA JADI menggunakan uang pribadi, apabila dilakukan kantor berhak tidak mengembalikan dana tersebut. (4) Privasi Buyer/Owner — Jika kamu memegang buyer atau owner, jangan minta atau memberi tahu nama mereka. Risiko atas kebocoran identitas ditanggung sendiri oleh agen. (5) Fire Fight & Komisi — Jika terjadi perebutan listing, tidak boleh membuang komisi (contoh: dari 2% menjadi 1%). Lebih baik kompromi dan bekerja sama agar semua senang.",
  },
  {
    title: "3.2. PERATURAN LISTING — Eksklusivitas Negosiasi & Denda",
    content: "(6) Eksklusivitas Negosiasi — Jika listing sudah diberikan alamat unit oleh Marketing A, maka transaksi wajib dilakukan dengan Marketing A yang pertama memberikan alamat tersebut, dalam periode 3 bulan. (7) Dilarang memberikan alamat unit secara langsung kepada marketing lain apabila tidak diminta atau tidak sesuai kriteria. Marketing yang menerima info berhak menolak alamat tersebut. (8) Jika terjadi pelanggaran, penyerobotan, atau bypass listing, maka DENDA 50% KOMISI akan dikenakan kepada pelanggar. Semua klaim dan pelanggaran wajib bisa dibuktikan dengan screenshot chat atau bukti konkret lainnya.",
  },
  // ── BAGIAN 4: PROSEDUR TRANSAKSI ──
  {
    title: "4. PROSEDUR TRANSAKSI — Pembayaran & Dokumen",
    content: "(1) Transfer DP/Tanda Jadi — Setiap transaksi hanya boleh melakukan transfer ke: Rekening DP LOT PROPERTY: BCA 8650-3399-17, atau langsung ke rekening owner/developer. DILARANG menampung DP di rekening pribadi agent. (2) Dokumen Perjanjian — Kedua agent wajib membuat perjanjian sewa menyewa atau jual beli menggunakan dokumen resmi internal LOT PROPERTY atau melalui notaris. DILARANG membuat atau memodifikasi sendiri perjanjian tanpa persetujuan kantor. (3) Verifikasi Dokumen — Wajib melakukan pengecekan keabsahan dokumen dan identitas semua pihak (buyer/owner).",
  },
  {
    title: "4.1. PROSEDUR TRANSAKSI — Keabsahan & Penyimpanan",
    content: "(4) Keabsahan Kesepakatan — Transaksi sah jika perjanjian ditandatangani oleh semua pihak: Owner wajib suami istri, Buyer/Penyewa, atau kuasa yang sah secara hukum. (5) Penyimpanan Dokumen — Agen wajib menyimpan salinan dokumen dan menyerahkannya ke kantor sebagai arsip.",
  },
  // ── BAGIAN 5: KELENGKAPAN DOKUMEN ──
  {
    title: "5. KELENGKAPAN DOKUMEN — Perorangan & Perusahaan",
    content: "Kategori Perorangan — Pihak Penjual: KTP suami & istri, NPWP, Bukti kepemilikan (SHM/SHGB atau PPJB/SP dan payment schedule), IMB/PBG (jika ada), PBB terakhir, Bukti pembayaran listrik/air, Surat kuasa (jika dikuasakan). Pihak Pembeli/Penyewa: KTP (suami & istri jika menikah), NPWP, Surat kuasa (jika dikuasakan). Kategori Perusahaan — Pihak Penjual: Akta Pendirian & SK Kemenkumham, NPWP perusahaan, Sertifikat & IMB/SLF, PBB terakhir, Surat kuasa direksi (jika dikuasakan). Pihak Pembeli/Penyewa: KTP Direktur Utama atau pemilik saham mayoritas, Akta pendirian & SK Kemenkumham, NPWP perusahaan, SIUP/NIB, Surat kuasa pembelian/sewa.",
  },
  // ── BAGIAN 6: PEMBAYARAN KOMISI ──
  {
    title: "6. PEMBAYARAN KOMISI — Setor, Klaim & Pajak",
    content: "(1) Setor Komisi ke Perusahaan — Komisi yang didapat wajib disetor ke rekening resmi: BCA 1270-588-588 / PT LOT PROPERTY GROUP. (2) Klaim Komisi — Agen wajib mengisi link Google Form klaim komisi yang disediakan kantor. Sertakan bukti transfer komisi. (3) Deadline Komisi — Pencairan komisi WAJIB dilakukan di bulan yang sama saat komisi diterima, agar dihitung dalam sistem reward dan ranking bulanan. (4) Pemotongan Pajak — Seluruh komisi akan dipotong pajak sesuai peraturan yang berlaku.",
  },
  {
    title: "6.1. PEMBAYARAN KOMISI — Transparansi & Markup",
    content: "(5) Transparansi Hadiah/Tambahan — Segala bentuk uang dari klien (angpau, bonus, tambahan lainnya) wajib dilaporkan. Jika jumlahnya melebihi Rp1.000.000, maka dianggap sebagai komisi. (6) Kesepakatan Komisi & Markup — Nilai komisi maupun markup harus diketahui dan disetujui oleh pihak owner. DILARANG memanipulasi nilai komisi tanpa izin dari owner.",
  },
  // ── BAGIAN 7: PELANGGARAN ──
  {
    title: "7. PELANGGARAN & PEMUTUSAN KONTRAK",
    content: "PT LOT PROPERTY GROUP berhak memberikan hukuman berupa sanksi, denda, skorsing, maupun pemutusan kerja sepihak apabila terjadi pelanggaran. Pelanggaran Ringan (tidak memakai atribut, keterlambatan, tata krama tidak sopan, slow response, tidak bertanggung jawab) → Sanksi: Teguran, skorsing sementara, denda administratif. Pelanggaran Berat (pemalsuan dokumen atau tanda tangan, penyalahgunaan nama perusahaan, pelanggaran etika berat, penggelapan atau bypass listing) → Sanksi: Proses hukum, blacklist, dan pemutusan kontrak kerja secara sepihak.",
  },
  // ── BAGIAN 8: SANKSI & DENDA ──
  {
    title: "8. SANKSI & DENDA INTERNAL — Tabel Denda Resmi",
    content: "(1) Penampilan & Identitas: Celana pendek di kantor → Denda Rp20.000. Sandal (bukan sepatu tertutup) → Denda Rp20.000. Tanpa name tag → Denda Rp20.000. (2) Jadwal & Komitmen Klien: Terlambat/tidak hadir survei terjadwal → Denda Rp100.000–Rp500.000. Tidak hadir transaksi tanpa konfirmasi & tanpa pengalihan → Denda Rp500.000–Rp1.000.000. (3) Layanan Klien: Sengaja tidak merespons klien hingga menyebabkan komplain melalui hotline/Google Review/platform publik → Denda Rp100.000–Rp1.000.000.",
  },
];

// ── Admin Data ─────────────────────────────────────────────────
export const AGENT_DATA_LIST = [
  { id:"LOT-001", name:"Rizki Pratama",   email:"rizki@lot.id",   phone:"0812-1111",  office:"Tangerang Selatan", level:"Elite Agent",   status:"Active",    joined:"Jan 2022" },
  { id:"LOT-002", name:"Siti Fatimah",    email:"siti@lot.id",    phone:"0812-2222",  office:"BSD",               level:"Elite Agent",   status:"Active",    joined:"Mar 2022" },
  { id:"LOT-003", name:"Ahmad Fadhil",    email:"ahmad@lot.id",   phone:"0812-3333",  office:"Tangerang Selatan", level:"Senior Agent",  status:"Active",    joined:"Jan 2023" },
  { id:"LOT-004", name:"Linda Kusuma",    email:"linda@lot.id",   phone:"0812-4444",  office:"Jakarta Selatan",   level:"Junior Agent",  status:"Pending",   joined:"Jun 2025" },
  { id:"LOT-005", name:"Rendi Setiawan",  email:"rendi@lot.id",   phone:"0812-5555",  office:"Depok",             level:"Rookie Agent",  status:"Pending",   joined:"Jun 2025" },
  { id:"LOT-006", name:"Maya Putri",      email:"maya@lot.id",    phone:"0812-6666",  office:"Bekasi",            level:"Rookie Agent",  status:"Pending",   joined:"Jun 2025" },
  { id:"LOT-007", name:"Eko Purnomo",     email:"eko@lot.id",     phone:"0812-7777",  office:"Serpong",           level:"Junior Agent",  status:"Suspended", joined:"Apr 2023" },
];

export const COMMISSION_DATA_LIST = [
  { id:"COM-001", agent:"Rizki Pratama",  type:"SALE",    property:"Rumah · Bintaro Jaya",        amount:"Rp 320.000.000", xp:"+7.500 XP",  submitted:"19 Jun 2025", status:"Pending" },
  { id:"COM-002", agent:"Siti Fatimah",   type:"SALE",    property:"Apartemen · The Spring",      amount:"Rp 180.000.000", xp:"+5.000 XP",  submitted:"19 Jun 2025", status:"Pending" },
  { id:"COM-003", agent:"Ahmad Fadhil",   type:"RENT",    property:"Ruko · Serpong",              amount:"Rp 45.000.000",  xp:"+5.000 XP",  submitted:"18 Jun 2025", status:"Pending" },
  { id:"COM-004", agent:"Dewi Rahma",     type:"SALE",    property:"Tanah · Sawangan",            amount:"Rp 680.000.000", xp:"+10.000 XP", submitted:"18 Jun 2025", status:"Pending" },
  { id:"COM-005", agent:"Budi Santoso",   type:"PRIMARY", property:"Primary · BSD City",          amount:"Rp 850.000.000", xp:"+10.000 XP", submitted:"17 Jun 2025", status:"Pending" },
  { id:"COM-006", agent:"Andi Wijaya",    type:"SALE",    property:"Rumah · Alam Sutera",         amount:"Rp 2.100.000.000",xp:"+7.500 XP", submitted:"16 Jun 2025", status:"Pending" },
  { id:"COM-007", agent:"Eko Purnomo",    type:"RENT",    property:"Apartemen · Tangerang",       amount:"Rp 28.000.000",  xp:"+2.000 XP",  submitted:"15 Jun 2025", status:"Pending" },
  { id:"COM-008", agent:"Rizki Pratama",  type:"SALE",    property:"Ruko · Grand Serpong",        amount:"Rp 1.200.000.000",xp:"+10.000 XP",submitted:"14 Jun 2025", status:"Approved" },
  { id:"COM-009", agent:"Siti Fatimah",   type:"SALE",    property:"Rumah · BSD City",            amount:"Rp 750.000.000", xp:"+7.500 XP",  submitted:"13 Jun 2025", status:"Rejected" },
];

export const LOG_DATA_LIST = [
  { time:"19 Jun · 14:32", actor:"Super Admin",   action:"Approved commission COM-008 for Rizki Pratama", type:"commission" },
  { time:"19 Jun · 11:15", actor:"Office Manager",action:"Approved registration for Linda Kusuma",        type:"agent" },
  { time:"18 Jun · 16:40", actor:"Super Admin",   action:"XP Adjustment: +500 XP to Ahmad Fadhil — bonus event",type:"xp" },
  { time:"18 Jun · 09:22", actor:"Office Manager",action:"Added recruit: Doni Saputra under mentor Rizki Pratama",type:"recruit" },
  { time:"17 Jun · 15:10", actor:"Finance",       action:"Rejected commission COM-009 — komisi belum cair", type:"commission" },
  { time:"17 Jun · 10:05", actor:"Super Admin",   action:"Updated Hall of Fame Top Primary & KPR — Juni 2025",type:"hof" },
  { time:"16 Jun · 08:45", actor:"Office Manager",action:"Event published: Grand LOT Challenge 2025",     type:"event" },
];

// Agent profile photos — using randomuser.me for realistic demo photos
// Agent profile photos — using high-quality formal business suit Unsplash photos
export const AGENT_PHOTOS: Record<string, string> = {
  "RP": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400&h=400", // Man in suit, dark bg
  "SF": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400", // Woman in suit, dark bg
  "BS": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400", // Man in suit, office bg
  "DR": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400&h=400", // Woman in suit, grey bg
  "AF": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400", // Man in suit, neutral bg
  "EP": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400", // Man in suit, grey bg
  "AW": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400", // Man in suit, dark grey bg
  "LK": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400", // Woman, professional jacket
  "RS": "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=400&h=400", // Man, dark suit, dark bg
  "MP": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400", // Woman, professional, grey bg
  "FH": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400", // Woman, professional, dark bg
  "DS": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=400&h=400", // Man, formal suit, dark bg
  "PA": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=400", // Woman in suit, office bg
  "FI": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400", // Woman in suit, grey bg
};

export function getDynamicPeriods() {
  const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const periods = [];
  const startYear = 2025;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  for (let y = currentYear; y >= startYear; y--) {
    const maxM = y === currentYear ? currentMonth : 11;
    for (let m = maxM; m >= 0; m--) {
      periods.push(`${INDO_MONTHS[m]} ${y}`);
    }
  }
  return periods;
}

export const DYNAMIC_PERIODS = getDynamicPeriods();

export const HOF_TABS = [
  "Top 5 Commission",
  "Top 5 By Unit",
  "Top 5 Primary",
  "Rising Star",
  "Content Creator",
  "Listing Hunter",
  "Prospecting Master",
  "Top Recruiter",
] as const;

export const HOF_CAT_DATA: Record<string, any[]> = {
  "Top 5 Commission": [
    { rank:1, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"Rp 128.500.000", badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
    { rank:2, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"Rp 98.700.000",  badges:[["epic","Certified Agent"],["rare","Prospect Hunter"]] },
    { rank:3, name:"Budi S.",       initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"Rp 67.400.000",  badges:[["epic","Listing Distributor"],["rare","Listing Supplier"]] },
    { rank:4, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"Rp 51.200.000" },
    { rank:5, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"Rp 44.800.000",  isMe:true, xpLabel:"+1.620 XP pekan ini" },
    { rank:6, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"Rp 39.500.000" },
    { rank:7, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"Rp 32.100.000" },
    { rank:8, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"Rp 28.400.000" },
  ],
  "Top 5 By Unit": [
    { rank:1, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"31 Unit", badges:[["epic","Certified Agent"],["rare","Prospect Hunter"]] },
    { rank:2, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"28 Unit", badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
    { rank:3, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"24 Unit", badges:[["epic","Listing Distributor"],["rare","Listing Supplier"]], isMe:true, xpLabel:"#3 bulan ini" },
    { rank:4, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"19 Unit" },
    { rank:5, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"17 Unit" },
    { rank:6, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"15 Unit" },
    { rank:7, name:"Budi S.",       initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"13 Unit" },
    { rank:8, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"11 Unit" },
  ],
  "Top 5 Primary": [
    { rank:1, name:"Budi S.",       initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"12 Unit KPR", badges:[["epic","Listing Distributor"],["rare","Listing Supplier"]] },
    { rank:2, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"9 Unit KPR",  badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
    { rank:3, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"8 Unit KPR",  badges:[["epic","Certified Agent"],["rare","Prospect Hunter"]] },
    { rank:4, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"6 Unit KPR" },
    { rank:5, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"5 Unit KPR",  isMe:true, xpLabel:"+1.620 XP pekan ini" },
    { rank:6, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"4 Unit KPR" },
    { rank:7, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"3 Unit KPR" },
    { rank:8, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"2 Unit KPR" },
  ],
  "Rising Star": [
    { rank:1, name:"Linda K.",      initials:"LK", photo:AGENT_PHOTOS["LK"], level:"Junior Agent", subtitle:"Junior Agent · Lv 22", value:"First Closing", badges:[["common","First Deal"],["common","First Listing"]] },
    { rank:2, name:"Rendi S.",      initials:"RS", photo:AGENT_PHOTOS["RS"], level:"Junior Agent", subtitle:"Junior Agent · Lv 18", value:"First Closing", badges:[["common","First Prospect"],["common","First Deal"]] },
    { rank:3, name:"Maya P.",       initials:"MP", photo:AGENT_PHOTOS["MP"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 12", value:"First Closing", badges:[["common","First Listing"],["common","First Prospect"]] },
    { rank:4, name:"Fitri H.",      initials:"FH", photo:AGENT_PHOTOS["FH"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 9",  value:"First Closing" },
    { rank:5, name:"Doni S.",       initials:"DS", photo:AGENT_PHOTOS["DS"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 7",  value:"First Closing" },
    { rank:6, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"First Closing" },
    { rank:7, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"First Closing" },
    { rank:8, name:"Fitri H.",      initials:"FI", photo:AGENT_PHOTOS["FI"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 14", value:"First Closing" },
  ],
  "Content Creator": [
    { rank:1, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"47 Konten", badges:[["epic","Content Creator"],["rare","Prospect Hunter"]] },
    { rank:2, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"38 Konten", badges:[["legendary","The Influencer"],["epic","Dedicated Agent"]] },
    { rank:3, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"31 Konten", badges:[["epic","Content Creator"],["common","First Listing"]], isMe:true, xpLabel:"#3 bulan ini" },
    { rank:4, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"24 Konten" },
    { rank:5, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"18 Konten" },
    { rank:6, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"14 Konten" },
    { rank:7, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"11 Konten" },
    { rank:8, name:"Fitri H.",      initials:"FI", photo:AGENT_PHOTOS["FI"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 14", value:"9 Konten" },
  ],
  "Listing Hunter": [
    { rank:1, name:"Budi S.",       initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"54 Listing", badges:[["epic","Listing Distributor"],["rare","Listing Supplier"]] },
    { rank:2, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"47 Listing", badges:[["rare","Listing Supplier"],["common","First Listing"]] },
    { rank:3, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"41 Listing", badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
    { rank:4, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"33 Listing" },
    { rank:5, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"29 Listing", isMe:true, xpLabel:"+1.620 XP pekan ini" },
    { rank:6, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"24 Listing" },
    { rank:7, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"20 Listing" },
    { rank:8, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"16 Listing" },
  ],
  "Prospecting Master": [
    { rank:1, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"312 Prospek", badges:[["epic","Certified Agent"],["rare","Prospect Hunter"]] },
    { rank:2, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"287 Prospek", badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
    { rank:3, name:"Eko P.",        initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"241 Prospek", badges:[["rare","Prospect Hunter"],["common","First Prospect"]] },
    { rank:4, name:"Maya P.",       initials:"MP", photo:AGENT_PHOTOS["MP"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 12", value:"198 Prospek" },
    { rank:5, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"176 Prospek", isMe:true, xpLabel:"+1.620 XP pekan ini" },
    { rank:6, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"154 Prospek" },
    { rank:7, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"128 Prospek" },
    { rank:8, name:"Fitri H.",      initials:"FI", photo:AGENT_PHOTOS["FI"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 14", value:"94 Prospek" },
  ],
  "Top Recruiter": [
    { rank:1, name:"Rizki P.",      initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"8 Rekrutan", badges:[["legendary","100M Club"],["epic","Team Builder"]] },
    { rank:2, name:"Budi S.",       initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"6 Rekrutan", badges:[["epic","Team Builder"],["rare","Talent Scout"]] },
    { rank:3, name:"Siti F.",       initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"5 Rekrutan", badges:[["rare","Talent Scout"],["common","First Recruit"]] },
    { rank:4, name:"Ahmad Fadhil",  initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"3 Rekrutan", isMe:true, xpLabel:"+1.620 XP pekan ini" },
    { rank:5, name:"Dewi R.",       initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"2 Rekrutan" },
    { rank:6, name:"Andi W.",       initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"2 Rekrutan" },
    { rank:7, name:"Putri A.",      initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"1 Rekrutan" },
    { rank:8, name:"Fitri H.",      initials:"FI", photo:AGENT_PHOTOS["FI"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 14", value:"1 Rekrutan" },
  ],
};

export const WEEKLY_LB_DATA = [
  { rank:1, name:"Rizki P.",     initials:"RP", photo:AGENT_PHOTOS["RP"], level:"Elite Agent", subtitle:"Elite Agent · Lv 67",  value:"3.240 XP", badges:[["legendary","100M Club"],["epic","Dedicated Agent"]] },
  { rank:2, name:"Siti F.",      initials:"SF", photo:AGENT_PHOTOS["SF"], level:"Elite Agent", subtitle:"Elite Agent · Lv 62",  value:"2.890 XP", badges:[["epic","Certified Agent"],["rare","Prospect Hunter"]] },
  { rank:3, name:"Budi S.",      initials:"BS", photo:AGENT_PHOTOS["BS"], level:"Senior Agent", subtitle:"Senior Agent · Lv 51", value:"2.640 XP", badges:[["epic","Listing Distributor"],["rare","Listing Supplier"]] },
  { rank:4, name:"Dewi R.",      initials:"DR", photo:AGENT_PHOTOS["DR"], level:"Senior Agent", subtitle:"Senior Agent · Lv 44", value:"2.210 XP" },
  { rank:5, name:"Andi W.",      initials:"AW", photo:AGENT_PHOTOS["AW"], level:"Senior Agent", subtitle:"Senior Agent · Lv 40", value:"1.980 XP" },
  { rank:6, name:"Eko P.",       initials:"EP", photo:AGENT_PHOTOS["EP"], level:"Junior Agent", subtitle:"Junior Agent · Lv 38", value:"1.840 XP" },
  { rank:7, name:"Ahmad Fadhil", initials:"AF", photo:AGENT_PHOTOS["AF"], level:"Senior Agent", subtitle:"Senior Agent · Lv 45", value:"1.620 XP", isMe:true, xpLabel:"+1.620 XP pekan ini" },
  { rank:8, name:"Putri A.",     initials:"PA", photo:AGENT_PHOTOS["PA"], level:"Junior Agent", subtitle:"Junior Agent · Lv 29", value:"1.380 XP" },
  { rank:9, name:"Rendi S.",     initials:"RS", photo:AGENT_PHOTOS["RS"], level:"Junior Agent", subtitle:"Junior Agent · Lv 22", value:"1.150 XP" },
  { rank:10,name:"Fitri H.",     initials:"FH", photo:AGENT_PHOTOS["FH"], level:"Rookie Agent", subtitle:"Rookie Agent · Lv 14", value:"920 XP" },
];

// ── Event Data (shared format with Admin) ──────────────────────
export interface EventItem {
  id: string;
  title: string;
  desc: string;
  start: string;
  end: string;
  xpPool: number;
  badge: string;
  banner?: string;
  status: "Active" | "Upcoming";
  subtitle: string;
  heading: string;
  tagline: string;
  taglineHighlight?: string;
  accentColor: string;
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatEventPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} – ${e.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} – ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${e.getFullYear()}`;
}

export const EVENT_DATA: EventItem[] = [
  {
    id: "EV-001",
    title: "17 Agustusan — Lomba Konten",
    desc: "Tunjukkan kreativitasmu dalam membuat konten properti bertema Kemerdekaan Indonesia dan dapatkan total hadiah 100.000 XP Pool beserta Badge Eksklusif Merdeka Creator.",
    start: "2026-08-01",
    end: "2026-08-31",
    xpPool: 100000,
    badge: "Merdeka Creator",
    status: "Active",
    subtitle: "17 AGUSTUSAN",
    heading: "LOMBA KONTEN",
    tagline: "Tunjukkan kreativitasmu dan menangkan",
    taglineHighlight: "XP + Badge Spesial!",
    accentColor: "#E53E3E",
  },
  {
    id: "EV-002",
    title: "Mid-Year Listing Rush",
    desc: "Kejar pencapaian 50 listing baru di bulan Juni dan Juli untuk memenangkan bonus instan XP.",
    start: "2026-06-01",
    end: "2026-07-31",
    xpPool: 50000,
    badge: "Listing Supplier",
    status: "Upcoming",
    subtitle: "MID-YEAR EVENT",
    heading: "LISTING RUSH",
    tagline: "Kejar 50 listing baru dan raih",
    taglineHighlight: "bonus XP instan!",
    accentColor: "#2563EB",
  },
  {
    id: "EV-003",
    title: "Quest Marathon Q3",
    desc: "Selesaikan rangkaian quest harian selama kuartal ketiga dan kumpulkan XP maksimal untuk naik peringkat leaderboard.",
    start: "2026-07-01",
    end: "2026-09-30",
    xpPool: 75000,
    badge: "Deal Maker",
    status: "Upcoming",
    subtitle: "QUEST MARATHON",
    heading: "Q3 CHALLENGE",
    tagline: "Selesaikan quest harian dan kumpulkan",
    taglineHighlight: "XP maksimal!",
    accentColor: "#7B2FBE",
  },
  {
    id: "EV-004",
    title: "Grand Deal Challenge",
    desc: "Raih closing transaksi terbanyak dalam periode event dan klaim hadiah eksklusif Billionaire Club badge.",
    start: "2026-09-01",
    end: "2026-11-30",
    xpPool: 150000,
    badge: "Billionaire Club",
    status: "Upcoming",
    subtitle: "SPECIAL CHALLENGE",
    heading: "DEAL MAKER",
    tagline: "Raih closing terbanyak dan klaim",
    taglineHighlight: "hadiah eksklusif!",
    accentColor: "#D97706",
  },
];

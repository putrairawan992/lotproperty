// ─── LOT Quest App Data ─────────────────────────────────────────
// Extracted to keep App.tsx under Babel's 500KB transpilation threshold.

// ── Types ─────────────────────────────────────────────────────
export type Rarity = "mythic" | "legendary" | "epic" | "rare" | "common";

// ── Help Page Data ─────────────────────────────────────────────
export const FAQ_DATA = [
  { q: "Bagaimana cara mendapatkan XP?",           a: "XP diperoleh dari berbagai aktivitas: Daily Login (+100 XP), input Listing (+100 XP), upload Konten (+300 XP), input Prospect (+100 XP), Closing Unit (sesuai matrix), dan banyak lagi. Lihat tab 'Panduan XP' untuk detail lengkap." },
  { q: "Apakah XP bisa reset?",                    a: "Tidak. XP bersifat permanen dan tidak pernah reset. XP Weekly Leaderboard direset setiap Senin 00:00 WIB, namun total XP kamu tetap bertambah." },
  { q: "Bagaimana cara naik level?",               a: "Level naik secara otomatis saat total XP kamu mencapai threshold level berikutnya. Tidak ada aksi khusus yang perlu dilakukan." },
  { q: "Berapa banyak badge yang bisa dipilih sebagai Featured?", a: "Kamu bisa memilih maksimal 3 badge sebagai Featured Badge. Badge ini akan tampil di Profile, Hall of Fame, dan Weekly Leaderboard kamu." },
  { q: "Bagaimana cara mengklaim komisi?",         a: "Klik tombol 'Claim Commission' di halaman Quest, lalu isi Google Form yang disediakan. Setelah diverifikasi oleh Finance, XP akan otomatis ditambahkan." },
  { q: "Kapan Hall of Fame direset?",              a: "Hall of Fame direset setiap tanggal 1 bulan berjalan. Hasil Hall of Fame akan masuk ke riwayat permanen di halaman Profile kamu." },
  { q: "Apa itu Daily Streak?",                    a: "Daily Streak adalah jumlah hari berturut-turut kamu menyelesaikan Daily Quest (Login + Listing + Konten + Promosi). Jika satu hari tidak selesai, streak kembali ke 0." },
  { q: "Mengapa akun saya masih Pending?",         a: "Akun baru memerlukan persetujuan dari Office Manager. Proses verifikasi biasanya 1×24 jam kerja. Hubungi CS jika lebih dari itu." },
  { q: "Bagaimana cara menghubungi admin?",        a: "Gunakan tab 'Bantuan CS' di halaman ini untuk menghubungi tim support via WhatsApp, Email, atau telepon." },
];

export const TERMS_SECTIONS = [
  {
    title: "1. Penggunaan Platform",
    content: "LOT Quest adalah platform gamification internal LOT Property Group yang hanya dapat diakses oleh agen dan staf resmi LOT Property. Penggunaan platform ini tunduk pada kebijakan internal perusahaan.",
  },
  {
    title: "2. Data & Privasi",
    content: "Data aktivitas agent (listing, prospect, komisi, XP) dikumpulkan untuk keperluan operasional LOT Quest. Data tidak akan dibagikan kepada pihak ketiga tanpa persetujuan. Total komisi bersifat privat dan hanya dapat dilihat oleh pemilik akun, Finance, dan Super Admin.",
  },
  {
    title: "3. Sistem XP & Level",
    content: "XP dihitung secara otomatis berdasarkan aktivitas yang terverifikasi. XP bersifat permanen dan tidak dapat dipindahtangankan. Manipulasi data untuk mendapatkan XP tidak sah akan mengakibatkan suspend akun.",
  },
  {
    title: "4. Komisi & Transaksi",
    content: "Klaim komisi harus disubmit melalui Google Form resmi LOT Property. Hanya transaksi dengan status Approved yang dihitung sebagai komisi resmi. LOT Property berhak menolak klaim yang tidak memenuhi syarat.",
  },
  {
    title: "5. Hall of Fame & Leaderboard",
    content: "Penentuan Hall of Fame dilakukan secara otomatis berdasarkan data sistem, kecuali kategori manual (Top Primary & KPR, Rising Star, Top Recruit) yang ditentukan oleh manajemen. Keputusan manajemen bersifat final.",
  },
  {
    title: "6. Akun & Keamanan",
    content: "Agent bertanggung jawab menjaga kerahasiaan password akun. Akses yang tidak sah atau pelanggaran kebijakan dapat mengakibatkan suspend atau terminate akun tanpa pemberitahuan sebelumnya.",
  },
  {
    title: "7. Perubahan Kebijakan",
    content: "LOT Property berhak mengubah ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui notifikasi platform. Penggunaan platform setelah perubahan dianggap sebagai persetujuan terhadap ketentuan baru.",
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
  { time:"17 Jun · 15:10", actor:"Finance",       action:"Rejected commission COM-009 — komisi belum cair",type:"commission" },
  { time:"17 Jun · 10:05", actor:"Super Admin",   action:"Updated Hall of Fame Top Primary & KPR — Juni 2025",type:"hof" },
  { time:"16 Jun · 08:45", actor:"Office Manager",action:"Event published: Grand LOT Challenge 2025",     type:"event" },
];

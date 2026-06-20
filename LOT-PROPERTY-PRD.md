# LOT PROPERTY
## Product Requirement Document (PRD) v1.0

| Field | Value |
|-------|-------|
| **Status** | FINAL & FROZEN |
| **Version** | 1.0 |
| **Product Owner** | LOT Property Group |

---

## 1. Executive Summary

LOT Property adalah platform gamification internal LOT Property yang dirancang untuk meningkatkan produktivitas, engagement, kompetisi sehat, pembelajaran, dan retensi agent.

**Sistem menggabungkan:**

- Hall of Fame
- Weekly Leaderboard
- XP & Level Progression
- Badge Achievement
- Academy
- Listing CRM
- Prospect CRM

> Tujuan utama LOT Property adalah mengubah aktivitas harian agent menjadi sistem progression yang menyenangkan dan transparan.

---

## 2. Product Vision

Menjadi platform internal yang membuat setiap agent LOT Property:

- Lebih produktif
- Lebih konsisten
- Lebih kompetitif
- Lebih mudah berkembang

melalui sistem penghargaan yang jelas.

---

## 3. Success Metrics

**KPI Utama:**

- Daily Active Agent
- Weekly Active Agent
- Listing Submission
- Prospect Submission
- Academy Completion
- Recruit Growth
- Commission Claim Activity

---

## 4. User Roles

### 4.1 Agent

**Dapat:**
- Login
- Submit Listing
- Submit Prospect
- Submit Content
- Submit Listing Promotion
- Claim Commission
- Mengakses Academy
- Melihat Hall of Fame
- Melihat Leaderboard
- Mengatur Featured Badge

**Tidak dapat:**
- Approve Data
- Edit XP
- Manage Event

---

### 4.2 Office Manager

**Dapat:**
- Approve Registration
- Input Recruit
- Manage Event
- Send Company Message
- Manage Hall of Fame Manual Categories

**Tidak dapat:**
- Approve Commission
- XP Adjustment

---

### 4.3 Finance

**Dapat:**
- Verify Commission Claim
- Approve Commission Claim
- Reject Commission Claim
- Melihat Transaction Data

**Tidak dapat:**
- Hall of Fame Management
- Event Management
- XP Adjustment

---

### 4.4 Super Admin

Akses penuh ke seluruh sistem.

**Dapat:**
- Agent Management
- Commission Verification
- Hall of Fame Management
- Academy Management
- Event Management
- XP Adjustment
- System Log

---

## 5. Authentication

### Login

Menggunakan:
- Email
- Password

### Registration

**Field:**
- Full Name
- Email
- Phone Number
- Office
- Password

> **Status setelah register:** Pending Approval

### Registration Flow

```
Register
  ↓
Pending Approval
  ↓
Office Manager Approve
  ↓
Account Active
```

### Account Status

| Status | Keterangan |
|--------|-----------|
| **Pending** | Belum dapat mengakses sistem |
| **Active** | Dapat menggunakan seluruh fitur sesuai role |
| **Suspended** | Tidak dapat login |

---

## 6. Navigation Structure

**Bottom Navigation:**

1. Home
2. Quest
3. My Listing
4. Prospect
5. Academy
6. Profile

**Top Right:** Notification Icon

---

## 7. Homepage

Homepage merupakan halaman utama agent.

**Urutan Section:**

1. Hero Profile
2. Event Banner
3. Hall of Fame
4. Weekly Leaderboard
5. My Progress
6. Active Quest

---

### 7.1 Hero Profile

Menampilkan:
- Profile Picture
- Agent Name
- Current Title
- Current Level
- XP Progress
- Next Rank

---

### 7.2 Event Banner

Menampilkan event aktif.

> Jika tidak ada event aktif: Section disembunyikan.

Klik banner → Masuk ke Event Detail Page.

---

### 7.3 Hall of Fame

**Kategori:**
- Top Commission
- Top Unit
- Top Primary & KPR
- Rising Star
- Top Content Creator
- Top Listing
- Top Prospecting
- Top Recruit

**Menampilkan:**
- Top 5 Agent
- Profile Photo
- Agent Name
- 3 Featured Badge

> Klik agent → Masuk ke Profile Page.
> Tidak menampilkan angka pencapaian.

---

### 7.4 Weekly Leaderboard

Menampilkan Top 10 Agent berdasarkan XP minggu berjalan.

**Menampilkan:**
- Rank
- Profile Photo
- Agent Name
- Weekly XP
- 3 Featured Badge

> Klik agent → Masuk ke Profile Page.

---

### 7.5 My Progress

Menampilkan:
- Current Level
- Current XP
- XP Required for Next Level
- Progress Bar

---

### 7.6 Active Quest

Menampilkan ringkasan:
- Daily Quest
- Activity Quest
- Weekly Bonus

> Klik → Masuk ke Quest Page.

---

## 8. Quest System

Quest merupakan pusat progression agent.

**Tujuan:**
- Membentuk kebiasaan produktif
- Memberikan XP
- Mendorong engagement harian
- Meningkatkan adopsi sistem

### Quest Structure

1. Daily Quest
2. Activity Quest
3. Weekly Bonus

---

### 8.1 Daily Quest

Digunakan untuk menghitung streak.

**Badge terkait:**
- Dedicated Agent
- Exceptional Agent
- Perfectionist Agent

#### Daily Login

| | |
|-|-|
| **Reward** | **+100 XP** |

#### New Listing

| | |
|-|-|
| **Reward** | **+100 XP** |
| **XP Cap** | 300 XP per hari |

> Listing tetap dapat diinput tanpa batas.
> Progress badge tetap dihitung.

#### New Content

Input URL:
- Instagram
- TikTok
- YouTube Shorts

| | |
|-|-|
| **Reward** | **+300 XP** |
| **Maksimal** | 1 konten per hari |

#### Listing Promotion

Input URL:
- Rumah123
- OLX
- Lamudi
- Threads

| | |
|-|-|
| **Reward** | **+100 XP** |
| **XP Cap** | 300 XP per hari |
| **Maksimum** | 3 submission per hari |

#### Daily Quest Complete

**Syarat:**
- Daily Login ✓
- New Listing ✓
- New Content ✓
- Listing Promotion ✓

**Reward:** Streak **+1 Hari**

---

### 8.2 Activity Quest

> Tidak mempengaruhi streak.

#### New Prospect

| | |
|-|-|
| **Reward** | **+100 XP** |
| **Input** | Unlimited |
| **XP Cap** | 2.000 XP per minggu |

> Progress badge tetap dihitung tanpa batas.

#### New Recruit

| | |
|-|-|
| **Reward** | **+5.000 XP** |

> XP diberikan saat Admin input recruit.

#### Claim Commission

| | |
|-|-|
| **Reward** | Mengikuti Commission XP Matrix |

> XP diberikan setelah Finance Approve.

#### Complete Module

| | |
|-|-|
| **Reward** | **+200 XP** per video |

> Tidak termasuk Daily Quest.

#### Event Participation

**Reward:** Sesuai event. Dapat berupa:
- XP
- Badge
- Keduanya

---

### 8.3 Weekly Bonus

#### Prospect Clearance

| | |
|-|-|
| **Reward** | **+1.000 XP** |
| **Maksimum** | 1× per minggu |

**Requirement:**
- Tidak ada reminder overdue
- Tidak ada reminder aktif tersisa

---

## 9. My Listing

Tujuan: Membantu agent mengelola listing aktif serta menjaga kualitas database listing.

> My Listing berfungsi sebagai mini CRM listing.

### Listing Overview

Menampilkan:
- Total Listing
- Active Listing
- Inactive Listing
- Closed Listing

### Search

Pencarian berdasarkan:
- Nama Pemilik
- Nomor HP
- Alamat Property

### Filter

- Status
- Tipe Property
- Area

### Add New Listing

**Required Field:**

| Field | Keterangan |
|-------|-----------|
| Nama Pemilik | — |
| Nomor HP | — |
| Alamat Property | — |
| Harga | — |
| Tipe Property | Rumah / Apartemen / Ruko / Office / Gudang / Tanah / Komersial |

**Optional Field:**

| Field | Keterangan |
|-------|-----------|
| Luas Tanah (m²) | — |
| Luas Bangunan (m²) | — |
| Jumlah Lantai | — |
| Sertifikat | SHM / HGB / PPJB / Girik / Lainnya |
| Komisi (%) | — |
| Catatan | — |

### Listing Status

| Status | Keterangan |
|--------|-----------|
| **Active** | Listing aktif dan ditampilkan |
| **Inactive** | Listing tidak aktif sementara |
| **Closed** | Property sudah terjual atau tersewakan |

### Reminder System

| Hari | Aksi |
|------|------|
| Hari ke-14 | Reminder pertama |
| Hari ke-30 | Reminder kedua |
| Hari ke-60 | Reminder ketiga |
| Hari ke-90 | System merekomendasikan status Inactive |

### Quick Actions

- Edit
- Update
- Inactive
- Closed

### Listing Badge Progress

| Badge | Requirement |
|-------|------------|
| First Listing | 1 Listing |
| Listing Supplier | 25 Listing |
| Listing Distributor | 50 Listing |
| Listing Factory | 100 Listing |

### XP Rules

| Aksi | XP |
|------|----|
| New Listing | **+100 XP** |
| XP Cap | 300 XP per hari (3 listing per hari) |

> Listing tetap dapat diinput tanpa batas.
> Progress badge tetap dihitung tanpa batas.

### Hall of Fame Integration

**Top Listing:** Dihitung otomatis berdasarkan jumlah listing baru pada periode berjalan.

---

## 10. Prospect CRM

**Field:**
- Prospect Name
- Phone Number
- Notes
- Next Action

### Next Action

| Status | |
|--------|--|
| Follow Up | Reminder wajib |
| Showing | Reminder wajib |
| Akad | Reminder wajib |
| Deal | Tidak perlu reminder |
| Lost | Tidak perlu reminder |

### Prospect Badge Progress

| Badge | Requirement |
|-------|------------|
| First Prospect | 1 Prospect |
| Prospect Hunter | 25 Prospect |
| Prospect Tycoon | 50 Prospect |
| The Consultant | 100 Prospect |

---

## 11. Academy

**Kategori:**
- SOP Internal
- Sales Training
- Negotiation
- Marketing
- Social Media
- Product Knowledge
- Market Update
- Company Update

### Module Status

| Status | |
|--------|-|
| Not Started | — |
| In Progress | — |
| Completed | — |

### Academy XP

| Aksi | XP |
|------|----|
| Complete Module | **+200 XP** per video |

> Tidak ada batas harian.

### Academy Badge

| Badge | Requirement |
|-------|------------|
| Certified Agent | Complete 10 Module |
| The Professor | Complete 50 Module |

---

## 12. Profile Page

Profile merupakan halaman prestige utama setiap agent.

**Tujuan:**
- Menampilkan identitas agent
- Menampilkan pencapaian
- Menampilkan reputasi
- Menjadi halaman yang dapat dilihat agent lain

> Semua agent dapat melihat profile agent lain.

### Public Information

Ditampilkan kepada seluruh agent:
- Profile Photo
- Nama
- Current Level
- Current Title
- Hall of Fame History
- Featured Badge
- Badge Collection
- Total Transaction
- Total Listing
- Total Prospect
- Total Recruit
- Total Content

### Private Information

Hanya dapat dilihat oleh pemilik akun, Finance, dan Super Admin:
- **Total Commission**

---

### 12.1 Hero Section

Menampilkan:
- Large Profile Photo
- Agent Name
- Current Title
- Current Level
- Current XP
- Join Date

> **Layout:** Portrait Rectangle — tidak menggunakan foto bulat.
> Tujuan: Memberikan kesan premium dan prestisius.

---

### 12.2 Hall of Fame History

Menampilkan seluruh pencapaian Hall of Fame (terbaru ke terlama).

**Contoh:**
```
Top Commission #2  — August 2026
Top Listing #1     — September 2026
Top Recruit #5     — October 2026
```

---

### 12.3 Featured Badge

Agent dapat memilih maksimal **3 Badge**.

Badge ini akan tampil pada:
- Profile
- Hall of Fame
- Weekly Leaderboard

> Jika agent belum memilih: System otomatis memilih 3 badge pertama yang dimiliki.

---

### 12.4 Career Statistics

| Statistik | Visibilitas |
|-----------|------------|
| Total Transaction | Public |
| Total Listing | Public |
| Total Prospect | Public |
| Total Recruit | Public |
| Total Content | Public |
| **Total Commission** | **Private** (pemilik akun saja) |

---

### 12.5 Badge Collection

Menampilkan seluruh badge, dikelompokkan berdasarkan rarity:

| Rarity | Warna | |
|--------|-------|--|
| Mythic | Merah | 2 badge |
| Legendary | Emas | 9 badge |
| Epic | Ungu | 6 badge |
| Rare | Biru | 4 badge |
| Common | Abu-abu | 4 badge |

> Badge yang belum dimiliki: **Locked** — tetap ditampilkan beserta progress unlock.

---

## 13. Badge System

**Total Badge: 25**

> Agent dapat memilih 3 Featured Badge — tidak ditentukan oleh rarity, sepenuhnya pilihan agent.

### 🔴 MYTHIC (2)

| Badge | Requirement |
|-------|------------|
| Billionaire Club | Total Commission ≥ Rp 1.000.000.000 |
| Perfectionist Agent | Complete Daily Quest 100 Hari Berturut-turut |

### 🟡 LEGENDARY (9)

| Badge | Requirement |
|-------|------------|
| Listing Factory | 100 Listing |
| The Consultant | 100 Prospect |
| The Leader | 10 Recruit |
| The Professor | Complete 50 Module |
| Deal Maker | 100 Closed Transaction |
| 500 Million Club | Total Commission ≥ Rp 500.000.000 |
| 100 Million Club | Total Commission ≥ Rp 100.000.000 |
| The Influencer | 100 Content |
| Exceptional Agent | Complete Daily Quest 30 Hari Berturut-turut |

### 🟣 EPIC (6)

| Badge | Requirement |
|-------|------------|
| Listing Distributor | 50 Listing |
| Prospect Tycoon | 50 Prospect |
| Team Builder | 5 Recruit |
| Content Creator | 25 Content |
| Dedicated Agent | Complete Daily Quest 7 Hari Berturut-turut |
| Certified Agent | Complete 10 Module |

### 🔵 RARE (4)

| Badge | Requirement |
|-------|------------|
| Listing Supplier | 25 Listing |
| Prospect Hunter | 25 Prospect |
| Talent Scout | 3 Recruit |
| The Loyalist | Login 30 Hari Berturut-turut |

### ⚪ COMMON (4)

| Badge | Requirement |
|-------|------------|
| First Listing | 1 Listing |
| First Prospect | 1 Prospect |
| First Recruit | 1 Recruit |
| First Deal | 1 Closed Transaction |

### Badge Notification

> Saat badge unlock: System mengirim notification dan badge otomatis masuk ke Badge Collection.

---

## 14. XP System

XP digunakan untuk:
- Level Progression
- Weekly Leaderboard
- Profile Progress

> **XP tidak pernah reset.**

### XP Sources

| Sumber | XP | Cap |
|--------|----|-----|
| Daily Login | **+100 XP** | — |
| New Listing | **+100 XP** | 300 XP / hari |
| New Content | **+300 XP** | 1× / hari |
| Listing Promotion | **+100 XP** | 300 XP / hari |
| New Prospect | **+100 XP** | 2.000 XP / minggu |
| Prospect Clearance | **+1.000 XP** | 1× / minggu |
| New Recruit | **+5.000 XP** | — |
| Complete Module | **+200 XP** per video | — |
| Event Attendance | **+1.000 XP** | Sesuai event |
| Commission Claim | Lihat matrix di bawah | — |

### Commission XP Matrix

#### RENT

| Tipe Properti | XP |
|---------------|----|
| Apartemen | **+2.000 XP** |
| Rumah | **+3.000 XP** |
| Ruko | **+5.000 XP** |
| Office | **+5.000 XP** |
| Gudang | **+5.000 XP** |
| Tanah | **+5.000 XP** |

#### SALE

| Tipe Properti | XP |
|---------------|----|
| Apartemen | **+5.000 XP** |
| Rumah | **+7.500 XP** |
| Ruko | **+10.000 XP** |
| Office | **+10.000 XP** |
| Gudang | **+10.000 XP** |
| Tanah | **+10.000 XP** |
| Primary | **+10.000 XP** |

---

## 15. Level System

> Level bersifat **permanen**. Tidak pernah reset.

### Level Progression

| Level | Tier | XP Range |
|-------|------|----------|
| 1 – 19 | 🔘 Rookie Agent | 0 – 50.000 XP |
| 20 – 39 | 🔵 Junior Agent | 50.000 – 200.000 XP |
| 40 – 59 | 🟢 Senior Agent | 200.000 – 800.000 XP |
| 60 – 79 | 🟣 Elite Agent | 800.000 – 2.000.000 XP |
| 80 – 98 | 🟡 Super Elite Agent | 2.000.000 – 5.000.000 XP |
| 99 | 🔴 LOT Legendary | 5.000.000+ XP |

### Level Display

Ditampilkan pada:
- Homepage
- Profile
- Hall of Fame
- Weekly Leaderboard

### Level Guide

```
Profile → View Level Guide
```

Menampilkan:
- Semua level
- XP requirement
- XP sources
- Progress saat ini

### Weekly Leaderboard Integration

> Semua XP yang didapat pada minggu berjalan akan dihitung ke Weekly Leaderboard.
> **Reset:** Setiap Senin 00:00 WIB.

---

## 16. Hall of Fame System

Hall of Fame merupakan sistem penghargaan bulanan untuk agent terbaik.

**Tujuan:**
- Memberikan pengakuan
- Meningkatkan kompetisi sehat
- Menampilkan agent berprestasi

### Hall of Fame Period

| | |
|-|-|
| **Periode** | Bulanan (Monthly) |
| **Reset** | Tanggal 1 setiap bulan |

### Hall of Fame Categories

| # | Kategori | Perhitungan |
|---|----------|-------------|
| 1 | Top Commission | Otomatis — approved commission terbesar |
| 2 | Top Unit | Otomatis — transaksi approved terbanyak |
| 3 | Top Primary & KPR | Manual — input admin akhir bulan |
| 4 | Rising Star | Manual — agent first closing |
| 5 | Top Content Creator | Otomatis — content submission terbanyak |
| 6 | Top Listing | Otomatis — listing baru terbanyak |
| 7 | Top Prospecting | Otomatis — prospect baru terbanyak |
| 8 | Top Recruit | Manual — berdasarkan data recruit |

### Hall of Fame Display

**Menampilkan:**
- Profile Photo
- Agent Name
- Ranking
- 3 Featured Badge

**Tidak menampilkan:**
- Total Commission
- Jumlah Unit
- Jumlah Listing
- Jumlah Prospect
- Jumlah Recruit

> Hall of Fame menjadi simbol prestasi, bukan membuka data pribadi.

### Hall of Fame History

Top 5 seluruh kategori akan masuk ke Hall of Fame History pada profile agent. History bersifat **permanen**.

**Contoh:**
```
Top Listing #1     — August 2026
Top Recruit #4     — September 2026
Top Commission #2  — October 2026
```

### Hall of Fame Notification

> Saat Hall of Fame dipublikasikan: System mengirim notification kepada pemenang.

---

## 17. Weekly Leaderboard

Weekly Leaderboard menampilkan agent dengan XP tertinggi pada minggu berjalan.

### Ranking Period

| | |
|-|-|
| **Periode** | Mingguan |
| **Reset** | Setiap Senin 00:00 WIB |

### Ranking Logic

XP dihitung dari semua sumber dalam minggu berjalan:
- Daily Login
- Listing
- Content
- Promotion
- Prospect
- Recruit
- Academy
- Event
- Commission

### Leaderboard Display

- Ranking
- Profile Photo
- Agent Name
- Weekly XP
- 3 Featured Badge

> Homepage menampilkan Top 10 Weekly Leaderboard.

### Tie Break Rule

> Jika XP sama: Agent yang mencapai XP tersebut **lebih dahulu** akan berada di ranking lebih tinggi.

### Weekly Leaderboard Notification

> System dapat mengirim notification kepada **Top 3 Weekly Leaderboard**.

---

## 18. Notification System

> Notification bertujuan memberikan informasi penting tanpa menciptakan spam.

### Notification Categories

| Kategori | Contoh |
|----------|--------|
| **Action Required** | Listing Reminder — Listing membutuhkan update |
| **Action Required** | Prospect Reminder — Follow Up / Showing / Akad hari ini |
| **Achievement** | Badge Unlocked — Anda mendapatkan badge The Consultant |
| **Achievement** | Level Up — Anda mencapai level Senior Agent |
| **Achievement** | Hall of Fame — Anda masuk Hall of Fame Top Listing #2 |
| **Commission** | Approved — Commission Claim Disetujui. +7.500 XP |
| **Commission** | Rejected — Commission Claim Ditolak. Alasan: Komisi belum cair |
| **Community** | Legendary / Mythic badge — Michael mendapatkan Billionaire Club |
| **Company Message** | Broadcast dari management |

> **Community Achievement** hanya untuk Legendary Badge dan Mythic Badge.
> Klik notifikasi Community → Masuk ke profile agent tersebut.

### Company Message

- Target: Semua Agent atau Agent Tertentu
- Broadcast Only — tidak tersedia fitur reply

### Notification Storage

> Notification tersimpan dalam Notification Center. Agent dapat melihat riwayat notification sebelumnya.

---

## 19. Event System

Event digunakan untuk meningkatkan engagement dan aktivitas komunitas.

### Event Components

Admin dapat menentukan:
- Event Banner
- Event Cover
- Event Title
- Event Description
- Event Period
- XP Reward
- Badge Reward

### Event Flow

```
Homepage Banner
  ↓
Event Detail
  ↓
Submit Requirement (URL only)
  ↓
Admin Verification
  ↓
Reward
```

> Upload file tidak digunakan — submission menggunakan URL (Instagram / TikTok / YouTube).

### Event Verification

| Status | Aksi |
|--------|------|
| **Pending** | Menunggu verifikasi admin |
| **Approved** | System memberikan XP Reward + Badge Reward + Notification |
| **Rejected** | System mengirim alasan penolakan |

### Event Badge

> Badge event bersifat **permanen** — masuk ke Badge Collection dan tidak akan hilang setelah event selesai.

### Event Visibility

> Event aktif tampil pada Homepage Banner. Jika tidak ada event aktif: Banner disembunyikan.

**Contoh Event:**

| | |
|-|-|
| **Nama** | 17 Agustusan — Lomba Konten |
| **Reward** | 100.000 XP Pool |
| **Badge** | Merdeka Creator |

---

## 20. Commission Claim Flow

Commission Claim menggunakan **Google Form existing LOT Property**.

**Tujuan:**
- Mempertahankan workflow yang sudah familiar bagi agent
- Menjadi sumber data transaksi LOT Property
- Menjadi dasar XP, badge, statistics, dan Hall of Fame

> **Lokasi:** Quest Page — posisi paling atas.

### Commission Flow

```
Agent
  ↓
Klik Claim Commission
  ↓
Google Form
  ↓
Submit
  ↓
Google Sheet
  ↓
Finance Verification
  ↓
Approved / Rejected
```

### Approved Flow

Saat claim disetujui, system otomatis:
- Menambah XP
- Menambah Total Transaction
- Menambah Total Commission
- Menambah Progress Badge
- Mengupdate Weekly Leaderboard
- Mengupdate Profile Statistics
- Mengupdate Hall of Fame Data
- Mengirim Notification

### Rejected Flow

Finance wajib mengisi alasan reject:
- Komisi belum cair
- Data tidak lengkap
- Salah input
- Duplikasi claim

> **Duplicate Claim:** Tidak ada pengecekan otomatis — verifikasi dilakukan manual oleh Finance.

### Commission Badge Automation

| Badge | Threshold |
|-------|-----------|
| 100 Million Club | ≥ Rp 100.000.000 |
| 500 Million Club | ≥ Rp 500.000.000 |
| Billionaire Club | ≥ Rp 1.000.000.000 |

> Hanya transaksi **Approved** yang dihitung. Rejected tidak dihitung.

---

## 21. Admin Panel

### Admin Roles & Permissions

| Fitur | Super Admin | Office Manager | Finance |
|-------|:-----------:|:--------------:|:-------:|
| Agent Management | ✅ | ✅ (Approve/Suspend) | ❌ |
| Commission Verification | ✅ | ❌ | ✅ |
| Hall of Fame Management | ✅ | ✅ (Manual) | ❌ |
| Academy Management | ✅ | ❌ | ❌ |
| Event Management | ✅ | ✅ | ❌ |
| XP Adjustment | ✅ | ❌ | ❌ |
| System Log | ✅ | ❌ | ❌ |
| Input Recruit | ✅ | ✅ | ❌ |
| Company Message | ✅ | ✅ | ❌ |
| View Transaction Data | ✅ | ❌ | ✅ |

### Agent Management

**Menampilkan:** Name · Email · Phone · Join Date · Current Level · Status

**Actions:** Approve · Suspend · Reactivate

### Recruit Management

**Field:** Recruit Name · Phone Number · Mentor · Join Date

Saat Save:
- Recruit Count bertambah
- XP Mentor bertambah
- Badge Progress bertambah

### Commission Verification

**Status:** Pending · Approved · Rejected

**Actions:** Approve · Reject · Multi Select Approve · Approve All

### Hall of Fame Management

**Manual Category:** Top Primary & KPR · Rising Star · Top Recruit

**Field:** Agent · Ranking · Period · Notes

### Academy Management

- Upload Module
- Edit Module
- Delete Module
- Create Category

### Event Management

- Create Event
- Edit Event
- Upload Banner
- Verification
- Reward Setup

### XP Adjustment (Super Admin Only)

**Actions:** Add XP · Deduct XP

**Field:** Agent · XP Amount · Reason

### System Log

Mencatat:
- XP Adjustment
- Commission Approval
- Event Approval
- Hall of Fame Changes
- Recruit Input

---

## 22. Data Migration

**Migration Start Date:** 1 Januari 2025

### Data Yang Dimigrasikan

| Data | Digunakan untuk |
|------|----------------|
| Commission Data | Total Commission · Commission Badge · Hall of Fame History |
| Transaction Data | Total Transaction · Deal Maker Badge |
| Recruit Data | Total Recruit · Recruit Badge |
| Hall of Fame History | Data historis sejak 2025 |

### Data Yang Tidak Dimigrasikan

> Semua data berikut dimulai dari **nol**:
- Daily Quest History
- Weekly Leaderboard History
- Notification History
- Event History

---

## 23. Business Rules

### Daily Streak

| Kondisi | Hasil |
|---------|-------|
| Seluruh Daily Quest selesai | Streak **+1 Hari** |
| Daily Quest tidak selesai | Streak kembali ke **0** |

**Daily Quest Components:**
- Daily Login
- New Listing
- New Content
- Listing Promotion

### XP Rules Ringkasan

| Aktivitas | XP | Cap |
|-----------|----|----|
| Prospect | +100 XP | 2.000 XP / minggu |
| Listing | +100 XP | 300 XP / hari |
| Content | +300 XP | 1 submission / hari |
| Listing Promotion | +100 XP | 300 XP / hari |
| Academy Module | +200 XP / video | Tidak ada batas |
| Recruit | +5.000 XP | — |

### Visibility Rules

| Data | Visibilitas |
|------|------------|
| Level · Title · Badge · Statistics | Public |
| Total Commission | Private |
| Hall of Fame (angka) | Tidak ditampilkan — hanya ranking & badge |
| Featured Badge | Dipilih agent, maks 3 |

### Reset Schedule

| Item | Reset |
|------|-------|
| Weekly Leaderboard | Setiap Senin 00:00 WIB |
| Hall of Fame | Bulanan (tanggal 1) |
| XP & Level | **Tidak pernah reset** |

### Community Achievement

> Notification Community Achievement hanya untuk **Legendary Badge** dan **Mythic Badge**.

### Event Submission

> URL Only — tidak menggunakan upload file.

---

## 24. MVP Scope

**Fitur yang termasuk dalam MVP:**

| # | Fitur |
|---|-------|
| 1 | Authentication |
| 2 | Homepage |
| 3 | Quest |
| 4 | My Listing |
| 5 | Prospect CRM |
| 6 | Academy |
| 7 | Profile |
| 8 | Badge System |
| 9 | XP System |
| 10 | Level System |
| 11 | Hall of Fame |
| 12 | Weekly Leaderboard |
| 13 | Notification |
| 14 | Event |
| 15 | Admin Panel |
| 16 | Commission Integration |

---

*LOT Property PRD v1.0 — FINAL & FROZEN*
*Product Owner: LOT Property Group*

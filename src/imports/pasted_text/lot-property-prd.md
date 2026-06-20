LOT PROPERTY
Product Requirement Document (PRD) v1.0
Status: FINAL & FROZEN
Version: 1.0
Product Owner: LOT Property Group
________________________________________
1. Executive Summary
LOT Property adalah platform gamification internal LOT Property yang dirancang untuk meningkatkan produktivitas, engagement, kompetisi sehat, pembelajaran, dan retensi agent.
Sistem menggabungkan:
●	Hall of Fame
●	Weekly Leaderboard
●	XP & Level Progression
●	Badge Achievement
●	Academy
●	Listing CRM
●	Prospect CRM
Tujuan utama LOT Property adalah mengubah aktivitas harian agent menjadi sistem progression yang menyenangkan dan transparan.
________________________________________
2. Product Vision
Menjadi platform internal yang membuat setiap agent LOT Property:
●	Lebih produktif
●	Lebih konsisten
●	Lebih kompetitif
●	Lebih mudah berkembang
melalui sistem penghargaan yang jelas.
________________________________________
3. Success Metrics
KPI Utama:
●	Daily Active Agent
●	Weekly Active Agent
●	Listing Submission
●	Prospect Submission
●	Academy Completion
●	Recruit Growth
●	Commission Claim Activity
________________________________________
4. User Roles
4.1 Agent
Dapat:
●	Login
●	Submit Listing
●	Submit Prospect
●	Submit Content
●	Submit Listing Promotion
●	Claim Commission
●	Mengakses Academy
●	Melihat Hall of Fame
●	Melihat Leaderboard
●	Mengatur Featured Badge
Tidak dapat:
●	Approve Data
●	Edit XP
●	Manage Event
________________________________________
4.2 Office Manager
Dapat:
●	Approve Registration
●	Input Recruit
●	Manage Event
●	Send Company Message
●	Manage Hall of Fame Manual Categories
Tidak dapat:
●	Approve Commission
●	XP Adjustment
________________________________________
4.3 Finance
Dapat:
●	Verify Commission Claim
●	Approve Commission Claim
●	Reject Commission Claim
●	Melihat Transaction Data
Tidak dapat:
●	Hall of Fame Management
●	Event Management
●	XP Adjustment
________________________________________
4.4 Super Admin
Akses penuh ke seluruh sistem.
Dapat:
●	Agent Management
●	Commission Verification
●	Hall of Fame Management
●	Academy Management
●	Event Management
●	XP Adjustment
●	System Log
________________________________________
5. Authentication
Login
Menggunakan:
●	Email
●	Password
________________________________________
Registration
Field:
●	Full Name
●	Email
●	Phone Number
●	Office
●	Password
Status setelah register:
Pending Approval
________________________________________
Registration Flow
Register
 ↓
 Pending Approval
 ↓
 Office Manager Approve
 ↓
 Account Active
________________________________________
Account Status
Pending
Belum dapat mengakses sistem.
Active
Dapat menggunakan seluruh fitur sesuai role.
Suspended
Tidak dapat login.
________________________________________
6. Navigation Structure
Bottom Navigation:
1.	Home
2.	Quest
3.	My Listing
4.	Prospect
5.	Academy
6.	Profile
Top Right:
Notification Icon
________________________________________
7. Homepage
Homepage merupakan halaman utama agent.
Urutan Section:
1.	Hero Profile
2.	Event Banner
3.	Hall of Fame
4.	Weekly Leaderboard
5.	My Progress
6.	Active Quest
________________________________________
7.1 Hero Profile
Menampilkan:
●	Profile Picture
●	Agent Name
●	Current Title
●	Current Level
●	XP Progress
●	Next Rank
________________________________________
7.2 Event Banner
Menampilkan event aktif.
Jika tidak ada event aktif:
Section disembunyikan.
Klik banner:
Masuk ke Event Detail Page.
________________________________________
7.3 Hall of Fame
Kategori:
●	Top Commission
●	Top Unit
●	Top Primary & KPR
●	Rising Star
●	Top Content Creator
●	Top Listing
●	Top Prospecting
●	Top Recruit
Menampilkan:
●	Top 5 Agent
●	Profile Photo
●	Agent Name
●	3 Featured Badge
Klik agent:
Masuk ke Profile Page.
Tidak menampilkan angka pencapaian.
________________________________________
7.4 Weekly Leaderboard
Menampilkan:
Top 10 Agent berdasarkan XP minggu berjalan.
Menampilkan:
●	Rank
●	Profile Photo
●	Agent Name
●	Weekly XP
●	3 Featured Badge
Klik agent:
Masuk ke Profile Page.
________________________________________
7.5 My Progress
Menampilkan:
●	Current Level
●	Current XP
●	XP Required for Next Level
●	Progress Bar
________________________________________
7.6 Active Quest
Menampilkan ringkasan:
●	Daily Quest
●	Activity Quest
●	Weekly Bonus
Klik:
Masuk ke Quest Page.

LOT PROPERTY PRD v1.0
PART 2 – QUEST, MY LISTING, PROSPECT CRM & ACADEMY
8. Quest System
Quest merupakan pusat progression agent.
Tujuan:
●	Membentuk kebiasaan produktif
●	Memberikan XP
●	Mendorong engagement harian
●	Meningkatkan adopsi sistem
________________________________________
Quest Structure
1.	Daily Quest
2.	Activity Quest
3.	Weekly Bonus
________________________________________
Daily Quest
Digunakan untuk menghitung streak.
Badge terkait:
●	Dedicated Agent
●	Exceptional Agent
●	Perfectionist Agent
________________________________________
Daily Login
Reward:
+100 XP
________________________________________
New Listing
Reward:
+100 XP
XP Cap:
300 XP per hari
Listing tetap dapat diinput tanpa batas.
Progress badge tetap dihitung.
________________________________________
New Content
Input URL:
●	Instagram
●	TikTok
●	YouTube Shorts
Reward:
+300 XP
Maksimal:
1 konten per hari.
________________________________________
Listing Promotion
Input URL:
●	Rumah123
●	OLX
●	Lamudi
●	Threads
Reward:
+100 XP
XP Cap:
300 XP per hari
Maksimum:
3 submission per hari.
________________________________________
Daily Quest Complete
Syarat:
●	Daily Login
●	New Listing
●	New Content
●	Listing Promotion
Reward:
Streak +1 Hari
________________________________________
Activity Quest
Tidak mempengaruhi streak.
________________________________________
New Prospect
Reward:
+100 XP
Input:
Unlimited
XP Cap:
2.000 XP per minggu
Progress badge tetap dihitung tanpa batas.
________________________________________
New Recruit
Reward:
+5.000 XP
XP diberikan saat Admin input recruit.
________________________________________
Claim Commission
Reward:
Mengikuti Commission XP Matrix.
XP diberikan setelah Finance Approve.
________________________________________
Complete Module
Reward:
+200 XP
Per video.
Tidak termasuk Daily Quest.
________________________________________
Event Participation
Reward:
Sesuai event.
Dapat berupa:
●	XP
●	Badge
●	Keduanya
________________________________________
Weekly Bonus
Prospect Clearance
Reward:
+1.000 XP
Maksimum:
1x per minggu.
Requirement:
●	Tidak ada reminder overdue
●	Tidak ada reminder aktif tersisa
________________________________________
9. My Listing
Tujuan:
Membantu agent mengelola listing aktif serta menjaga kualitas database listing.
My Listing berfungsi sebagai mini CRM listing.
________________________________________
Listing Overview
Menampilkan:
●	Total Listing
●	Active Listing
●	Inactive Listing
●	Closed Listing
________________________________________
Search
Pencarian berdasarkan:
●	Nama Pemilik
●	Nomor HP
●	Alamat Property
________________________________________
Filter
●	Status
●	Tipe Property
●	Area
________________________________________
Add New Listing
Required Field
Nama Pemilik
Nomor HP
Alamat Property
Harga
Tipe Property
Pilihan:
●	Rumah
●	Apartemen
●	Ruko
●	Office
●	Gudang
●	Tanah
●	Komersial
________________________________________
Optional Field
Luas Tanah (m²)
Luas Bangunan (m²)
Jumlah Lantai
Sertifikat
Pilihan:
●	SHM
●	HGB
●	PPJB
●	Girik
●	Lainnya
Komisi (%)
Catatan
________________________________________
Listing Status
Active
Listing aktif dan ditampilkan.
________________________________________
Inactive
Listing tidak aktif sementara.
________________________________________
Closed
Property sudah terjual atau tersewakan.
________________________________________
Reminder System
Hari ke-14
Reminder pertama.
________________________________________
Hari ke-30
Reminder kedua.
________________________________________
Hari ke-60
Reminder ketiga.
________________________________________
Hari ke-90
System merekomendasikan status Inactive.
________________________________________
Quick Actions
●	Edit
●	Update
●	Inactive
●	Closed
________________________________________
Listing Statistics
Digunakan untuk:
●	XP Calculation
●	Badge Progress
●	Hall of Fame Top Listing
●	Profile Statistics
________________________________________
Listing Badge Progress
First Listing
1 Listing
________________________________________
Listing Supplier
25 Listing
________________________________________
Listing Distributor
50 Listing
________________________________________
Listing Factory
100 Listing
________________________________________
XP Rules
New Listing
+100 XP
________________________________________
XP Cap
300 XP per hari
(3 listing per hari)
________________________________________
Listing tetap dapat diinput tanpa batas.
Progress badge tetap dihitung tanpa batas.
________________________________________
Hall of Fame Integration
Top Listing
Dihitung otomatis berdasarkan jumlah listing baru pada periode berjalan.
________________________________________
10. Prospect CRM
Field:
●	Prospect Name
●	Phone Number
●	Notes
●	Next Action
________________________________________
Next Action
●	Follow Up
●	Showing
●	Akad
●	Deal
●	Lost
________________________________________
Reminder Logic
Reminder wajib jika:
●	Follow Up
●	Showing
●	Akad
________________________________________
Tidak diperlukan jika:
●	Deal
●	Lost
________________________________________
Prospect Badge
First Prospect
1 Prospect
________________________________________
Prospect Hunter
25 Prospect
________________________________________
Prospect Tycoon
50 Prospect
________________________________________
The Consultant
100 Prospect
________________________________________
11. Academy
Kategori:
●	SOP Internal
●	Sales Training
●	Negotiation
●	Marketing
●	Social Media
●	Product Knowledge
●	Market Update
●	Company Update
________________________________________
Module Status
●	Not Started
●	In Progress
●	Completed
________________________________________
Academy XP
Complete Module
+200 XP
Per video.
Tidak ada batas harian.
________________________________________
Academy Badge
Certified Agent
Complete 10 Module
________________________________________
The Professor
Complete 50 Module
LOT PROPERTY PRD v1.0
PART 3 – PROFILE, BADGE SYSTEM, XP SYSTEM & LEVEL SYSTEM
12. Profile Page
Profile merupakan halaman prestige utama setiap agent.
Tujuan:
●	Menampilkan identitas agent
●	Menampilkan pencapaian
●	Menampilkan reputasi
●	Menjadi halaman yang dapat dilihat agent lain
________________________________________
Profile Visibility
Semua agent dapat melihat profile agent lain.
________________________________________
Public Information
Ditampilkan kepada seluruh agent:
●	Profile Photo
●	Nama
●	Current Level
●	Current Title
●	Hall of Fame History
●	Featured Badge
●	Badge Collection
●	Total Transaction
●	Total Listing
●	Total Prospect
●	Total Recruit
●	Total Content
________________________________________
Private Information
Hanya dapat dilihat oleh:
●	Pemilik akun
●	Finance
●	Super Admin
Field:
Total Commission
________________________________________
12.1 Hero Section
Menampilkan:
●	Large Profile Photo
●	Agent Name
●	Current Title
●	Current Level
●	Current XP
●	Join Date
Layout:
Portrait Rectangle
Tidak menggunakan foto bulat.
Tujuan:
Memberikan kesan premium dan prestisius.
________________________________________
12.2 Hall of Fame History
Menampilkan seluruh pencapaian Hall of Fame.
Contoh:
Top Commission #2
 August 2026
Top Listing #1
 September 2026
Top Recruit #5
 October 2026
Urutan:
Terbaru ke terlama.
________________________________________
12.3 Featured Badge
Agent dapat memilih:
Maksimal 3 Badge.
Badge ini akan tampil pada:
●	Profile
●	Hall of Fame
●	Weekly Leaderboard
Jika agent belum memilih:
System otomatis memilih 3 badge pertama yang dimiliki.
________________________________________
12.4 Career Statistics
Menampilkan:
●	Total Transaction
●	Total Listing
●	Total Prospect
●	Total Recruit
●	Total Content
Total Commission hanya tampil untuk pemilik akun.
________________________________________
12.5 Badge Collection
Menampilkan seluruh badge.
Dikelompokkan berdasarkan rarity:
●	Mythic
●	Legendary
●	Epic
●	Rare
●	Common
Badge yang belum dimiliki:
Locked
Tetap ditampilkan beserta progress unlock.
________________________________________
13. Badge System
Total Badge:
25 Badge
________________________________________
Badge Visibility
Agent dapat memilih:
3 Featured Badge
Tidak ditentukan oleh rarity.
Sepenuhnya pilihan agent.
________________________________________
MYTHIC (2)
Billionaire Club
Requirement:
Total Commission ≥ Rp1.000.000.000
________________________________________
Perfectionist Agent
Requirement:
Complete Daily Quest
 100 Hari Berturut-turut
________________________________________
LEGENDARY (9)
Listing Factory
100 Listing
________________________________________
The Consultant
100 Prospect
________________________________________
The Leader
10 Recruit
________________________________________
The Professor
Complete 50 Module
________________________________________
Deal Maker
100 Closed Transaction
________________________________________
500 Million Club
Total Commission ≥ Rp500.000.000
________________________________________
100 Million Club
Total Commission ≥ Rp100.000.000
________________________________________
The Influencer
100 Content
________________________________________
Exceptional Agent
Complete Daily Quest
 30 Hari Berturut-turut
________________________________________
EPIC (6)
Listing Distributor
50 Listing
________________________________________
Prospect Tycoon
50 Prospect
________________________________________
Team Builder
5 Recruit
________________________________________
Content Creator
25 Content
________________________________________
Dedicated Agent
Complete Daily Quest
 7 Hari Berturut-turut
________________________________________
Certified Agent
Complete 10 Module
________________________________________
RARE (4)
Listing Supplier
25 Listing
________________________________________
Prospect Hunter
25 Prospect
________________________________________
Talent Scout
3 Recruit
________________________________________
The Loyalist
Login
 30 Hari Berturut-turut
________________________________________
COMMON (4)
First Listing
1 Listing
________________________________________
First Prospect
1 Prospect
________________________________________
First Recruit
1 Recruit
________________________________________
First Deal
1 Closed Transaction
________________________________________
Badge Notification
Saat badge unlock:
System mengirim notification.
Badge otomatis masuk ke Badge Collection.
________________________________________
14. XP System
XP digunakan untuk:
●	Level Progression
●	Weekly Leaderboard
●	Profile Progress
XP tidak pernah reset.
________________________________________
XP Sources
Daily Login
+100 XP
________________________________________
New Listing
+100 XP
XP Cap:
300 XP per hari
________________________________________
New Content
+300 XP
Maksimal:
1 per hari
________________________________________
Listing Promotion
+100 XP
XP Cap:
300 XP per hari
________________________________________
New Prospect
+100 XP
XP Cap:
2.000 XP per minggu
________________________________________
Prospect Clearance
+1.000 XP
Maksimal:
1x per minggu
________________________________________
New Recruit
+5.000 XP
________________________________________
Complete Module
+200 XP
Per video
________________________________________
Event Attendance
+1.000 XP
Atau mengikuti event
________________________________________
Commission Claim
Mengikuti Commission XP Matrix
________________________________________
Commission XP Matrix
RENT
Apartemen
+2.000 XP
________________________________________
Rumah
+3.000 XP
________________________________________
Ruko
+5.000 XP
________________________________________
Office
+5.000 XP
________________________________________
Gudang
+5.000 XP
________________________________________
Tanah
+5.000 XP
________________________________________
SALE
Apartemen
+5.000 XP
________________________________________
Rumah
+7.500 XP
________________________________________
Ruko
+10.000 XP
________________________________________
Office
+10.000 XP
________________________________________
Gudang
+10.000 XP
________________________________________
Tanah
+10.000 XP
________________________________________
Primary
+10.000 XP
________________________________________
15. Level System
Level bersifat permanen.
Tidak pernah reset.
________________________________________
Level Progression
Level 1–19
Rookie Agent
XP Range:
0 – 50.000 XP
________________________________________
Level 20–39
Junior Agent
XP Range:
50.000 – 200.000 XP
________________________________________
Level 40–59
Senior Agent
XP Range:
200.000 – 800.000 XP
________________________________________
Level 60–79
Elite Agent
XP Range:
800.000 – 2.000.000 XP
________________________________________
Level 80–98
Super Elite Agent
XP Range:
2.000.000 – 5.000.000 XP
________________________________________
Level 99
LOT Legendary
XP Range:
5.000.000+ XP
________________________________________
Level Display
Ditampilkan pada:
●	Homepage
●	Profile
●	Hall of Fame
●	Weekly Leaderboard
________________________________________
Level Guide
Menu:
Profile
 ↓
 View Level Guide
Menampilkan:
●	Semua level
●	XP requirement
●	XP sources
●	Progress saat ini
________________________________________
Weekly Leaderboard Integration
Semua XP yang didapat pada minggu berjalan akan dihitung ke Weekly Leaderboard.
Reset:
Setiap Senin
 00:00 WIB
LOT PROPERTY PRD v1.0
PART 4 – HALL OF FAME, WEEKLY LEADERBOARD, NOTIFICATION & EVENT SYSTEM
16. Hall of Fame System
Hall of Fame merupakan sistem penghargaan bulanan untuk agent terbaik.
Tujuan:
●	Memberikan pengakuan
●	Meningkatkan kompetisi sehat
●	Menampilkan agent berprestasi
________________________________________
Hall of Fame Period
Periode:
Bulanan (Monthly)
Reset:
Tanggal 1 setiap bulan.
________________________________________
Hall of Fame Categories
1.	Top Commission
2.	Top Unit
3.	Top Primary & KPR
4.	Rising Star
5.	Top Content Creator
6.	Top Listing
7.	Top Prospecting
8.	Top Recruit
________________________________________
Hall of Fame Display
Menampilkan:
●	Profile Photo
●	Agent Name
●	Ranking
●	3 Featured Badge
Tidak menampilkan:
●	Total Commission
●	Jumlah Unit
●	Jumlah Listing
●	Jumlah Prospect
●	Jumlah Recruit
Tujuan:
Hall of Fame menjadi simbol prestasi, bukan membuka data pribadi.
________________________________________
Hall of Fame History
Top 5 seluruh kategori akan masuk ke Hall of Fame History pada profile agent.
Contoh:
Top Listing #1
 August 2026
Top Recruit #4
 September 2026
Top Commission #2
 October 2026
History bersifat permanen.
________________________________________
Hall of Fame Logic
Automatic Categories
Top Commission
Dihitung otomatis.
Data Source:
Approved Commission Claim.
Formula:
Total commission terbesar pada periode berjalan.
________________________________________
Top Unit
Dihitung otomatis.
Data Source:
Approved Commission Claim.
Formula:
Jumlah transaksi approved terbanyak.
________________________________________
Top Listing
Dihitung otomatis.
Formula:
Jumlah listing baru terbanyak.
________________________________________
Top Prospecting
Dihitung otomatis.
Formula:
Jumlah prospect baru terbanyak.
________________________________________
Top Content Creator
Dihitung otomatis.
Formula:
Jumlah content submission terbanyak.
________________________________________
Manual Categories
Top Primary & KPR
Diinput admin setiap akhir bulan.
Value tidak ditampilkan ke publik.
________________________________________
Rising Star
Dipilih admin.
Kriteria:
Agent yang berhasil mendapatkan First Closing.
________________________________________
Top Recruit
Diinput admin.
Berdasarkan data recruit yang tercatat.
________________________________________
Hall of Fame Notification
Saat Hall of Fame dipublikasikan:
System mengirim notification kepada pemenang.
________________________________________
17. Weekly Leaderboard
Weekly Leaderboard menampilkan agent dengan XP tertinggi pada minggu berjalan.
________________________________________
Ranking Period
Periode:
Mingguan
Reset:
Setiap Senin
 00:00 WIB
________________________________________
Ranking Logic
Menggunakan:
Semua XP yang diperoleh selama minggu berjalan.
Termasuk:
●	Daily Login
●	Listing
●	Content
●	Promotion
●	Prospect
●	Recruit
●	Academy
●	Event
●	Commission
________________________________________
Leaderboard Display
Menampilkan:
●	Ranking
●	Profile Photo
●	Agent Name
●	Weekly XP
●	3 Featured Badge
________________________________________
Top 10 Display
Homepage menampilkan:
Top 10 Weekly Leaderboard.
________________________________________
Tie Break Rule
Jika XP sama:
Agent yang mencapai XP tersebut lebih dahulu akan berada di ranking lebih tinggi.
________________________________________
Weekly Leaderboard Notification
System dapat mengirim notification kepada:
Top 3 Weekly Leaderboard.
________________________________________
18. Notification System
Notification bertujuan memberikan informasi penting tanpa menciptakan spam.
________________________________________
Notification Categories
Action Required
Listing Reminder
Contoh:
Listing membutuhkan update.
________________________________________
Prospect Reminder
Contoh:
Follow Up hari ini.
Showing hari ini.
Akad hari ini.
________________________________________
Achievement
Badge Unlocked
Contoh:
Selamat!
Anda mendapatkan badge The Consultant.
________________________________________
Level Up
Contoh:
Selamat!
Anda mencapai level Senior Agent.
________________________________________
Hall of Fame Achievement
Contoh:
Anda masuk Hall of Fame Top Listing #2.
________________________________________
Commission Approved
Contoh:
Commission Claim Disetujui.
+7.500 XP.
________________________________________
Commission Rejected
Contoh:
Commission Claim Ditolak.
Alasan:
Komisi belum cair.
________________________________________
Community Achievement
Hanya untuk:
Legendary Badge
Mythic Badge
________________________________________
Contoh:
Michael mendapatkan Billionaire Club.
Klik notifikasi:
Masuk ke profile Michael.
________________________________________
Company Message
Broadcast dari management.
Target:
●	Semua Agent
●	Agent Tertentu
Tidak tersedia fitur reply.
________________________________________
Notification Storage
Notification tersimpan dalam Notification Center.
Agent dapat melihat riwayat notification sebelumnya.
________________________________________
19. Event System
Event digunakan untuk meningkatkan engagement dan aktivitas komunitas.
________________________________________
Event Components
Admin dapat menentukan:
●	Event Banner
●	Event Cover
●	Event Title
●	Event Description
●	Event Period
●	XP Reward
●	Badge Reward
________________________________________
Event Flow
Homepage Banner
 ↓
 Event Detail
 ↓
 Submit Requirement
 ↓
 Admin Verification
 ↓
 Reward
________________________________________
Event Submission
Submission menggunakan URL.
Contoh:
●	Instagram URL
●	TikTok URL
●	YouTube URL
Upload file tidak digunakan.
________________________________________
Event Verification
Status:
Pending
Approved
Rejected
________________________________________
Saat Approved:
System memberikan:
●	XP Reward
●	Badge Reward
●	Notification
________________________________________
Saat Rejected:
System mengirim alasan penolakan.
________________________________________
Event Badge
Badge event bersifat permanen.
Masuk ke Badge Collection.
Tidak akan hilang setelah event selesai.
________________________________________
Event Example
17 Agustusan
Lomba Konten
Reward:
100.000 XP Pool
Badge:
Merdeka Creator
________________________________________
Event Visibility
Event aktif tampil pada Homepage Banner.
Jika tidak ada event aktif:
Banner disembunyikan.
LOT PROPERTY PRD v1.0
PART 5 – COMMISSION FLOW, ADMIN PANEL, DATA MIGRATION, BUSINESS RULES & MVP SCOPE
20. Commission Claim Flow
Commission Claim menggunakan Google Form existing LOT Property.
Tujuan:
●	Mempertahankan workflow yang sudah familiar bagi agent.
●	Menjadi sumber data transaksi LOT Property.
●	Menjadi dasar XP, badge, statistics, dan Hall of Fame.
________________________________________
Claim Commission
Lokasi:
Quest Page
Posisi:
Paling atas.
Label:
Claim Commission
________________________________________
Flow
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
________________________________________
Approved Flow
Saat claim disetujui:
System otomatis:
●	Menambah XP
●	Menambah Total Transaction
●	Menambah Total Commission
●	Menambah Progress Badge
●	Mengupdate Weekly Leaderboard
●	Mengupdate Profile Statistics
●	Mengupdate Hall of Fame Data
●	Mengirim Notification
________________________________________
Rejected Flow
Finance wajib mengisi alasan reject.
Contoh:
●	Komisi belum cair
●	Data tidak lengkap
●	Salah input
●	Duplikasi claim
Notification:
Commission Claim Ditolak
Alasan:
 Komisi belum cair
________________________________________
Duplicate Claim
Tidak ada pengecekan otomatis.
Verifikasi dilakukan manual oleh Finance.
________________________________________
Commission Statistics
Hanya transaksi:
Approved
yang dihitung.
Rejected tidak dihitung.
________________________________________
Total Commission
Dihitung otomatis.
Formula:
Total seluruh komisi approved.
Digunakan untuk:
●	Profile
●	Badge
●	Hall of Fame Top Commission
________________________________________
Commission Badge Automation
100 Million Club
≥ Rp100.000.000
________________________________________
500 Million Club
≥ Rp500.000.000
________________________________________
Billionaire Club
≥ Rp1.000.000.000
________________________________________
21. Admin Panel
Admin Panel digunakan untuk seluruh operasional LOT Property.
________________________________________
Admin Roles
Super Admin
Akses penuh.
Dapat:
●	Agent Management
●	Commission Verification
●	Hall of Fame Management
●	Academy Management
●	Event Management
●	XP Adjustment
●	System Log
________________________________________
Office Manager
Dapat:
●	Approve Registration
●	Input Recruit
●	Hall of Fame Manual Category
●	Event Management
●	Company Message
Tidak dapat:
●	Verify Commission
●	XP Adjustment
________________________________________
Finance
Dapat:
●	Verify Commission
●	Approve Claim
●	Reject Claim
●	View Transaction Data
Tidak dapat:
●	Event
●	Hall of Fame
●	XP Adjustment
________________________________________
Agent Management
Menampilkan:
●	Name
●	Email
●	Phone
●	Join Date
●	Current Level
●	Status
Actions:
●	Approve
●	Suspend
●	Reactivate
________________________________________
Recruit Management
Field:
●	Recruit Name
●	Phone Number
●	Mentor
●	Join Date
Saat Save:
●	Recruit Count bertambah
●	XP Mentor bertambah
●	Badge Progress bertambah
________________________________________
Commission Verification
Status:
●	Pending
●	Approved
●	Rejected
Actions:
●	Approve
●	Reject
●	Multi Select Approve
●	Approve All
________________________________________
Hall of Fame Management
Manual Category:
●	Top Primary & KPR
●	Rising Star
●	Top Recruit
Field:
●	Agent
●	Ranking
●	Period
●	Notes
________________________________________
Academy Management
●	Upload Module
●	Edit Module
●	Delete Module
●	Create Category
________________________________________
Event Management
●	Create Event
●	Edit Event
●	Upload Banner
●	Verification
●	Reward Setup
________________________________________
Company Message
Target:
●	All Agent
●	Individual Agent
Broadcast Only
Tidak tersedia reply.
________________________________________
XP Adjustment
Super Admin dapat:
●	Add XP
●	Deduct XP
Field:
●	Agent
●	XP Amount
●	Reason
________________________________________
System Log
Mencatat:
●	XP Adjustment
●	Commission Approval
●	Event Approval
●	Hall of Fame Changes
●	Recruit Input
________________________________________
22. Data Migration
Migration Start Date:
1 Januari 2025
________________________________________
Data Yang Dimigrasikan
Commission Data
Digunakan untuk:
●	Total Commission
●	Commission Badge
●	Hall of Fame History
________________________________________
Transaction Data
Digunakan untuk:
●	Total Transaction
●	Deal Maker Badge
________________________________________
Recruit Data
Digunakan untuk:
●	Total Recruit
●	Recruit Badge
________________________________________
Hall of Fame History
Data historis Hall of Fame sejak 2025.
________________________________________
Data Yang Tidak Dimigrasikan
●	Daily Quest History
●	Weekly Leaderboard History
●	Notification History
●	Event History
Semua dimulai dari nol.
________________________________________
23. Business Rules
Daily Streak
Streak bertambah jika seluruh Daily Quest selesai.
________________________________________
Streak Reset
Jika Daily Quest tidak selesai:
Streak kembali ke 0.
________________________________________
Daily Quest Components
●	Daily Login
●	New Listing
●	New Content
●	Listing Promotion
________________________________________
Prospect XP
+100 XP
XP Cap:
2.000 XP per minggu
Progress badge tetap berjalan tanpa batas.
________________________________________
Listing XP
+100 XP
XP Cap:
300 XP per hari
Progress badge tetap berjalan tanpa batas.
________________________________________
Content XP
+300 XP
1 submission per hari.
________________________________________
Listing Promotion XP
+100 XP
XP Cap:
300 XP per hari.
________________________________________
Academy XP
+200 XP
Per video.
Tidak termasuk Daily Quest.
________________________________________
Recruit XP
+5.000 XP
Saat admin input recruit.
________________________________________
Profile Visibility
Public:
●	Level
●	Title
●	Badge
●	Statistics
Private:
●	Total Commission
________________________________________
Hall of Fame Visibility
Tidak menampilkan angka.
Menampilkan:
●	Agent
●	Ranking
●	Badge
________________________________________
Featured Badge
User memilih sendiri:
Maksimal 3 badge.
________________________________________
Weekly Leaderboard
Reset:
Setiap Senin
00:00 WIB
________________________________________
Hall of Fame
Reset:
Bulanan
________________________________________
Notification
Community Achievement hanya untuk:
●	Legendary Badge
●	Mythic Badge
________________________________________
Event Submission
URL Only
Tidak menggunakan upload file.
________________________________________
24. MVP Scope
Termasuk:
●	Authentication
●	Homepage
●	Quest
●	My Listing
●	Prospect CRM
●	Academy
●	Profile
●	Badge
●	XP
●	Level
●	Hall of Fame
●	Weekly Leaderboard
●	Notification
●	Event
●	Admin Panel
●	Commission Integration
________________________________________


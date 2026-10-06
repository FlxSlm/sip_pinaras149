# SIPP V2 — Master Data Kelurahan Pinaras

## Tujuan
Dokumen ini adalah **source of truth data profil Kelurahan Pinaras** yang dapat diberikan kepada AI coding agent. Data bersumber dari publikasi BPS dan hanya mencakup informasi yang benar-benar didukung oleh sumber. AI dilarang mengarang data yang tidak tersedia.

## Sumber Utama

- **title**: Kecamatan Tomohon Selatan Dalam Angka 2021
- **publisher**: Badan Pusat Statistik Kota Tomohon
- **publication_number**: 71730.2105
- **catalog**: 1102001.7173010
- **data_reference**: Utamanya tahun 2020; beberapa tabel menggunakan 2018, 2019, atau 2020.
- **url**: https://tomohonkota.bps.go.id
- **uploaded_file**: kecamatan-tomohon-selatan-dalam-angka-2021(1).pdf

## Aturan Penggunaan Data oleh Agent

1. Data 2020/2019/2018 harus ditampilkan dengan tahun sumbernya atau metadata `source_year`; jangan menyebutnya sebagai data terkini.
2. Jangan membuat nama lingkungan, nama sekolah, nama fasilitas, nama objek wisata, sejarah, visi-misi, nama pejabat, alamat, nomor telepon, atau koordinat jika tidak tersedia di sumber.
3. Field yang bertanda tidak tersedia (`…`, `-` sesuai konteks sumber) tidak boleh diisi dengan tebakan.
4. Data tingkat Kecamatan Tomohon Selatan tidak boleh diatribusikan sebagai data khusus Pinaras.
5. Simpan provenance sumber: publisher, publication number, table number, printed page, dan source year bila field berasal dari BPS.
6. Data yang ditampilkan publik sebaiknya berasal dari entitas CMS/data profil yang dapat dikelola Admin Kelurahan, bukan hard-code di komponen UI.
7. Perubahan data oleh Admin harus tetap menyimpan jejak sumber atau keterangan pembaruan ketika datanya bersifat statistik.

## Data Pinaras

### Identitas & Geografi

- `name`: Kelurahan Pinaras
- `subdistrict`: Kecamatan Tomohon Selatan
- `city`: Kota Tomohon
- `position`: Salah satu dari 12 kelurahan di Kecamatan Tomohon Selatan.
- `area_km2`: 3.98
- `area_percentage_source`: 9.44
- `population_density_per_km2`: 588.19
- `elevation_masl`: 661.0
- `distance_to_subdistrict_capital_km`: 8.3
- `distance_to_capital_in_table_km`: 19.0
- `geographic_difficulty_index_2019`: None
- `geographic_difficulty_ratio_2019`: None
- **Catatan IKG:** Pada tabel 1.1.5 nilai IKG dan Rasio IKG Pinaras ditampilkan sebagai '…' (tidak tersedia).

### Pemerintahan
- Jumlah SLS: **8** (2020).

### Kependudukan

- `2018`: 2360
- `2019`: 1865
- `2020`: 2341
- `male_2020`: 1196
- `female_2020`: 1145
- `sex_ratio_2020`: 104.5
- `age_structure_note`: Komposisi umur yang tersedia dalam publikasi adalah tingkat Kecamatan Tomohon Selatan, bukan khusus Pinaras.

### Ketenagakerjaan

- `farmer`: 467
- `seller`: 40
- `civil_servant`: 145
- `others`: 1142

### Pendidikan

- `PAUD`: 1
- `TK`: 2
- `SD_negeri`: 1
- `SD_swasta`: 1
- `MI_negeri`: 0
- `MI_swasta`: 0
- `SMP_negeri`: 0
- `SMP_swasta`: 1
- `MTs_negeri`: 0
- `MTs_swasta`: 0
- `SMA_negeri`: 0
- `SMA_swasta`: 0
- `MA_negeri`: 0
- `MA_swasta`: 0
- `SMK_negeri`: 0
- `SMK_swasta`: 0
- `perguruan_tinggi_negeri`: 0
- `perguruan_tinggi_swasta`: 0

#### Kemudahan mencapai sarana pendidikan terdekat

- `SD`: — (tabel kemudahan ditujukan untuk kelurahan tanpa sarana pendidikan setempat)
- `MI`: Mudah
- `SMP`: — (tabel kemudahan ditujukan untuk kelurahan tanpa sarana pendidikan setempat)
- `MTs`: Mudah
- `SMA`: Mudah
- `MA`: Mudah
- `SMK`: Mudah
- `Akademi_Perguruan_Tinggi`: Mudah

### Kesehatan

- `hospital`: 0
- `maternity_hospital`: 0
- `puskesmas`: 1
- `posyandu`: 1
- `clinic_health_center`: 0
- `polindes`: 0
- `doctors`: 3
- `dentists`: 0
- `midwives`: 0
- `other_health_workers`: 15
- `pharmacy`: 0
- `drug_store`: 0
- `puskesmas_inpatient`: 0
- `puskesmas_without_inpatient`: 1
- `malnutrition_2019`: 0
- `malnutrition_2020`: 0

### Agama & Tempat Ibadah

- Keberadaan penduduk Islam: -
- Keberadaan penduduk Protestant: Ada
- Keberadaan penduduk Catholic: Ada
- Keberadaan penduduk Hindu: -
- Keberadaan penduduk Buddha: -
- Keberadaan penduduk Konghucu: -
- `mosque`: 0
- `protestant_church`: 5
- `catholic_church`: 1
- `temple_hindu`: 0
- `vihara`: 0
- `other`: 0
- Catatan: Tabel agama menyatakan keberadaan penduduk menurut agama (Ada/tidak ada), bukan jumlah penganut.

### Bencana & Mitigasi

- Kejadian earthquake: 0
- Kejadian tsunami: 0
- Kejadian volcanic_eruption: 0
- Kejadian landslide: 0
- Kejadian flood: 0
- Kejadian flash_flood: 0
- Kejadian drought: 0
- Kejadian forest_land_fire: 0
- Kejadian windstorm: 0
- Kejadian storm: 0
- Kejadian tidal_wave: 0
- Mitigasi `natural_disaster_early_warning`: False
- Mitigasi `tsunami_specific_early_warning`: False
- Mitigasi `safety_equipment`: False
- Mitigasi `evacuation_signs_and_routes`: False
- Mitigasi `river_canal_drainage_normalization`: True
- Embung 2019: 0; 2020: 0
- **Catatan penting:** Nilai 'Tidak ada' pada data bencana 2020 adalah kondisi kejadian yang tercatat dalam publikasi untuk tahun tersebut; bukan jaminan bahwa Pinaras bebas risiko bencana di masa kini.

### Pertanian
- Luas tegal/kebun/ladang/huma: **346 ha** (2020).
- Lahan nonpertanian: **0 ha** (sesuai tabel sumber).
- Tabel komoditas produksi bersifat tingkat kecamatan dan **tidak diatribusikan ke Pinaras**.

### Industri & Jasa

- Industri mikro `leather`: 0
- Industri mikro `wood`: 1
- Industri mikro `metal`: 0
- Industri mikro `plait`: 0
- Industri mikro `earthenware`: 0
- Industri mikro `fabric`: 0
- Industri mikro `food`: 8
- Jasa/pertukangan `mechanic`: 0
- Jasa/pertukangan `blacksmith`: 0
- Jasa/pertukangan `carpenter`: 69
- Jasa/pertukangan `radio_repair`: 0
- Jasa/pertukangan `barber`: 0

### Energi
- Rumah tangga: **726**.
- PLN: **726**.
- Lampu gas: **0**.
- Gas lainnya: **0**.
- Sumber air minum, penerangan jalan utama, dan bahan bakar memasak dalam publikasi tidak tersaji secara spesifik untuk Pinaras.

### Perdagangan

- `market`: 0
- `minimarket`: 0
- `shops_stalls`: 30
- `shopping_group`: 0

### Pariwisata

- `hotels`: 0
- `lodging`: 0
- `restaurants`: 0
- `critical_note`: Publikasi tidak mencantumkan nama objek wisata alam Pinaras.
- Objek wisata `nature`: 1
- Objek wisata `history`: 0
- Objek wisata `religion`: 0
- Objek wisata `other`: 0
- **Catatan:** Publikasi tidak mencantumkan nama objek wisata alam Pinaras.

### Transportasi & Komunikasi

#### bridges
- `permanent`: 0
- `wood`: 0
- `emergency`: 0
#### cellular
- `BTS`: 0
- `operators`: 5
- `signal_condition`: Kuat
#### inter_village_transport
- `mode`: Darat
- `public_transport`: Ada, dengan trayek tetap
#### road
- `surface`: Aspal
- `motor_vehicle_access`: Sepanjang Tahun
#### post_and_expedition
- `post_office`: 0
- `private_expedition`: 0

### Keuangan & Koperasi

- `government_commercial_bank`: 0
- `private_commercial_bank`: 0
- `rural_credit_bank`: 0
- `district_price_note`: Harga kebutuhan dan tabel lain pada bagian harga adalah tingkat Kecamatan Tomohon Selatan, bukan khusus Pinaras.
- Koperasi `KUD`: 0
- Koperasi `Kopinkra`: 0
- Koperasi `Kospin`: 0
- Koperasi `other`: 0

## Data yang Harus Ditahan dari Landing Page Sampai Diverifikasi

- Nama dan alamat kantor Kelurahan
- Nomor telepon/WhatsApp resmi
- Nama Lurah dan pejabat/staf
- Nama resmi 8 lingkungan
- Sejarah Kelurahan Pinaras
- Visi dan misi resmi
- Nama objek wisata alam yang tercatat 1 objek
- Nama sekolah/fasilitas kesehatan
- Koordinat kantor dan batas administrasi
- Foto resmi dan lisensi/kredit foto
- Data statistik terbaru yang menggantikan baseline 2020

## Provenance / Sumber Tiap Kelompok Data

- **Geografi — luas wilayah** — Tabel 1.1.1, halaman cetak 6 — 3,98 km²; persentase sumber 9,44%
- **Geografi — kepadatan** — Tabel 1.1.2, halaman cetak 7 — 588,19 jiwa/km²
- **Geografi — ketinggian** — Tabel 1.1.3, halaman cetak 8 — 661 m
- **Geografi — jarak** — Tabel 1.1.4, halaman cetak 9 — 8,3 km ke ibu kota kecamatan; 19,0 km pada kolom ibu kota kabupaten dalam tabel
- **Geografi — IKG** — Tabel 1.1.5, halaman cetak 10 — Pinaras: … / …
- **Geografi — bencana** — Tabel 1.1.6, halaman cetak 11–13 — Semua jenis bencana yang ditampilkan: Tidak ada
- **Geografi — korban bencana** — Tabel 1.1.7, halaman cetak 14–16 — Semua jenis korban yang ditampilkan: Tidak ada
- **Geografi — mitigasi** — Tabel 1.1.8, halaman cetak 17–18 — Tidak ada early warning, safety equipment, rambu/jalur evakuasi; ada normalisasi sungai/kanal/tanggul/parit/drainase
- **Geografi — embung** — Tabel 1.1.9, halaman cetak 19 — 0 pada 2019 dan 2020
- **Pemerintahan — SLS** — Tabel 2.1.1, halaman cetak 23 — 8 SLS
- **Penduduk** — Tabel 3.1.1, halaman cetak 27 — 2018: 2.360; 2019: 1.865; 2020: 2.341
- **Penduduk — jenis kelamin** — Tabel 3.1.2, halaman cetak 28 — 1.196 laki-laki; 1.145 perempuan; total 2.341; rasio jenis kelamin 104,5
- **Ketenagakerjaan** — Tabel 3.2.1, halaman cetak 30 — Petani 467; pedagang 40; PNS 145; lainnya 1.142
- **Pendidikan — PAUD/TK** — Tabel 4.1.1, halaman cetak 33 — PAUD 1; TK 2
- **Pendidikan — SD** — Tabel 4.1.2, halaman cetak 34 — SD negeri 1; SD swasta 1
- **Pendidikan — MI** — Tabel 4.1.3, halaman cetak 35 — MI negeri 0; swasta 0
- **Pendidikan — SMP** — Tabel 4.1.4, halaman cetak 36 — SMP negeri 0; SMP swasta 1
- **Pendidikan — MTs** — Tabel 4.1.5, halaman cetak 37 — MTs negeri 0; swasta 0
- **Pendidikan — SMA/MA** — Tabel 4.1.6–4.1.7, halaman cetak 38–39 — SMA negeri/swasta 0; MA negeri/swasta 0
- **Pendidikan — SMK** — Tabel 4.1.8, halaman cetak 40 — SMK negeri/swasta 0
- **Pendidikan — perguruan tinggi** — Tabel 4.1.9, halaman cetak 41 — Akademi/perguruan tinggi negeri/swasta 0
- **Pendidikan — akses** — Tabel 4.1.10, halaman cetak 42–43 — MI, MTs, SMA, MA, SMK, akademi/perguruan tinggi: Mudah; SD/SMP: tanda —
- **Kesehatan — fasilitas** — Tabel 4.2.1, halaman cetak 44 — Puskesmas 1; Posyandu 1; jenis fasilitas lain 0
- **Kesehatan — tenaga** — Tabel 4.2.2, halaman cetak 45 — Dokter 3; dokter gigi 0; bidan 0; lainnya 15
- **Kesehatan — posyandu/apotek** — Tabel 4.2.3, halaman cetak 46 — Posyandu 1; apotek 0; toko obat 0
- **Kesehatan — rincian sarana** — Tabel 4.2.4, halaman cetak 47–48 — Puskesmas tanpa rawat inap 1; rawat inap 0; rumah sakit/bersalin/klinik/apotek sesuai baris Pinaras: 0
- **Kesehatan — gizi buruk** — Tabel 4.2.5, halaman cetak 49 — 2019: 0; 2020: 0
- **Agama** — Tabel 4.3.1, halaman cetak 50 — Ada Protestan dan Katolik; agama lain pada baris Pinaras ditampilkan '-'; tabel bersifat keberadaan, bukan jumlah
- **Tempat ibadah** — Tabel 4.3.2, halaman cetak 51 — Gereja Protestan 5; Gereja Katolik 1; jenis lain 0
- **Pertanian** — Tabel 5.1, halaman cetak 55 — 346 ha tegal/kebun/ladang/huma; lahan nonpertanian 0
- **Industri mikro** — Tabel 6.1.1, halaman cetak 58 — Industri kayu 1; industri makanan 8; jenis lain 0
- **Jasa/pertukangan** — Tabel 6.1.2, halaman cetak 59 — Tukang kayu 69; jenis jasa lain pada baris Pinaras 0
- **Energi — rumah tangga/penerangan** — Tabel 6.2.1, halaman cetak 60 — 726 rumah tangga; seluruhnya PLN
- **Perdagangan** — Tabel 7.1.1, halaman cetak 66 — Toko/warung 30; pasar 0; minimarket 0; kelompok pertokoan 0
- **Pariwisata — akomodasi** — Tabel 8.1.1, halaman cetak 69 — Hotel 0; penginapan 0; restoran/rumah makan 0
- **Pariwisata — objek** — Tabel 8.1.2, halaman cetak 70 — Objek wisata alam 1; sejarah 0; religi 0; lainnya 0
- **Transportasi — jembatan** — Tabel 9.1.1, halaman cetak 74 — Semua tipe jembatan pada baris Pinaras: 0
- **Komunikasi** — Tabel 9.1.2, halaman cetak 75 — BTS 0; operator 5; kondisi sinyal Kuat
- **Transportasi antar-kelurahan** — Tabel 9.1.3, halaman cetak 76 — Darat; angkutan umum ada dengan trayek tetap
- **Jalan** — Tabel 9.1.4, halaman cetak 77 — Aspal; dapat dilalui kendaraan bermotor roda 4 atau lebih sepanjang tahun
- **Pos/ekspedisi** — Tabel 9.1.5, halaman cetak 78 — Kantor pos 0; perusahaan/agen ekspedisi swasta 0
- **Keuangan** — Tabel 10.1.2, halaman cetak 82 — Bank umum pemerintah 0; bank umum swasta 0; BPR 0
- **Koperasi** — Tabel 10.1.3, halaman cetak 83 — KUD 0; Kopinkra 0; Kospin 0; lainnya 0

## Catatan Kualitas Data Sumber

1. Publikasi memiliki ketidakkonsistenan pada luas total Kecamatan Tomohon Selatan: narasi geografis menyebut 31,78 km², sedangkan Tabel 1.1.1 menjumlahkan total 35,27 km². Karena konflik ini berada pada tingkat kecamatan, **SIPP V2 tidak boleh menyimpulkan atau menghitung ulang persentase luas Pinaras tanpa verifikasi**.

2. Angka persentase Pinaras pada Tabel 1.1.1 tercetak **9,44%**, tetapi angka ini tidak selaras secara aritmetika dengan 3,98 km² dibanding total 35,27 km². Untuk UI publik, lebih aman menampilkan 3,98 km² dan menghilangkan persentase sampai ada verifikasi.

3. Data agama adalah indikator keberadaan agama, bukan jumlah penganut. Jangan membuat grafik persentase agama dari tabel ini.

4. Data kelompok umur tersedia untuk Kecamatan Tomohon Selatan, bukan Pinaras. Jangan menampilkan komposisi umur sebagai statistik Pinaras tanpa sumber baru.

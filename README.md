# base rest api simple
croted by ey ay
rapikan sendiri 
kembangin sendiri


# YOU5MY REST API Jeeyhosting 

REST API engine modular berbasis Node.js dan Express yang dirancang dengan sistem auto-load plugin dinamis, dashboard interaktif bertema Apple iOS Dark Mode, performa tinggi, dan kompatibilitas penuh untuk deployment serverless di Vercel maupun server VPS/Lokal.

Creator: Jeeyhosting 

---

## Fitur Utama

- **Modular Plugin Architecture**: Penambahan fitur baru cukup dengan membuat file JavaScript di dalam subfolder kategori tanpa perlu mengubah konfigurasi rute utama.
- **Auto-Load Plugins**: Plugin baru langsung terbaca dan aktif secara instan tanpa perlu merestart server.
- **Dashboard Web UI Interaktif**: Antarmuka web responsif dan mulus dengan estetika Apple Dark Mode untuk kemudahan eksplorasi endpoint langsung dari browser.
- **Live API Playground**: Fitur pengujian endpoint langsung dari dashboard dengan form parameter otomatis dan penampil respon JSON.
- **Auto Generated Documentation**: Seluruh plugin dan kategori yang terpasang otomatis terdaftar pada endpoint `/api/info/listendp`.
- **Standarisasi Respon JSON**: Format respon konsisten di setiap endpoint (`status`, `creator`, `result`).
- **Support Vercel Serverless & VPS**: Mendukung lingkungan serverless tanpa masalah read-only filesystem maupun cold-start lag.

---

## Kelebihan

1. **Performa Tinggi dan Ringan**: Menggunakan sistem in-memory cache dan eliminasi request blocking eksternal untuk latensi respon di bawah 50ms.
2. **Bebas Kerumitan Routing**: Routing Express dipetakan secara dinamis berdasarkan struktur folder `src/plugins/{kategori}/{nama_fitur}.js`.
3. **Pemisahan Logika yang Bersih**: Setiap fitur terisolasi pada filenya masing-masing sehingga meminimalisir potensi error global.
4. **Fleksibilitas Database Lokal**: Mendukung auto-create database JSON lokal di folder `./src/database/` untuk fitur yang membutuhkan penyimpanan data.

---

## Struktur Folder Project

```text
├── package.json
├── vercel.json
├── index.js
├── README.md
└── src/
    ├── database/
    ├── media/
    │   └── jeeydev.png
    ├── plugins/
    │   ├── downloader/
    │   │   └── ytdl.js
    │   ├── info/
    │   │   ├── gempa.js
    │   │   └── listendp.js
    │   └── search/
    │       ├── pinterest.js
    │       └── yts.js
    ├── utils/
    │   └── loader.js
    ├── views/
    │   ├── index.html
    │   └── ui.js
    └── server.js
```

---

## Dokumentasi & Struktur Plugin

Setiap plugin endpoint wajib diletakkan di dalam folder `src/plugins/{kategori}/` dengan format ekspor objek CommonJS:

### Format Dasar Plugin
```javascript
module.exports = {
    name: "Nama Fitur",
    category: "kategori",
    description: "Deskripsi singkat mengenai fungsi endpoint ini",
    method: "GET",
    parameters: {
        param1: "Keterangan parameter 1 (wajib/opsional)",
        param2: "Keterangan parameter 2"
    },
    async execute(req, res) {
        try {
            const { param1 } = req.query;

            if (!param1) {
                return res.status(400).json({
                    status: false,
                    creator: "JeeyDev",
                    message: "Parameter param1 wajib diisi"
                });
            }

            res.status(200).json({
                status: true,
                creator: "JeeyDev",
                result: {
                    output: param1
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "JeeyDev",
                message: "Terjadi kesalahan internal",
                error: error.message
            });
        }
    }
};
```

### Properti Plugin:
- `name` *(String)*: Nama tampilan fitur pada dashboard UI.
- `category` *(String)*: Nama kategori (harus sesuai dengan nama folder tempat file diletakkan).
- `description` *(String)*: Penjelasan fungsi endpoint.
- `method` *(String)*: Metode HTTP yang diizinkan (`GET`, `POST`, atau `ALL`).
- `parameters` *(Object)*: Daftar parameter query/body beserta deskripsinya yang akan dijadikan input dinamis pada dashboard playground.
- `execute` *(Async Function)*: Fungsi utama yang menerima objek Express `(req, res)` untuk memproses logika bisnis endpoint.

---

## Panduan Menambah Plugin Baru

1. Tentukan kategori fitur (contoh: `tools`).
2. Buat folder `src/plugins/tools/` jika belum ada.
3. Buat file JavaScript di dalamnya, misalnya `src/plugins/tools/reverse.js`.
4. Isi file dengan struktur plugin:

```javascript
module.exports = {
    name: "Teks Terbalik",
    category: "tools",
    description: "Membalikkan susunan karakter teks",
    method: "GET",
    parameters: {
        text: "Teks yang ingin dibalik (contoh: ?text=halo)"
    },
    async execute(req, res) {
        const text = req.query.text;

        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "JeeyDev",
                message: "Parameter text wajib diisi"
            });
        }

        const reversed = text.split("").reverse().join("");

        res.status(200).json({
            status: true,
            creator: "JeeyDev",
            result: {
                original: text,
                reversed: reversed
            }
        });
    }
};
```

5. Endpoint langsung dapat diakses pada:
   `GET /api/tools/reverse?text=halo`
6. Endpoint otomatis terdaftar di dashboard UI dan endpoint `/api/info/listendp`.

---

## Daftar Endpoint Bawaan

| Kategori | Endpoint | Metode | Parameter | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **info** | `/api/info/listendp` | `GET` | - | Mengambil daftar seluruh endpoint yang tersedia |
| **info** | `/api/info/gempa` | `GET` | - | Data gempa bumi terkini secara real-time dari BMKG |
| **search** | `/api/search/yts` | `GET` | `query` | Pencarian video YouTube berdasarkan kata kunci |
| **search** | `/api/search/pinterest` | `GET` | `query`, `limit` | Pencarian gambar dari Pinterest |
| **downloader** | `/api/downloader/ytdl` | `GET` | `url`, `format` | Download audio MP3 atau video MP4 dari YouTube |

---

## Panduan Instalasi & Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/jeeytzy2/rest-api-repo.git
cd rest-api-repo
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Lokal
```bash
npm start
```
Buka browser dan akses: `http://localhost:3000`

---

## Deployment ke Vercel

1. Pastikan project telah di-push ke GitHub / GitLab.
2. Hubungkan repository ke dashboard Vercel.
3. Vercel akan otomatis mendeteksi file `vercel.json` dan `index.js`.
4. Atau gunakan Vercel CLI:
```bash
vercel --prod
```

---

## Konvensi Database & Media

- **Penyimpanan Database JSON**: Letakkan pada path `./src/database/namafile.json`. Pastikan plugin melakukan auto-create file JSON jika belum tersedia.
- **Penyimpanan Media Statis**: Letakkan file gambar/media pada `./src/media/`. Media dapat diakses publik melalui rute `/media/namafile.ext`.

---

## Lisensi & Hak Cipta

Dikembangkan oleh **Jeeyhosting**. Didistribusikan di bawah lisensi MIT. Bebas dikembangkan dan dimodifikasi untuk kebutuhan bot WhatsApp, automasi, atau aplikasi web lainnya.
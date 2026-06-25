import type { World, QueryResult } from '@/types'
import { runQuery } from '@/engine/sqlEngine'

const SISWA_SETUP = `
CREATE TABLE siswa (id INTEGER, nama TEXT, umur INTEGER, kelas TEXT, tinggi INTEGER);
INSERT INTO siswa VALUES (1,'Budi',12,'6A',145);
INSERT INTO siswa VALUES (2,'Siti',11,'5B',138);
INSERT INTO siswa VALUES (3,'Andi',13,'7A',152);
INSERT INTO siswa VALUES (4,'Dewi',10,'4C',130);
INSERT INTO siswa VALUES (5,'Reza',14,'8B',158);
INSERT INTO siswa VALUES (6,'Lina',11,'5A',140);
INSERT INTO siswa VALUES (7,'Fauzi',12,'6B',147);
`

const TRANSAKSI_SETUP = `
CREATE TABLE toko (id INTEGER, nama TEXT, kota TEXT);
INSERT INTO toko VALUES (1,'Toko Maju','Jakarta');
INSERT INTO toko VALUES (2,'Toko Sejahtera','Bandung');
INSERT INTO toko VALUES (3,'Toko Makmur','Surabaya');
CREATE TABLE transaksi (id INTEGER, toko TEXT, produk TEXT, jumlah INTEGER, harga INTEGER);
INSERT INTO transaksi VALUES (1,'Toko Maju','Buku',3,15000);
INSERT INTO transaksi VALUES (2,'Toko Maju','Pensil',10,3000);
INSERT INTO transaksi VALUES (3,'Toko Sejahtera','Buku',5,15000);
INSERT INTO transaksi VALUES (4,'Toko Makmur','Penggaris',7,8000);
INSERT INTO transaksi VALUES (5,'Toko Sejahtera','Pensil',4,3000);
INSERT INTO transaksi VALUES (6,'Toko Maju','Buku',2,15000);
`

const KELAS_SETUP = `
CREATE TABLE siswa (id INTEGER, nama TEXT, kelas_id INTEGER);
INSERT INTO siswa VALUES (1,'Budi',1);
INSERT INTO siswa VALUES (2,'Siti',2);
INSERT INTO siswa VALUES (3,'Andi',1);
INSERT INTO siswa VALUES (4,'Dewi',3);
CREATE TABLE kelas (id INTEGER, nama_kelas TEXT, guru TEXT);
INSERT INTO kelas VALUES (1,'6A','Pak Hendra');
INSERT INTO kelas VALUES (2,'5B','Bu Sari');
INSERT INTO kelas VALUES (3,'4C','Bu Wati');
`

function hasColumns(result: QueryResult, cols: string[]): boolean {
  return cols.every((c) => result.columns.includes(c))
}

export const WORLDS: World[] = [
  {
    id: 1,
    name: 'Select Town',
    emoji: '🏙️',
    concept: ['SELECT', '*', 'Nama Kolom'],
    color: 'from-blue-600 to-blue-800',
    levels: [
      {
        id: 1,
        worldId: 1,
        title: 'Tampilkan Semua Data',
        mission: 'Tampilkan semua siswa!',
        description: 'Gunakan SELECT untuk menampilkan semua data dari tabel siswa.',
        hint1: 'Gunakan kata kunci SELECT.',
        hint2: 'Gunakan * untuk memilih semua kolom.',
        hint3: 'Penulisannya: SELECT * FROM nama_tabel;',
        solution: 'SELECT * FROM siswa;',
        setupSQL: SISWA_SETUP,
        xp: 50,
        difficulty: 'easy',
        validateFn: (r) => r.rows.length === 7 && !r.error,
      },
      {
        id: 2,
        worldId: 1,
        title: 'Pilih Kolom Tertentu',
        mission: 'Tampilkan hanya nama dan umur siswa!',
        description: 'Pilih kolom spesifik, bukan semua kolom.',
        hint1: 'Tuliskan nama kolom setelah SELECT.',
        hint2: 'Pisahkan kolom dengan koma.',
        hint3: 'SELECT nama, umur FROM siswa;',
        solution: 'SELECT nama, umur FROM siswa;',
        setupSQL: SISWA_SETUP,
        xp: 75,
        difficulty: 'easy',
        validateFn: (r) =>
          hasColumns(r, ['nama', 'umur']) &&
          r.columns.length === 2 &&
          r.rows.length === 7,
      },
    ],
  },
  {
    id: 2,
    name: 'Filter Forest',
    emoji: '🌲',
    concept: ['WHERE', 'AND', 'OR'],
    color: 'from-green-600 to-green-800',
    levels: [
      {
        id: 3,
        worldId: 2,
        title: 'Filter Umur',
        mission: 'Tampilkan siswa yang umurnya lebih dari 11 tahun!',
        description: 'Gunakan WHERE untuk menyaring data.',
        hint1: 'Gunakan WHERE setelah FROM.',
        hint2: 'Kondisi: umur > 11',
        hint3: 'SELECT * FROM siswa WHERE umur > 11;',
        solution: 'SELECT * FROM siswa WHERE umur > 11;',
        setupSQL: SISWA_SETUP,
        xp: 100,
        difficulty: 'easy',
        validateFn: (r) =>
          !r.error && r.rows.length > 0 && r.rows.every((row) => Number(row.umur) > 11),
      },
      {
        id: 4,
        worldId: 2,
        title: 'Kombinasi Filter',
        mission: 'Tampilkan siswa umur 12 tahun DAN kelas 6A!',
        description: 'Gunakan AND untuk kombinasi kondisi.',
        hint1: 'Gabungkan dua kondisi dengan AND.',
        hint2: 'Kondisi: umur = 12 AND kelas = ...',
        hint3: "SELECT * FROM siswa WHERE umur = 12 AND kelas = '6A';",
        solution: "SELECT * FROM siswa WHERE umur = 12 AND kelas = '6A';",
        setupSQL: SISWA_SETUP,
        xp: 100,
        difficulty: 'medium',
        validateFn: (r) =>
          !r.error &&
          r.rows.length > 0 &&
          r.rows.every((row) => Number(row.umur) === 12 && row.kelas === '6A'),
      },
    ],
  },
  {
    id: 3,
    name: 'Sorting Mountain',
    emoji: '⛰️',
    concept: ['ORDER BY', 'ASC', 'DESC', 'LIMIT'],
    color: 'from-orange-600 to-orange-800',
    levels: [
      {
        id: 5,
        worldId: 3,
        title: 'Urutkan Tinggi',
        mission: 'Tampilkan 3 siswa tertinggi!',
        description: 'Gunakan ORDER BY untuk mengurutkan, LIMIT untuk membatasi.',
        hint1: 'Gunakan ORDER BY untuk mengurutkan.',
        hint2: 'DESC = dari besar ke kecil.',
        hint3: 'SELECT * FROM siswa ORDER BY tinggi DESC LIMIT 3;',
        solution: 'SELECT * FROM siswa ORDER BY tinggi DESC LIMIT 3;',
        setupSQL: SISWA_SETUP,
        xp: 100,
        difficulty: 'easy',
        validateFn: (r) => {
          if (r.error || r.rows.length !== 3) return false
          const tinggi = r.rows.map((row) => Number(row.tinggi))
          if (tinggi.some((t) => Number.isNaN(t))) return false
          const sortedDesc = tinggi.every((t, i) => i === 0 || t <= tinggi[i - 1])
          // top 3 tertinggi: 158, 152, 147
          return sortedDesc && tinggi[0] === 158
        },
      },
      {
        id: 6,
        worldId: 3,
        title: 'Urutkan Nama Alfabetis',
        mission: 'Tampilkan semua siswa diurutkan nama A-Z!',
        description: 'Urutkan berdasarkan nama secara ascending.',
        hint1: 'Gunakan ORDER BY nama.',
        hint2: 'ASC = dari kecil ke besar (default).',
        hint3: 'SELECT * FROM siswa ORDER BY nama ASC;',
        solution: 'SELECT * FROM siswa ORDER BY nama ASC;',
        setupSQL: SISWA_SETUP,
        xp: 75,
        difficulty: 'easy',
        validateFn: (r) => {
          if (r.error || r.rows.length < 2) return false
          const names = r.rows.map((row) => String(row.nama))
          return names.every((name, i) => i === 0 || name >= names[i - 1])
        },
      },
    ],
  },
  {
    id: 4,
    name: 'Data Village',
    emoji: '🏘️',
    concept: ['INSERT', 'UPDATE', 'DELETE'],
    color: 'from-purple-600 to-purple-800',
    levels: [
      {
        id: 7,
        worldId: 4,
        title: 'Tambah Siswa Baru',
        mission: 'Tambahkan siswa baru: id=8, nama=Yoga, umur=13, kelas=7B, tinggi=155!',
        description: 'Gunakan INSERT INTO untuk menambah data.',
        hint1: 'Gunakan INSERT INTO nama_tabel VALUES (...).',
        hint2: 'Urutan: id, nama, umur, kelas, tinggi.',
        hint3: "INSERT INTO siswa VALUES (8,'Yoga',13,'7B',155);",
        solution: "INSERT INTO siswa VALUES (8,'Yoga',13,'7B',155);",
        setupSQL: SISWA_SETUP,
        xp: 150,
        difficulty: 'medium',
        validateFn: (r, db) => {
          if (r.error || !db) return false
          const yoga = runQuery(
            "SELECT * FROM siswa WHERE id=8 AND nama='Yoga' AND umur=13 AND kelas='7B' AND tinggi=155",
            db
          )
          const total = runQuery('SELECT COUNT(*) AS n FROM siswa', db)
          return yoga.rows.length === 1 && Number(total.rows[0]?.n) === 8
        },
      },
      {
        id: 8,
        worldId: 4,
        title: 'Update Data',
        mission: "Update umur Budi (id=1) menjadi 13!",
        description: 'Gunakan UPDATE SET untuk mengubah data.',
        hint1: 'UPDATE tabel SET kolom = nilai',
        hint2: 'Jangan lupa WHERE agar tidak semua data berubah!',
        hint3: 'UPDATE siswa SET umur = 13 WHERE id = 1;',
        solution: 'UPDATE siswa SET umur = 13 WHERE id = 1;',
        setupSQL: SISWA_SETUP,
        xp: 150,
        difficulty: 'medium',
        validateFn: (r, db) => {
          if (r.error || !db) return false
          const budi = runQuery('SELECT umur FROM siswa WHERE id=1', db)
          // Siti (id=2) harus tetap 11 — menjebak UPDATE tanpa WHERE
          const siti = runQuery('SELECT umur FROM siswa WHERE id=2', db)
          return Number(budi.rows[0]?.umur) === 13 && Number(siti.rows[0]?.umur) === 11
        },
      },
    ],
  },
  {
    id: 5,
    name: 'Table Builder',
    emoji: '🏗️',
    concept: ['CREATE TABLE', 'ALTER TABLE'],
    color: 'from-yellow-600 to-yellow-800',
    levels: [
      {
        id: 9,
        worldId: 5,
        title: 'Buat Tabel Produk',
        mission: 'Buat tabel produk dengan kolom id (INTEGER) dan nama (TEXT)!',
        description: 'Gunakan CREATE TABLE untuk membuat tabel baru.',
        hint1: 'Sintaks: CREATE TABLE nama (kolom TIPE)',
        hint2: 'Tipe data: INTEGER untuk angka, TEXT untuk teks.',
        hint3: 'CREATE TABLE produk (id INTEGER, nama TEXT);',
        solution: 'CREATE TABLE produk (id INTEGER, nama TEXT);',
        setupSQL: '',
        xp: 200,
        difficulty: 'medium',
        validateFn: (r, db) => {
          if (r.error || !db) return false
          // tabel produk harus punya kolom id & nama
          const check = runQuery('SELECT id, nama FROM produk', db)
          return !check.error
        },
      },
    ],
  },
  {
    id: 6,
    name: 'Join City',
    emoji: '🌉',
    concept: ['INNER JOIN', 'LEFT JOIN'],
    color: 'from-cyan-600 to-cyan-800',
    levels: [
      {
        id: 10,
        worldId: 6,
        title: 'Gabungkan Siswa dan Kelas',
        mission: 'Tampilkan nama siswa beserta nama kelasnya!',
        description: 'INNER JOIN menggabungkan dua tabel berdasarkan kolom yang sama.',
        hint1: 'Gunakan JOIN ... ON untuk menghubungkan tabel.',
        hint2: 'Hubungkan siswa.kelas_id dengan kelas.id.',
        hint3: 'SELECT siswa.nama, kelas.nama_kelas FROM siswa INNER JOIN kelas ON siswa.kelas_id = kelas.id;',
        solution: 'SELECT siswa.nama, kelas.nama_kelas FROM siswa INNER JOIN kelas ON siswa.kelas_id = kelas.id;',
        setupSQL: KELAS_SETUP,
        xp: 250,
        difficulty: 'hard',
        validateFn: (r) =>
          !r.error && hasColumns(r, ['nama', 'nama_kelas']) && r.rows.length > 0,
      },
    ],
  },
  {
    id: 7,
    name: 'Detective SQL',
    emoji: '🕵️',
    concept: ['GROUP BY', 'COUNT', 'SUM', 'AVG'],
    color: 'from-red-600 to-red-800',
    levels: [
      {
        id: 11,
        worldId: 7,
        title: 'Hitung Transaksi per Toko',
        mission: 'Tampilkan jumlah transaksi di setiap toko!',
        description: 'GROUP BY mengelompokkan data, COUNT menghitung jumlah.',
        hint1: 'Gunakan GROUP BY untuk mengelompokkan.',
        hint2: 'COUNT(*) menghitung jumlah baris.',
        hint3: 'SELECT toko, COUNT(*) FROM transaksi GROUP BY toko;',
        solution: 'SELECT toko, COUNT(*) as jumlah FROM transaksi GROUP BY toko;',
        setupSQL: TRANSAKSI_SETUP,
        xp: 250,
        difficulty: 'hard',
        validateFn: (r) => !r.error && r.rows.length === 3,
      },
      {
        id: 12,
        worldId: 7,
        title: 'Total Penjualan',
        mission: 'Hitung total harga transaksi di setiap toko!',
        description: 'SUM menjumlahkan nilai dalam kolom.',
        hint1: 'Gunakan SUM(kolom) untuk menjumlahkan.',
        hint2: 'Kelompokkan berdasarkan toko.',
        hint3: 'SELECT toko, SUM(harga) FROM transaksi GROUP BY toko;',
        solution: 'SELECT toko, SUM(harga) as total FROM transaksi GROUP BY toko;',
        setupSQL: TRANSAKSI_SETUP,
        xp: 250,
        difficulty: 'hard',
        validateFn: (r) => !r.error && r.rows.length === 3,
      },
    ],
  },
  {
    id: 8,
    name: 'SQL Master Academy',
    emoji: '🎓',
    concept: ['Subquery', 'HAVING', 'CASE'],
    color: 'from-pink-600 to-pink-800',
    levels: [
      {
        id: 13,
        worldId: 8,
        title: 'Filter Grup dengan HAVING',
        mission: 'Tampilkan toko yang memiliki lebih dari 1 transaksi!',
        description: 'HAVING memfilter hasil GROUP BY.',
        hint1: 'HAVING digunakan setelah GROUP BY.',
        hint2: 'Filter dengan COUNT(*) > 1.',
        hint3: 'SELECT toko, COUNT(*) FROM transaksi GROUP BY toko HAVING COUNT(*) > 1;',
        solution: 'SELECT toko, COUNT(*) as jumlah FROM transaksi GROUP BY toko HAVING COUNT(*) > 1;',
        setupSQL: TRANSAKSI_SETUP,
        xp: 300,
        difficulty: 'hard',
        // Maju=3, Sejahtera=2, Makmur=1 → HAVING COUNT(*)>1 hanya 2 toko
        validateFn: (r) => !r.error && r.rows.length === 2,
      },
    ],
  },
]

export const ALL_LEVELS = WORLDS.flatMap((w) => w.levels)

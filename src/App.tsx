/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Printer, 
  RotateCcw, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Trash2, 
  AlertCircle,
  Bus,
  Users,
  Award,
  BookOpen,
  Info,
  ExternalLink,
  LogOut,
  FileSpreadsheet
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App for Google Auth & Sheets integration
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'Pemasukan' | 'Pengeluaran';
  subCategory: string;
  amount: number;
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2027-04-10',
    description: 'Iuran Siswa Kelas 5 & 6 (145 siswa @ Rp 250.000)',
    category: 'Pemasukan',
    subCategory: 'Iuran Siswa',
    amount: 36250000,
  },
  {
    id: '2',
    date: '2027-04-12',
    description: 'Subsidi Kas Kegiatan Madrasah & Donatur',
    category: 'Pemasukan',
    subCategory: 'Donasi/Subsidi',
    amount: 5000000,
  },
  {
    id: '3',
    date: '2027-04-15',
    description: 'DP Sewa 3 Unit Bus Pariwisata Eksekutif',
    category: 'Pengeluaran',
    subCategory: 'Transportasi',
    amount: 12000000,
  },
  {
    id: '4',
    date: '2027-04-18',
    description: 'Pelunasan Sewa Bus + Tips Driver & Tour Leader',
    category: 'Pengeluaran',
    subCategory: 'Transportasi',
    amount: 13500000,
  },
  {
    id: '5',
    date: '2027-04-20',
    description: 'Tiket Masuk Wisata Edukasi & Ziarah (Paket Rombongan)',
    category: 'Pengeluaran',
    subCategory: 'Tiket & Masuk',
    amount: 7250000,
  },
  {
    id: '6',
    date: '2027-04-22',
    description: 'Konsumsi & Snack Kotak Peserta (3x Makan + Snack box)',
    category: 'Pengeluaran',
    subCategory: 'Konsumsi',
    amount: 6500000,
  },
  {
    id: '7',
    date: '2027-04-24',
    description: 'Infaq Makam Sunan Kudus & Sunan Muria (Rombongan)',
    category: 'Pengeluaran',
    subCategory: 'Infaq Ziarah',
    amount: 1500000,
  },
  {
    id: '8',
    date: '2027-04-25',
    description: 'Atribut, ID Card Panitia & Kotak P3K Obat-obatan',
    category: 'Pengeluaran',
    subCategory: 'Perlengkapan',
    amount: 750000,
  },
];

const SCHEDULE_ITEMS = [
  {
    time: '06.00 - 06.30 WIB',
    title: 'Kumpul & Apel Pemberangkatan',
    location: 'Halaman Komplek MI Qudsiyyah Kudus',
    desc: 'Absensi peserta didik kelas 5 & 6, pengecekan perlengkapan, dan doa bersama dipimpin oleh pengasuh.',
    icon: 'bus'
  },
  {
    time: '06.30 - 08.00 WIB',
    title: 'Perjalanan Menuju Makam Sunan Kudus & Menara',
    location: 'Kawasan Menara Kudus',
    desc: 'Ziarah awal mengenang perjuangan dakwah Kanjeng Sunan Kudus (Syaikh Jafar Shadiq).',
    icon: 'map'
  },
  {
    time: '08.00 - 10.30 WIB',
    title: 'Ziarah Makam Sunan Muria',
    location: 'Colo, Dawe, Kudus',
    desc: 'Perjalanan naik armada lokal menuju makam Sunan Muria di lereng Gunung Muria. Tahlil dan doa bersama.',
    icon: 'award'
  },
  {
    time: '10.30 - 12.30 WIB',
    title: 'Perjalanan Lintas Kota Menuju Destinasi Wisata Edukasi',
    location: 'Jalur Pantura / Tol Menuju Semarang',
    desc: 'Ramah tamah di dalam bus, kuis islami berhadiah, dan pembagian snack pagi.',
    icon: 'clock'
  },
  {
    time: '12.30 - 13.30 WIB',
    title: 'Istirahat, Sholat Dzuhur Berjamaah & Makan Siang',
    location: 'Masjid Agung / Rest Area & Rumah Makan Mitra',
    desc: 'Sholat jamaah qashar/jamak serta menikmati santap siang bersama.',
    icon: 'check'
  },
  {
    time: '13.30 - 16.00 WIB',
    title: 'Eksplorasi Wisata Edukasi & Rekreasi',
    location: 'Taman Margasatwa / Saloka Theme Park / Museum Edukasi',
    desc: 'Siswa menikmati wahana edukatif, mengenal flora fauna & sains didampingi guru pendamping.',
    icon: 'sparkles'
  },
  {
    time: '16.00 - 17.30 WIB',
    title: 'Belanja Oleh-oleh & Persiapan Pulang',
    location: 'Pusat Oleh-oleh Khas Lokal',
    desc: 'Membeli kenang-kenangan untuk keluarga di rumah, absen ulang peserta.',
    icon: 'shopping'
  },
  {
    time: '17.30 - 19.30 WIB',
    title: 'Perjalanan Pulang ke MI Qudsiyyah & Kedatangan',
    location: 'Komplek MI Qudsiyyah Kudus',
    desc: 'Tiba di madrasah, penyerahan kembali siswa kepada wali murid dengan tertib.',
    icon: 'home'
  }
];

const GALLERY_ITEMS = [
  {
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    title: 'Komplek Masjid & Menara Sunan Kudus',
    category: 'Ziarah Religi'
  },
  {
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    title: 'Armada Bus Pariwisata Eksekutif MI Qudsiyyah',
    category: 'Transportasi'
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    title: 'Siswa Berdoa Khusyuk di Makam Wali',
    category: 'Kegiatan Ziarah'
  },
  {
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
    title: 'Keserian Wisata Edukasi Sains & Alam',
    category: 'Rekreasi Edukasi'
  },
  {
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    title: 'Makan Bersama & Kebersamaan Siswa',
    category: 'Keakraban'
  },
  {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    title: 'Briefing Guru Pendamping & Panitia',
    category: 'Koordinasi'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'keuangan' | 'jadwal' | 'galeri'>('keuangan');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setUser(result.user);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Gagal melakukan otentikasi Google.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAccessToken(null);
    setUser(null);
  };

  // Export to Google Sheets
  const handleExportToSheets = async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }

    setIsExporting(true);
    setAuthError(null);
    setExportSuccessUrl(null);

    try {
      // Get fresh access token or use cached credential
      const credential = GoogleAuthProvider.credentialFromResult(await signInWithPopup(auth, provider).catch(() => ({}) as any));
      const token = credential?.accessToken || accessToken;

      // 1. Create Spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Laporan Keuangan Ziarah MI Qudsiyyah 2026-2027 (${new Date().toLocaleDateString()})`
          }
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error?.message || 'Gagal membuat Google Spreadsheet.');
      }

      const spreadsheetData = await createRes.json();
      const spreadsheetId = spreadsheetData.spreadsheetId;
      const spreadsheetUrl = spreadsheetData.spreadsheetUrl;

      // 2. Prepare Rows
      const rows = [
        ['LAPORAN KEUANGAN & KEGIATAN ZIARAH DAN REKREASI'],
        ['MI QUDSIYYAH KUDUS - TAHUN AJARAN 2026/2027'],
        [''],
        ['Tanggal', 'Keterangan', 'Kategori', 'Sub Kategori', 'Nominal (Rp)'],
        ...transactions.map(t => [
          t.date,
          t.description,
          t.category,
          t.subCategory,
          t.amount
        ]),
        [''],
        ['Total Pemasukan', '', '', '', totalPemasukan],
        ['Total Pengeluaran', '', '', '', totalPengeluaran],
        ['Saldo Akhir Kas', '', '', '', saldoAkhir]
      ];

      // 3. Append Data
      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows
        })
      });

      if (!updateRes.ok) {
        throw new Error('Gagal menulis data ke Google Spreadsheet.');
      }

      setExportSuccessUrl(spreadsheetUrl);
    } catch (err: any) {
      console.error('Export error:', err);
      setAuthError(err.message || 'Terjadi kesalahan saat menyinkronkan ke Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Keuangan state with LocalStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mi_qudsiyyah_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('mi_qudsiyyah_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Filter & Search states
  const [filterType, setFilterType] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [newSubCategory, setNewSubCategory] = useState('Konsumsi');
  const [newAmount, setNewAmount] = useState('');

  // Calculations
  const totalPemasukan = transactions
    .filter(t => t.category === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = transactions
    .filter(t => t.category === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoAkhir = totalPemasukan - totalPengeluaran;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;

    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: newDate,
      description: newDesc,
      category: newCategory,
      subCategory: newSubCategory,
      amount: amt
    };

    setTransactions([newTx, ...transactions]);
    setNewDesc('');
    setNewAmount('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data transaksi ini?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm('Reset data keuangan kembali ke contoh awal tahun ajaran 2026/2027?')) {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.removeItem('mi_qudsiyyah_transactions');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === 'Semua' || t.category === filterType;
    const matchQuery = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       t.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       t.date.includes(searchQuery);
    return matchType && matchQuery;
  });

  return (
    <div className="min-h-screen bg-emerald-50/65 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white pb-16 print:bg-white print:pb-0">
      
      {/* TOP HEADER / BANNER */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl border-b-4 border-amber-400 print:border-none print:shadow-none print:bg-none print:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-200 text-emerald-950 font-black text-2xl sm:text-3xl shrink-0 print:border-black print:bg-emerald-100">
                <span>Q</span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30 print:text-emerald-800 print:bg-emerald-50 print:border-emerald-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resmi Madrasah Ibtidaiyah Qudsiyyah Kudus</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white print:text-emerald-950">
                  Laporan Keuangan & Kegiatan Ziarah
                </h1>
                <p className="text-emerald-200 text-sm sm:text-base mt-1 font-medium print:text-slate-600">
                  Program Ziarah Wali & Rekreasi Edukasi • Tahun Ajaran 2026/2027
                </p>
              </div>
            </div>

            {/* Action Buttons & Google Auth / Sheets Sync */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <button
                onClick={handleExportToSheets}
                disabled={isExporting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition transform active:scale-95 text-sm cursor-pointer disabled:opacity-50"
                title="Ekspor Laporan Keuangan ke Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>{isExporting ? 'Menyinkronkan...' : user ? 'Ekspor ke Google Sheets' : 'Login & Sinkron Sheets'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 px-4 py-2.5 rounded-xl font-bold shadow-md transition transform active:scale-95 text-sm cursor-pointer"
                title="Cetak Laporan atau Simpan sebagai PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-3.5 py-2.5 rounded-xl font-medium border border-emerald-600 transition text-sm cursor-pointer"
                title="Reset Data ke Semula"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Data</span>
              </button>
            </div>

          </div>

          {/* User Sign-in Status bar */}
          {user && (
            <div className="mt-4 pt-4 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-200 print:hidden">
              <div className="flex items-center gap-2">
                <img src={user.photoURL || undefined} alt="" className="w-6 h-6 rounded-full border border-amber-400" />
                <span>Masuk sebagai <strong className="text-white">{user.displayName || user.email}</strong> (Google Sheets Terhubung)</span>
              </div>
              <button onClick={handleSignOut} className="flex items-center gap-1 text-amber-300 hover:underline">
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Google</span>
              </button>
            </div>
          )}

          {authError && (
            <div className="mt-4 p-3 bg-rose-900/80 text-rose-100 rounded-xl text-xs flex items-center justify-between border border-rose-700">
              <span>{authError}</span>
              <button onClick={() => setAuthError(null)} className="text-white font-bold">&times;</button>
            </div>
          )}

          {exportSuccessUrl && (
            <div className="mt-4 p-4 bg-emerald-800 text-emerald-100 rounded-xl text-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Berhasil! Laporan Keuangan telah diekspor ke Google Spreadsheet Anda.</span>
              </div>
              <a
                href={exportSuccessUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2 rounded-lg font-bold text-xs transition"
              >
                <span>Buka Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-8 flex justify-center md:justify-start border-b border-emerald-700/50 print:hidden">
            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => setActiveTab('keuangan')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition border-b-2 cursor-pointer ${
                  activeTab === 'keuangan'
                    ? 'border-amber-400 text-amber-300 bg-emerald-800/40 rounded-t-xl'
                    : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/20 rounded-t-xl'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Ringkasan & Keuangan</span>
              </button>

              <button
                onClick={() => setActiveTab('jadwal')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition border-b-2 cursor-pointer ${
                  activeTab === 'jadwal'
                    ? 'border-amber-400 text-amber-300 bg-emerald-800/40 rounded-t-xl'
                    : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/20 rounded-t-xl'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Jadwal & Rute Ziarah</span>
              </button>

              <button
                onClick={() => setActiveTab('galeri')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition border-b-2 cursor-pointer ${
                  activeTab === 'galeri'
                    ? 'border-amber-400 text-amber-300 bg-emerald-800/40 rounded-t-xl'
                    : 'border-transparent text-emerald-200 hover:text-white hover:bg-emerald-800/20 rounded-t-xl'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Dokumentasi & Galeri</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: RINGKASAN & KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 3 SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Pemasukan */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-emerald-600 flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-50 pointer-events-none">
                  <ArrowDownLeft className="w-32 h-32" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Iuran Siswa & Subsidi Kas</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
              </div>

              {/* Total Pengeluaran */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-rose-500 flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-rose-50 opacity-50 pointer-events-none">
                  <ArrowUpRight className="w-32 h-32" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Bus, Konsumsi, Tiket, Infaq</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>

              {/* Saldo Akhir */}
              <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-amber-500 flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-amber-50 opacity-50 pointer-events-none">
                  <Wallet className="w-32 h-32" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas Akhir</p>
                  <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${saldoAkhir >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {formatRupiah(saldoAkhir)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status: {saldoAkhir >= 0 ? 'Dana Aman & Surplus' : 'Defisit'}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* CONTROLS BAR: SEARCH, FILTER, ADD */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Search & Filter Type */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari transaksi atau keterangan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
                  {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        filterType === type
                          ? 'bg-emerald-800 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Transaction Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold shadow transition cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Transaksi Baru</span>
              </button>

            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Rincian Transaksi Keuangan</h3>
                  <p className="text-xs text-slate-500">Menampilkan {filteredTransactions.length} dari {transactions.length} catatan transaksi</p>
                </div>
                <div className="text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full hidden sm:block">
                  Tahun Ajaran 2026/2027
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-6">Tanggal</th>
                      <th className="py-3.5 px-6">Keterangan / Uraian</th>
                      <th className="py-3.5 px-6">Kategori</th>
                      <th className="py-3.5 px-6">Sub Kategori</th>
                      <th className="py-3.5 px-6 text-right">Nominal (Rp)</th>
                      <th className="py-3.5 px-4 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          Tidak ada data transaksi yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-medium text-slate-600 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-4 px-6 text-slate-800 font-medium">
                            {tx.description}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              tx.category === 'Pemasukan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tx.category === 'Pemasukan' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              {tx.subCategory}
                            </span>
                          </td>
                          <td className={`py-4 px-6 text-right font-extrabold whitespace-nowrap ${
                            tx.category === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            {tx.category === 'Pemasukan' ? '+ ' : '- '}
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap print:hidden">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                <span>Laporan Keuangan Resmi Panitia Ziarah & Rekreasi MI Qudsiyyah Kudus</span>
                <span className="font-semibold text-slate-700">Dicetak otomatis dari Sistem Web Madrasah</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: JADWAL & RUTE ZIARAH */}
        {activeTab === 'jadwal' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-emerald-950 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/90 rounded-2xl flex items-center justify-center text-amber-700 shrink-0 shadow">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">Rute Perjalanan Ziarah & Rekreasi</h3>
                  <p className="text-emerald-950/80 text-sm mt-0.5">
                    Rangkaian ziarah Wali Songo / Jawa Tengah & kunjungan wisata edukasi siswa kelas 5 dan 6 MI Qudsiyyah Kudus.
                  </p>
                </div>
              </div>
              <div className="bg-emerald-950 text-amber-300 px-4 py-2.5 rounded-xl font-bold text-sm shadow shrink-0">
                Tanggal: 28 April 2027
              </div>
            </div>

            {/* TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Timeline Left (2 Columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Rundown Acara & Timeline Perjalanan</span>
                </h3>

                <div className="relative border-l-2 border-emerald-200 ml-4 pl-6 space-y-8">
                  {SCHEDULE_ITEMS.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-md group-hover:scale-125 transition"></div>

                      <div className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-xl border border-slate-100 transition">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                          {item.time}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-800">{item.title}</h4>
                        <p className="text-xs font-semibold text-amber-700 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Info Right (1 Column) */}
              <div className="space-y-6">
                
                {/* Perlengkapan Wajib */}
                <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-emerald-700">
                  <h4 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                    <span>Perlengkapan Wajib Siswa</span>
                  </h4>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Seragam identitas madrasah lengkap (sesuai jadwal hari bersangkutan).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Membawa obat-obatan pribadi (bagi yang memiliki riwayat khusus).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Membawa air minum tumbler & alas duduk / tikar kecil.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Uang saku secukupnya (tidak berlebihan).</span>
                    </li>
                  </ul>
                </div>

                {/* Kontak Darurat */}
                <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-amber-500">
                  <h4 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-amber-600" />
                    <span>Kontak Darurat Panitia</span>
                  </h4>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800">Ustadz H. Ahmad Fauzi, S.Pd.I</p>
                      <p className="text-xs text-emerald-700 font-semibold">Ketua Panitia (0812-3456-7890)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800">Ustadzah Siti Aminah, M.Pd</p>
                      <p className="text-xs text-emerald-700 font-semibold">Bendahara & Pendamping (0856-7890-1234)</p>
                    </div>
                  </div>
                </div>

                {/* Catatan Penting Wali Murid */}
                <div className="bg-emerald-900 text-emerald-100 rounded-2xl p-6 shadow-md">
                  <h4 className="font-extrabold text-white text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Catatan Wali Murid</span>
                  </h4>
                  <p className="text-xs leading-relaxed text-emerald-200">
                    Mohon peserta didik sudah hadir di halaman MI Qudsiyyah Kudus tepat pukul 06.00 WIB untuk tertib absensi sebelum keberangkatan rombongan bus.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: DOKUMENTASI & GALERI */}
        {activeTab === 'galeri' && (
          <div className="space-y-8 animate-fadeIn">
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-extrabold text-slate-800">Dokumentasi & Galeri Kegiatan</h3>
              <p className="text-slate-500 text-sm mt-2">
                Momen berharga kegiatan ziarah religi dan rekreasi edukasi siswa-siswi MI Qudsiyyah Kudus Tahun Ajaran 2026/2027.
              </p>
            </div>

            {/* GALLERY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GALLERY_ITEMS.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md group hover:shadow-xl transition border border-slate-100">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">MI Qudsiyyah Kudus • Dokumentasi Resmi</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-emerald-200 text-center text-xs text-slate-500 print:mt-8">
        <p className="font-semibold text-emerald-900">Madrasah Ibtidaiyah (MI) Qudsiyyah Kudus</p>
        <p className="mt-1">Sistem Informasi Keuangan & Kegiatan Ziarah dan Rekreasi Tahun Ajaran 2026/2027</p>
      </footer>

      {/* ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp">
            
            <div className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center border-b border-amber-400">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Tambah Transaksi Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Jenis Kategori</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setNewCategory('Pemasukan'); setNewSubCategory('Iuran Siswa'); }}
                    className={`py-2.5 rounded-xl font-bold text-sm transition border ${
                      newCategory === 'Pemasukan'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Pemasukan (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewCategory('Pengeluaran'); setNewSubCategory('Transportasi'); }}
                    className={`py-2.5 rounded-xl font-bold text-sm transition border ${
                      newCategory === 'Pengeluaran'
                        ? 'bg-rose-600 text-white border-rose-600 shadow'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Pengeluaran (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sub Kategori</label>
                <select
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50"
                >
                  {newCategory === 'Pemasukan' ? (
                    <>
                      <option value="Iuran Siswa">Iuran Siswa</option>
                      <option value="Donasi/Subsidi">Donasi / Subsidi Kas</option>
                      <option value="Sumbangan Lain">Sumbangan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Transportasi">Transportasi & Bus</option>
                      <option value="Konsumsi">Konsumsi & Snack</option>
                      <option value="Tiket & Masuk">Tiket Wisata</option>
                      <option value="Infaq Ziarah">Infaq Ziarah Makam</option>
                      <option value="Perlengkapan">Perlengkapan & P3K</option>
                      <option value="Lainnya">Pengeluaran Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Uraian / Keterangan Transaksi</label>
                <input
                  type="text"
                  placeholder="Misal: Pembayaran konsumsi gelombang 2..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-slate-50"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white py-3 rounded-xl font-bold text-sm transition shadow cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

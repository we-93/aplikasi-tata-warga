"use client";

import { useState, useMemo } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#6419c1', '#fad900', '#10b981', '#f43f5e', '#3b82f6', '#f97316', '#8b5cf6', '#cbd5e1'];

export function StatistikDashboard({ wargas }: { wargas: any[] }) {
  const [umurFilter, setUmurFilter] = useState("biologis");

  const stats = useMemo(() => {
    // Basic Counts
    const totalWarga = wargas.length;
    const uniqueKKs = new Set(wargas.map(w => w.noKk).filter(Boolean));
    const totalKK = uniqueKKs.size;

    // Helper for aggregations
    const countBy = (field: string, defaultValue: string = "Belum Terisi") => {
      const counts: Record<string, number> = {};
      wargas.forEach(w => {
        const val = w[field] || defaultValue;
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const genderData = countBy("jenisKelamin");
    // Format Gender Enum
    genderData.forEach(d => {
      if (d.name === "LAKI_LAKI") d.name = "Laki-laki";
      if (d.name === "PEREMPUAN") d.name = "Perempuan";
    });

    const pendidikanData = countBy("pendidikan");
    const pekerjaanData = countBy("pekerjaan");
    const golonganDarahData = countBy("golonganDarah");
    const statusNikahData = countBy("statusNikah");
    const statusWargaData = countBy("statusWarga");

    // Age calculation
    const currentYear = new Date().getFullYear();
    const umurCounts: Record<string, number> = {};

    if (umurFilter === "biologis") {
      umurCounts["Balita (0-5)"] = 0;
      umurCounts["Anak-anak (6-11)"] = 0;
      umurCounts["Remaja (12-19)"] = 0;
      umurCounts["Dewasa (20-59)"] = 0;
      umurCounts["Lansia (60+)"] = 0;
      umurCounts["Belum Terisi"] = 0;
    } else if (umurFilter === "angkatan_kerja") {
      umurCounts["Belum Produktif (0-14)"] = 0;
      umurCounts["Usia Produktif (15-64)"] = 0;
      umurCounts["Tidak Produktif (65+)"] = 0;
      umurCounts["Belum Terisi"] = 0;
    } else if (umurFilter === "generasi") {
      umurCounts["Gen Alpha (2010-2024)"] = 0;
      umurCounts["Gen Z (1997-2009)"] = 0;
      umurCounts["Milenial / Gen Y (1981-1996)"] = 0;
      umurCounts["Gen X (1965-1980)"] = 0;
      umurCounts["Baby Boomers (1946-1964)"] = 0;
      umurCounts["Lainnya"] = 0;
      umurCounts["Belum Terisi"] = 0;
    }

    wargas.forEach(w => {
      if (!w.tanggalLahir) {
        umurCounts["Belum Terisi"]++;
      } else {
        const birthYear = new Date(w.tanggalLahir).getFullYear();
        const age = currentYear - birthYear;

        if (umurFilter === "biologis") {
          if (age <= 5) umurCounts["Balita (0-5)"]++;
          else if (age <= 11) umurCounts["Anak-anak (6-11)"]++;
          else if (age <= 19) umurCounts["Remaja (12-19)"]++;
          else if (age <= 59) umurCounts["Dewasa (20-59)"]++;
          else umurCounts["Lansia (60+)"]++;
        } else if (umurFilter === "angkatan_kerja") {
          if (age <= 14) umurCounts["Belum Produktif (0-14)"]++;
          else if (age <= 64) umurCounts["Usia Produktif (15-64)"]++;
          else umurCounts["Tidak Produktif (65+)"]++;
        } else if (umurFilter === "generasi") {
          if (birthYear >= 2010 && birthYear <= 2024) umurCounts["Gen Alpha (2010-2024)"]++;
          else if (birthYear >= 1997 && birthYear <= 2009) umurCounts["Gen Z (1997-2009)"]++;
          else if (birthYear >= 1981 && birthYear <= 1996) umurCounts["Milenial / Gen Y (1981-1996)"]++;
          else if (birthYear >= 1965 && birthYear <= 1980) umurCounts["Gen X (1965-1980)"]++;
          else if (birthYear >= 1946 && birthYear <= 1964) umurCounts["Baby Boomers (1946-1964)"]++;
          else umurCounts["Lainnya"]++;
        }
      }
    });

    const umurData = Object.entries(umurCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    return {
      totalWarga,
      totalKK,
      genderData,
      pendidikanData,
      pekerjaanData,
      golonganDarahData,
      statusNikahData,
      statusWargaData,
      umurData
    };
  }, [wargas, umurFilter]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.05) return null; // Don't show labels for tiny slices
    return (
      <text x={x} y={y} fill="white" fontSize={12} textAnchor="middle" dominantBaseline="central" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (wargas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold">Belum Ada Data Warga</h3>
          <p className="text-slate-500">Silakan tambahkan data warga terlebih dahulu untuk melihat statistik.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-[#6419c1] to-[#8b3ced] text-white border-0 shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 font-medium">Total Keseluruhan Warga</p>
              <h3 className="text-4xl font-bold">{stats.totalWarga} <span className="text-lg font-normal opacity-80">Orang</span></h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#fad900] to-[#f5b300] text-slate-900 border-0 shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-slate-900/10 p-4 rounded-2xl backdrop-blur-sm">
              <FileText className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <p className="text-slate-800 font-medium">Total Kartu Keluarga</p>
              <h3 className="text-4xl font-bold">{stats.totalKK} <span className="text-lg font-normal opacity-80">KK</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Gender & Jenis Kelamin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {stats.genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Golongan Darah */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Golongan Darah</CardTitle>
            <CardDescription>Penting untuk kebutuhan donor darurat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.golonganDarahData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.golonganDarahData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Umur */}
        <Card className="shadow-sm border-slate-100 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-slate-700">Distribusi Kelompok Umur</CardTitle>
            <div className="w-48">
              <Select value={umurFilter} onValueChange={(v) => setUmurFilter(v ?? "")}>  
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biologis">Biologis (Balita - Lansia)</SelectItem>
                  <SelectItem value="angkatan_kerja">Angkatan Kerja</SelectItem>
                  <SelectItem value="generasi">Generasi (Gen Z, Milenial, dll)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.umurData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Bar dataKey="value" fill="#6419c1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pendidikan */}
        <Card className="shadow-sm border-slate-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Tingkat Pendidikan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.pendidikanData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{fill: '#475569', fontSize: 12}} axisLine={false} tickLine={false} width={120} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pekerjaan */}
        <Card className="shadow-sm border-slate-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Demografi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.pekerjaanData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{fill: '#475569', fontSize: 12}} axisLine={false} tickLine={false} width={150} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Perkawinan */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Status Perkawinan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusNikahData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.statusNikahData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Tinggal (Warga) */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Status Warga (Tinggal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusWargaData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {stats.statusWargaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Orang`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

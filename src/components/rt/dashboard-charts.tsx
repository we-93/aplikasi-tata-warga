"use client";

import { useTheme } from "next-themes";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface KasChartProps {
  data: any[];
  summary: {
    pemasukan: number;
    pengeluaran: number;
    net: number;
  };
}

export function DashboardCharts({ data, summary }: KasChartProps) {
  const { resolvedTheme } = useTheme();
  
  // Define colors based on theme, though Recharts works well with explicit hex
  const isDark = resolvedTheme === "dark";
  const pemasukanColor = "#10b981"; // emerald-500
  const pengeluaranColor = "#ef4444"; // red-500
  const gridColor = isDark ? "#ffffff10" : "#00000010";
  const textColor = isDark ? "#ffffff50" : "#00000050";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 md:p-8 pb-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Statistik Saldo RT</h3>
            <p className="text-sm text-muted-foreground mt-1">Perbandingan pemasukan dan pengeluaran 6 bulan terakhir</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pemasukan
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Pengeluaran
            </div>
            <select className="bg-muted text-xs border-none rounded-md px-3 py-1.5 outline-none ml-2">
              <option>6 Bulan Terakhir</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="h-[250px] w-full mt-6 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={false} 
              width={0}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#141229' : '#ffffff', 
                border: '1px solid ' + gridColor,
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="pemasukan" 
              stroke={pemasukanColor} 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="pengeluaran" 
              stroke={pengeluaranColor} 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto px-6 md:px-8 pb-6 md:pb-8 pt-4">
        <div className="flex justify-end mb-4">
          <div className="bg-muted px-3 py-1 rounded-md text-[10px] font-bold">
            Net: Rp {summary.net.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Pemasukan (Bulan Ini)</p>
            <p className="text-sm font-bold text-emerald-500">Rp {summary.pemasukan.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Pengeluaran (Bulan Ini)</p>
            <p className="text-sm font-bold text-red-500">Rp {summary.pengeluaran.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Saldo Bersih Saat Ini</p>
            <p className="text-sm font-bold text-blue-500 dark:text-blue-400">Rp {summary.net.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

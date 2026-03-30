import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { MONTH_SHORT, formatCurrency } from "@/pages/FaturaCartao";
import type { Invoice } from "@/services/invoiceService";

interface Props {
  invoices: Invoice[];
  selectedMonth: number;
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
}

export default function InvoiceHistoryChart({ invoices, selectedMonth, selectedYear, onSelect }: Props) {
  const chartData = useMemo(() => {
    // Show 8 months: 4 past + current + 3 future
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return Array.from({ length: 8 }, (_, i) => {
      const offset = i - 4;
      let m = currentMonth + offset;
      let y = currentYear;
      while (m > 12) { m -= 12; y++; }
      while (m < 1) { m += 12; y--; }

      const invoice = invoices.find((inv) => inv.month === m && inv.year === y);
      const amount = invoice ? Number(invoice.total_amount) : 0;
      const isPaid = invoice?.is_paid ?? false;
      const isSelected = m === selectedMonth && y === selectedYear;
      const isFuture = y > currentYear || (y === currentYear && m > currentMonth);

      return {
        month: m,
        year: y,
        label: MONTH_SHORT[m - 1],
        amount,
        isPaid,
        isSelected,
        isFuture,
        projected: isFuture ? amount || 0 : 0,
        actual: !isFuture ? amount : 0,
      };
    });
  }, [invoices, selectedMonth, selectedYear]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 text-xs space-y-1">
        <p className="font-bold text-foreground">{MONTH_SHORT[data.month - 1]} {data.year}</p>
        <p className="text-primary font-semibold">{formatCurrency(data.amount)}</p>
        {data.isPaid && <p className="text-primary/70">✓ Paga</p>}
        {data.isFuture && <p className="text-muted-foreground">Projeção</p>}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Histórico de Faturas</h2>
      </div>

      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            onClick={(e) => {
              if (e?.activePayload?.[0]?.payload) {
                const d = e.activePayload[0].payload;
                onSelect(d.month, d.year);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 16% / 0.5)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(220 8% 50%)", fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(220 8% 50%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 12% 16% / 0.3)" }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={
                    entry.isSelected
                      ? "hsl(150 100% 45%)"
                      : entry.isFuture
                      ? "hsl(150 100% 45% / 0.2)"
                      : entry.isPaid
                      ? "hsl(150 100% 45% / 0.5)"
                      : "hsl(220 8% 50% / 0.4)"
                  }
                  stroke={entry.isSelected ? "hsl(150 100% 45%)" : "transparent"}
                  strokeWidth={entry.isSelected ? 1 : 0}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary/50" />
          <span>Paga</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[hsl(220_8%_50%_/_0.4)]" />
          <span>Em aberto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary/30" />
          <span>Projeção</span>
        </div>
      </div>
    </motion.div>
  );
}

import { createContext, useContext, useState, ReactNode } from "react";

interface MonthContextType {
  selectedMonth: number;
  selectedYear: number;
  setMonth: (month: number, year: number) => void;
}

const MonthContext = createContext<MonthContextType | null>(null);

export const MonthProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const setMonth = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <MonthContext.Provider value={{ selectedMonth, selectedYear, setMonth }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
};

"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import Hero from "@/components/dashboard/Hero";
import AIInsights from "@/components/dashboard/AIInsights";
import TodoCard from "@/components/dashboard/TodoCard";

type Invoice = {
  id: number;
  supplier: string;
  invoice_number: string | null;
  total_amount: number;
  invoice_date?: string;
  status: string;
};

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/invoices/")
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF8F4]">
      <Sidebar />

      <main className="flex-1 p-10">

        <Header />

        <Hero />
        
        <TodoCard />

        <StatsCards invoices={invoices} />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <InvoiceTable invoices={invoices} />
          </div>

        <AIInsights />
        </div>
      </main>
    </div>
  );
}
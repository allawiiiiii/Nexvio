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

type Dashboard = {
  invoices_total: number;
  invoices_paid: number;
  invoices_unpaid: number;

  transactions_total: number;
  transactions_matched: number;
  transactions_unmatched: number;

  journal_entries_total: number;
};

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/invoices/")
      .then((res) => res.json())
      .then((data) => setInvoices(data));

    fetch("http://127.0.0.1:8000/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboard(data));
  }, []);

  console.log(JSON.stringify(dashboard, null, 2));

  return (
    <div className="flex min-h-screen bg-[#FAF8F4]">
      <Sidebar />

      <main className="flex-1 p-10">
        <Header />

        <div className="mb-12">
          <p className="mb-3 text-sm font-medium text-[#6B665F]">
            Välkommen tillbaka 👋
          </p>

          <h1
            className="text-5xl leading-tight text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            God morgon.
            <br />
            Här är din översikt.
          </h1>
        </div>

        <Hero />

        <TodoCard />

        <StatsCards invoices={invoices} dashboard={dashboard} />

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

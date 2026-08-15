"use client";

import { useEffect, useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import InvoiceTable from "@/components/invoices/InvoiceTable";

type Invoice = {
  id: number;
  supplier: string;
  invoice_number: string | null;
  total_amount: number;
  invoice_date?: string;
  status: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    async function loadInvoices() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/invoices/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("INVOICE STATUS:", res.status);
          console.log("INVOICE RESPONSE:", await res.text());
          throw new Error("Failed to fetch invoices");
        }

        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error("Invoice fetch failed:", error);
      }
    }

    loadInvoices();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF8F4]">
      <Sidebar />

      <main className="flex-1 p-10">
        <Header />

        <div className="mb-10">
          <h1
            className="text-5xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Fakturor
          </h1>

          <p className="mt-2 text-[#6B665F]">
            Alla importerade leverantörsfakturor.
          </p>
        </div>

        <InvoiceTable invoices={invoices} />
      </main>
    </div>
  );
}

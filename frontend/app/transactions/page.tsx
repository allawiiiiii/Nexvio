"use client";

import { useEffect, useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import TransactionTable from "@/components/transactions/TransactionTable";

type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  balance: number;
  currency: string;
  status: string;
  matched_invoice_id: number | null;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/transactions")
      .then((res) => res.json())
      .then(setTransactions);
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
            Transaktioner
          </h1>

          <p className="mt-2 text-[#6B665F]">
            Alla importerade banktransaktioner.
          </p>
        </div>

        <TransactionTable transactions={transactions} />
      </main>
    </div>
  );
}

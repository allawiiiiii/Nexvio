"use client";

import { useState } from "react";

type JournalLine = {
  id: number;
  account: string;
  description: string;
  debit: number;
  credit: number;
};

type JournalEntry = {
  id: number;
  invoice_id: number;
  status: string;
  lines: JournalLine[];
};

type InvoiceActionsProps = {
  id: number;
  status: string;
  onJournalCreated: (journal: JournalEntry) => void;
};

export default function InvoiceActions({
  id,
  status,
  onJournalCreated,
}: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);

  async function approveInvoice() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Du är inte inloggad.");
      return;
    }

    const res = await fetch(`http://127.0.0.1:8000/invoices/${id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Kunde inte godkänna fakturan.");
      return;
    }

    window.location.reload();
  }

  async function createJournal() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Du är inte inloggad.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/invoices/${id}/journal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Journal creation failed:", error);
        return;
      }

      const data: JournalEntry = await res.json();

      onJournalCreated(data);
    } catch (error) {
      console.error("Journal creation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 flex gap-4">
      {status !== "approved" && (
        <button
          onClick={approveInvoice}
          className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Godkänn faktura
        </button>
      )}

      {status === "approved" && (
        <button
          onClick={createJournal}
          disabled={loading}
          className="rounded-lg bg-[#201C18] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Skapar..." : "Skapa bokföringsförslag"}
        </button>
      )}
    </div>
  );
}

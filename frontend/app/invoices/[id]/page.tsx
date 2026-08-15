"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import InvoiceHeader from "@/components/invoices/InvoiceHeader";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import InvoiceActions from "@/components/invoices/InvoiceActions";

type Invoice = {
  id: number;
  supplier: string;
  status: string;
  invoice_number: string | null;
  total_amount: number;
  vat_amount: number;
  invoice_date: string | null;
  ai_summary: string | null;
};

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

export default function InvoicePage() {
  const params = useParams();
  const id = params.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [journal, setJournal] = useState<JournalEntry | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch invoice");
        }

        const data: Invoice = await res.json();

        setInvoice(data);
      } catch (err) {
        console.error("Invoice fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-[#6B665F]">Laddar faktura...</p>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="rounded-3xl border border-[#EBE5DC] bg-white p-10 shadow-sm">
          <h1
            className="text-3xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Fakturan kunde inte hittas
          </h1>

          <p className="mt-3 text-[#6B665F]">
            Kontrollera att fakturan finns kvar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-7xl px-8 py-10">
        <InvoiceHeader supplier={invoice.supplier} status={invoice.status} />

        <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <InvoiceDetails invoice={invoice} />
          </div>

          <div className="space-y-6">
            <InvoiceSummary summary={invoice.ai_summary} />

            <InvoiceActions
              id={invoice.id}
              status={invoice.status}
              onJournalCreated={setJournal}
            />
            {journal && (
              <div className="mt-6 rounded-3xl border border-[#EBE5DC] bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2
                    className="text-2xl text-[#201C18]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Bokföringsförslag
                  </h2>

                  <p className="mt-1 text-sm text-[#6B665F]">
                    AI-genererat bokföringsunderlag
                  </p>
                </div>

                <div className="space-y-4">
                  {journal.lines.map((line) => (
                    <div
                      key={line.id}
                      className="rounded-2xl border border-[#F0ECE5] bg-[#FAF8F4] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-[#201C18]">
                            Konto {line.account}
                          </p>

                          <p className="mt-1 text-sm text-[#6B665F]">
                            {line.description}
                          </p>
                        </div>

                        <div className="text-right text-sm">
                          <p className="font-medium text-[#201C18]">
                            Debet: {line.debit.toLocaleString("sv-SE")} kr
                          </p>

                          <p className="mt-1 font-medium text-[#6B665F]">
                            Kredit: {line.credit.toLocaleString("sv-SE")} kr
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[#EBE5DC] pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B665F]">Debet</span>
                    <span className="font-medium text-[#201C18]">
                      {journal.lines
                        .reduce((sum, line) => sum + line.debit, 0)
                        .toLocaleString("sv-SE")}{" "}
                      kr
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-[#6B665F]">Kredit</span>
                    <span className="font-medium text-[#201C18]">
                      {journal.lines
                        .reduce((sum, line) => sum + line.credit, 0)
                        .toLocaleString("sv-SE")}{" "}
                      kr
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

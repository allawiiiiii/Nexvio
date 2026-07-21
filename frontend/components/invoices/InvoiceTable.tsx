"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Search } from "lucide-react";

type Invoice = {
  id: number;
  supplier: string;
  invoice_number: string | null;
  total_amount: number;
  invoice_date?: string;
  status: string;
};

export default function InvoiceTable({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return invoices;

    return invoices.filter((invoice) => {
      return (
        invoice.supplier.toLowerCase().includes(query) ||
        (invoice.invoice_number ?? "").toLowerCase().includes(query)
      );
    });
  }, [invoices, search]);

  return (
    <div className="rounded-3xl border border-[#EBE5DC] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#EBE5DC] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            className="text-2xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Senaste fakturor
          </h2>

          <p className="mt-1 text-sm text-[#6B665F]">
            Översikt över dina senaste uppladdade fakturor.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B665F]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök leverantör eller fakturanummer..."
            className="w-full rounded-2xl border border-[#EBE5DC] bg-[#FAF8F4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#201C18]"
          />
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#EBE5DC] text-left text-sm text-[#6B665F]">
            <th className="px-6 py-4 font-medium">Leverantör</th>
            <th className="px-6 py-4 font-medium">Fakturanummer</th>
            <th className="px-6 py-4 font-medium">Datum</th>
            <th className="px-6 py-4 font-medium">Belopp</th>
            <th className="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredInvoices.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-10 text-center text-[#6B665F]"
              >
                Ingen faktura matchade din sökning.
              </td>
            </tr>
          ) : (
            filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => router.push(`/invoices/${invoice.id}`)}
                className="cursor-pointer border-b border-[#F4F1EB] transition hover:bg-[#FCFBF8]"
              >
                <td className="px-6 py-5 font-medium text-[#201C18]">
                  {invoice.supplier}
                </td>

                <td className="px-6 py-5 text-[#6B665F]">
                  {invoice.invoice_number ?? "-"}
                </td>

                <td className="px-6 py-5 text-[#6B665F]">
                  {invoice.invoice_date
                    ? invoice.invoice_date.slice(0, 10)
                    : "-"}
                </td>

                <td className="px-6 py-5 font-medium text-[#201C18]">
                  {invoice.total_amount.toLocaleString("sv-SE")} kr
                </td>

                <td className="px-6 py-5">
                  {invoice.status === "approved" ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                      <CheckCircle2 size={16} />
                      Godkänd
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                      <Clock3 size={16} />
                      Behöver granskas
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
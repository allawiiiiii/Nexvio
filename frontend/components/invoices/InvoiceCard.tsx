import Link from "next/link";


type Invoice = {
  id: number;
  supplier: string;
  invoice_number: string | null;
  total_amount: number;
  status: string;
};

export default function InvoiceCard({
  invoice,
}: {
  invoice: Invoice;
}) {
  return (
    <Link
  href={`/invoices/${invoice.id}`}
  className="block cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
>
      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {invoice.supplier || "Unknown supplier"}
          </h3>

          <p className="mt-1 text-slate-500">
            Invoice #{invoice.invoice_number ?? "-"}
          </p>
        </div>

        <div className="text-right">

          <p className="text-3xl font-bold text-slate-900">
            {invoice.total_amount.toLocaleString("sv-SE")} SEK
          </p>

          <span
            className={`mt-2 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
              invoice.status === "approved"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {invoice.status.replace("_", " ")}
          </span>

        </div>

      </div>
    </Link>
  );
}
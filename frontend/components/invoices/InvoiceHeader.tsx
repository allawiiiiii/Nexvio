import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type InvoiceHeaderProps = {
  supplier: string;
  status: string;
};

export default function InvoiceHeader({
  supplier,
  status,
}: InvoiceHeaderProps) {
  const approved = status === "approved";

  return (
    <header className="mb-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-900">
          {supplier}
        </h1>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            approved
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {approved ? "Approved" : "Review Required"}
        </span>
      </div>
    </header>
  );
}
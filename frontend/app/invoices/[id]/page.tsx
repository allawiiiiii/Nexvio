import InvoiceHeader from "@/components/invoices/InvoiceHeader";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import InvoiceActions from "@/components/invoices/InvoiceActions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;

  const res = await fetch(`http://127.0.0.1:8000/invoices/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
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

  const invoice = await res.json();

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-7xl px-8 py-10">
        <InvoiceHeader
          supplier={invoice.supplier}
          status={invoice.status}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <InvoiceDetails invoice={invoice} />
          </div>

          <div className="space-y-6">
            <InvoiceSummary summary={invoice.ai_summary} />
            <InvoiceActions
              id={invoice.id}
              status={invoice.status}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
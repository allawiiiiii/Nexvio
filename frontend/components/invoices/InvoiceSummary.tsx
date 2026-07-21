type InvoiceSummaryProps = {
  summary: string | null;
};

export default function InvoiceSummary({
  summary,
}: InvoiceSummaryProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">
        AI Summary
      </h2>

      <p className="leading-7 text-slate-600">
        {summary || "No AI summary available."}
      </p>
    </div>
  );
}
"use client";

type InvoiceActionsProps = {
  id: number;
  status: string;
};

export default function InvoiceActions({
  id,
  status,
}: InvoiceActionsProps) {
  async function approveInvoice() {
    const res = await fetch(
      `http://127.0.0.1:8000/invoices/${id}/approve`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      alert("Failed to approve invoice.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="mt-8 flex gap-4">
      {status !== "approved" && (
        <button
          onClick={approveInvoice}
          className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Approve Invoice
        </button>
      )}
    </div>
  );
}
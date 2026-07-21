"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


type InvoiceDetailsProps = {
  invoice: {
    id: number;
    invoice_number: string | null;
    invoice_date: string | null;
    total_amount: number;
    vat_amount: number;
  };
};



export default function InvoiceDetails({
  invoice,
}: InvoiceDetailsProps) {

const [isEditing, setIsEditing] = useState(false);

const [invoiceNumber, setInvoiceNumber] = useState(
  invoice.invoice_number ?? ""
);

const [invoiceDate, setInvoiceDate] = useState(
  invoice.invoice_date ?? ""
);

const [totalAmount, setTotalAmount] = useState(
  invoice.total_amount
);

const [vatAmount, setVatAmount] = useState(
  invoice.vat_amount
);

const router = useRouter();

async function saveInvoice() {
  const res = await fetch(
    `http://127.0.0.1:8000/invoices/${invoice.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        total_amount: totalAmount,
        vat_amount: vatAmount,
      }),
    }
  );

  if (!res.ok) {
    alert("Failed to save invoice.");
    return;
  }

  setIsEditing(false);
  router.refresh();
}

function cancelEdit() {
  setInvoiceNumber(invoice.invoice_number ?? "");
  setInvoiceDate(invoice.invoice_date ?? "");
  setTotalAmount(invoice.total_amount);
  setVatAmount(invoice.vat_amount);

  setIsEditing(false);
}

  return (
    <div className="mb-8 rounded-xl bg-white p-8 shadow">
      <div className="mb-6 flex items-center justify-between">
  <h2 className="text-2xl font-semibold text-slate-900">
    Invoice Details
  </h2>

  <div className="flex gap-2">
  {isEditing && (
    <button
    onClick={saveInvoice}
    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
  >
    Save
  </button>
  )}

  <button
  onClick={() => {
    if (isEditing) {
      cancelEdit();
    } else {
      setIsEditing(true);
    }
  }}
  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
>
  {isEditing ? "Cancel" : "Edit"}
</button>

</div>
</div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-500">Invoice Number</p>
          {isEditing ? (
  <input
    value={invoiceNumber}
    onChange={(e) => setInvoiceNumber(e.target.value)}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  />
) : (
  <p className="text-lg font-medium">
    {invoice.invoice_number ?? "-"}
  </p>
)}
        </div>

        <div>
          <p className="text-sm text-slate-500">Invoice Date</p>
          {isEditing ? (
  <input
    type="date"
    value={invoiceDate}
    onChange={(e) => setInvoiceDate(e.target.value)}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  />
) : (
  <p className="text-lg font-medium">
    {invoice.invoice_date ?? "-"}
  </p>
)}
        </div>

        <div>
          <p className="text-sm text-slate-500">Total Amount</p>
          {isEditing ? (
  <input
    type="number"
    step="0.01"
    value={totalAmount}
    onChange={(e) => setTotalAmount(Number(e.target.value))}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  />
) : (
  <p className="text-lg font-medium">
    {invoice.total_amount.toLocaleString("sv-SE")} SEK
  </p>
)}
        </div>

        <div>
          <p className="text-sm text-slate-500">VAT</p>
          {isEditing ? (
  <input
    type="number"
    step="0.01"
    value={vatAmount}
    onChange={(e) => setVatAmount(Number(e.target.value))}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  />
) : (
  <p className="text-lg font-medium">
    {invoice.vat_amount.toLocaleString("sv-SE")} SEK
  </p>
)}
        </div>
      </div>
    </div>
  );
}
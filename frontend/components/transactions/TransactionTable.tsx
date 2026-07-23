"use client";

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

type Props = {
  transactions: Transaction[];
};

export default function TransactionTable({ transactions }: Props) {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("sv-SE");

  return (
    <div className="overflow-hidden rounded-3xl border border-[#EBE5DC] bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="border-b border-[#EBE5DC] bg-[#F8F5F0]">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B665F]">
              Datum
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B665F]">
              Beskrivning
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold text-[#6B665F]">
              Belopp
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold text-[#6B665F]">
              Saldo
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-[#6B665F]">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-[#F2EEE8] transition hover:bg-[#FAF8F4]"
            >
              <td className="px-6 py-4">{formatDate(transaction.date)}</td>

              <td className="px-6 py-4 max-w-md truncate">
                {transaction.description}
              </td>

              <td
                className={`px-6 py-4 text-right font-medium ${
                  transaction.amount < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatAmount(transaction.amount)}
              </td>

              <td className="px-6 py-4 text-right">
                {formatAmount(transaction.balance)}
              </td>

              <td className="px-6 py-4 text-center">
                {transaction.status === "matched" ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Matchad
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Omatchad
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

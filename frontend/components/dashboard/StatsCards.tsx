import { FileText, Clock3, CheckCircle2, Wallet } from "lucide-react";

type Invoice = {
  status: string;
};

type Dashboard = {
  invoices_total: number;
  invoices_paid: number;
  invoices_unpaid: number;

  transactions_total: number;
  transactions_matched: number;
  transactions_unmatched: number;

  journal_entries_total: number;
};

export default function StatsCards({
  invoices,
  dashboard,
}: {
  invoices: Invoice[];
  dashboard: Dashboard | null;
}) {
  const totalt = dashboard?.invoices_total ?? invoices.length;

  const granskning =
    dashboard?.transactions_unmatched ??
    invoices.filter((invoice) => invoice.status === "review_required").length;

  const godkända =
    dashboard?.invoices_paid ??
    invoices.filter((invoice) => invoice.status === "approved").length;

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-4">
      <StatCard ikon={<FileText size={20} />} titel="Fakturor" värde={totalt} />

      <StatCard
        ikon={<Wallet size={20} />}
        titel="Transaktioner"
        värde={dashboard?.transactions_total ?? 0}
      />

      <StatCard
        ikon={<CheckCircle2 size={20} />}
        titel="Matchade"
        värde={dashboard?.transactions_matched ?? 0}
      />

      <StatCard
        ikon={<Clock3 size={20} />}
        titel="Omatchade"
        värde={dashboard?.transactions_unmatched ?? 0}
      />
    </div>
  );
}

function StatCard({
  ikon,
  titel,
  värde,
}: {
  ikon: React.ReactNode;
  titel: string;
  värde: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#EBE5DC] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F1EB] text-[#201C18]">
        {ikon}
      </div>

      <p className="text-sm text-[#6B665F]">{titel}</p>

      <h2 className="mt-2 text-4xl font-semibold text-[#201C18]">{värde}</h2>
    </div>
  );
}

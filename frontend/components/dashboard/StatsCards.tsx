import {
  FileText,
  Clock3,
  CheckCircle2,
  Wallet,
} from "lucide-react";

type Invoice = {
  status: string;
};

export default function StatsCards({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const totalt = invoices.length;

  const granskning = invoices.filter(
    (invoice) => invoice.status === "review_required"
  ).length;

  const godkända = invoices.filter(
    (invoice) => invoice.status === "approved"
  ).length;

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-4">
      <StatCard
        ikon={<FileText size={20} />}
        titel="Totalt antal fakturor"
        värde={totalt}
      />

      <StatCard
        ikon={<Clock3 size={20} />}
        titel="Behöver granskas"
        värde={granskning}
      />

      <StatCard
        ikon={<CheckCircle2 size={20} />}
        titel="Godkända"
        värde={godkända}
      />

      <StatCard
        ikon={<Wallet size={20} />}
        titel="AI-status"
        värde="Redo"
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

      <p className="text-sm text-[#6B665F]">
        {titel}
      </p>

      <h2 className="mt-2 text-4xl font-semibold text-[#201C18]">
        {värde}
      </h2>
    </div>
  );
}
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Building2,
  BookOpen,
  Sparkles,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Översikt", active: true },
  { icon: FileText, label: "Fakturor" },
  { icon: Receipt, label: "Kvitton" },
  { icon: Building2, label: "Banktransaktioner" },
  { icon: BookOpen, label: "Bokföring" },
  { icon: Sparkles, label: "AI-assistent" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-[#EBE5DC] bg-[#FAF8F4] px-6 py-8">
      <div className="mb-12">
        <h1
          className="text-4xl leading-none text-[#201C18]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Nexvio
        </h1>

        <p className="mt-2 text-sm text-[#6B665F]">
          Din AI-drivna ekonomiassistent
        </p>
      </div>

      <nav className="space-y-2">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
              active
                ? "border border-[#EBE5DC] bg-white text-[#201C18] shadow-sm"
                : "text-[#6B665F] hover:bg-white hover:text-[#201C18]"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-[#EBE5DC] bg-white p-5">
        <p className="text-xs uppercase tracking-wider text-[#6B665F]">
          AI-STATUS
        </p>

        <h3 className="mt-2 text-lg font-semibold text-[#201C18]">
          Redo
        </h3>

        <p className="mt-1 text-sm text-[#6B665F]">
          Din AI-assistent är redo att granska fakturor och föreslå bokföring.
        </p>
      </div>
    </aside>
  );
}
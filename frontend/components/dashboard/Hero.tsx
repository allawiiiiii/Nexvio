import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="mb-10 rounded-3xl border border-[#EBE5DC] bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B665F]">
            AI-driven ekonomiassistent
          </p>

          <h2
            className="mt-2 text-4xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Håll koll på företagets ekonomi.
          </h2>

          <p className="mt-4 max-w-xl text-[#6B665F]">
            Ladda upp fakturor, granska AI:s tolkningar och skapa bokföringsförslag
            på några sekunder.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[#201C18] px-6 py-3 text-white transition hover:bg-[#342d28]">
          Ladda upp faktura
          <ArrowUpRight size={18} />
        </button>
      </div>
    </section>
  );
}
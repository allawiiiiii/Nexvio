import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";

export default function TodoCard() {
  return (
    <section className="mb-8 rounded-3xl border border-[#EBE5DC] bg-white p-8 shadow-sm">
      <h2
        className="text-2xl text-[#201C18]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Att göra idag
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-[#FCFBF8] p-4">
          <div className="flex items-center gap-3">
            <Clock3 className="text-amber-600" size={20} />

            <div>
              <p className="font-medium text-[#201C18]">
                Granska 3 fakturor
              </p>

              <p className="text-sm text-[#6B665F]">
                AI behöver din bekräftelse.
              </p>
            </div>
          </div>

          <ArrowRight size={18} className="text-[#6B665F]" />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#FCFBF8] p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={20} />

            <div>
              <p className="font-medium text-[#201C18]">
                Bokför 8 godkända fakturor
              </p>

              <p className="text-sm text-[#6B665F]">
                Journalförslag är redo.
              </p>
            </div>
          </div>

          <ArrowRight size={18} className="text-[#6B665F]" />
        </div>
      </div>
    </section>
  );
}
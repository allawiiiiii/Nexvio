import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="rounded-3xl border border-[#EBE5DC] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-[#F4F1EB] p-3">
          <Sparkles size={20} className="text-[#201C18]" />
        </div>

        <div>
          <h2
            className="text-2xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Nexvio AI
          </h2>

          <p className="text-sm text-[#6B665F]">
            Dagens rekommendationer
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 rounded-2xl bg-[#FCFBF8] p-4">
          <AlertCircle className="mt-1 text-amber-600" size={18} />
          <div>
            <p className="font-medium text-[#201C18]">
              3 fakturor väntar på granskning
            </p>

            <p className="text-sm text-[#6B665F]">
              Kontrollera AI:s tolkning innan bokföring.
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-[#FCFBF8] p-4">
          <CheckCircle2 className="mt-1 text-green-600" size={18} />
          <div>
            <p className="font-medium text-[#201C18]">
              Bokföringsförslag tillgängliga
            </p>

            <p className="text-sm text-[#6B665F]">
              AI har skapat förslag för godkända fakturor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
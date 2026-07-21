import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-12 flex items-start justify-between">
      <div>
        <p className="mb-3 text-sm font-medium text-[#6B665F]">
          Välkommen tillbaka 👋
        </p>

        <h1
          className="text-5xl leading-tight text-[#201C18]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          God morgon.
          <br />
          Här är din översikt.
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#EBE5DC] bg-white transition hover:shadow-sm">
          <Search size={18} />
        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#EBE5DC] bg-white transition hover:shadow-sm">
          <Bell size={18} />
        </button>

        <div className="ml-3 flex items-center gap-3 rounded-2xl border border-[#EBE5DC] bg-white px-4 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#201C18] text-sm font-semibold text-white">
            A
          </div>

          <div>
            <p className="text-sm font-semibold text-[#201C18]">
              Ali Erbeia
            </p>

            <p className="text-xs text-[#6B665F]">
              Sunds handels och investeringar
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
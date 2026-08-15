"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();

      body.append("username", email);
      body.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!response.ok) {
        setError("Fel e-post eller lösenord.");
        return;
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);

      router.push("/");
    } catch {
      setError("Kunde inte ansluta till servern.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#EBE5DC] bg-white p-10 shadow-sm">
        <div className="mb-8">
          <h1
            className="text-4xl text-[#201C18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Logga in
          </h1>

          <p className="mt-2 text-[#6B665F]">Logga in på ditt Nexvio-konto.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#201C18]">
              E-post
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED8CF] px-4 py-3 outline-none focus:border-[#201C18]"
              placeholder="du@foretag.se"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#201C18]">
              Lösenord
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED8CF] px-4 py-3 outline-none focus:border-[#201C18]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#201C18] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </main>
  );
}

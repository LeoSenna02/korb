import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Korb",
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col justify-center">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-text-primary mb-3">Korb</h1>
        <p className="font-data text-sm text-text-secondary">
          A calma que você precisa, às 3 da manhã.
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 text-center">
        <p className="font-data text-sm text-text-secondary">
          Não tem conta?{" "}
          <Link
            href="/registro"
            className="text-primary hover:text-on-primary-container transition-colors duration-200 underline underline-offset-4"
          >
            Crie uma
          </Link>
        </p>
      </div>
    </main>
  );
}

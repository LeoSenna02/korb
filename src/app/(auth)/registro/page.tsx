import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta — Korb",
};

export default function RegistroPage() {
  return (
    <main className="flex-1 flex flex-col justify-center">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-text-primary mb-3">Korb</h1>
        <p className="font-data text-sm text-text-secondary">
          Crie sua conta e comece a rastrear.
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="font-data text-sm text-text-secondary">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-on-primary-container transition-colors duration-200 underline underline-offset-4"
          >
            Entre
          </Link>
        </p>
      </div>
    </main>
  );
}

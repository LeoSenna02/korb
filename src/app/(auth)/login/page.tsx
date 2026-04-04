import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Korb",
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col justify-center">
      <div className="mb-10 flex flex-col items-center text-center">
        <BrandLogo
          size={84}
          priority
          className="flex-col items-center gap-4 mb-3"
          nameClassName="text-4xl text-text-primary"
        />
        <p className="font-data text-sm text-text-secondary max-w-xs">
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

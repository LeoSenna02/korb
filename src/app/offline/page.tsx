import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline | Korb",
  description: "Tela offline do Korb.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-surface-dim px-6 py-10 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-md flex-col justify-center">
        <div className="rounded-[2rem] border border-outline-variant bg-surface-container p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-2xl text-primary">
            K
          </div>

          <h1 className="font-display text-3xl leading-tight">
            Sem conexao no momento
          </h1>

          <p className="mt-4 font-data text-sm leading-6 text-text-secondary">
            O Korb continua abrindo o que ja foi carregado e os seus dados
            locais ficam no dispositivo. Quando a conexao voltar, recarregue
            para sincronizar a interface.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="flex h-12 items-center justify-center rounded-xl bg-primary-container px-4 font-display text-sm text-on-primary transition-colors duration-200 hover:bg-primary"
            >
              Voltar ao inicio
            </Link>

            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center rounded-xl border border-outline bg-surface-container-high px-4 font-display text-sm text-text-primary transition-colors duration-200 hover:bg-surface-container-highest"
            >
              Tentar abrir dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

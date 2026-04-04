import { BrandLogo } from "@/components/branding/BrandLogo";

export function HistoryHeader() {
  return (
    <header className="px-6 pt-12 pb-4">
      <div className="mb-6 flex items-center">
        <BrandLogo size={40} />
      </div>

      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Histórico
        </h1>
        <p className="mt-1 font-data text-sm text-text-disabled">
          Todas as atividades registradas
        </p>
      </div>
    </header>
  );
}

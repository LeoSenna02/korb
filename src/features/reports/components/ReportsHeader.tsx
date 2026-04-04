import { BrandLogo } from "@/components/branding/BrandLogo";

export function ReportsHeader() {
  return (
    <header className="px-6 pt-12 pb-4">
      <div className="mb-6 flex items-center">
        <BrandLogo size={40} />
      </div>

      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Relatórios
        </h1>
        <p className="mt-1 font-data text-sm text-text-disabled">
          Visão completa da rotina do Arthur
        </p>
      </div>
    </header>
  );
}

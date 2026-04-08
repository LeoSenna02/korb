import { Activity, Plus } from "lucide-react";

interface SymptomsEmptyStateProps {
  onCreate: () => void;
}

export function SymptomsEmptyState({ onCreate }: SymptomsEmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-surface-variant/20 bg-surface-container-low px-6 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#CD8282]/10 text-[#CD8282]">
        <Activity className="h-8 w-8" strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 font-display text-xl font-semibold text-text-primary">
        Nenhum episodio registrado
      </h2>
      <p className="mx-auto mt-2 max-w-xs font-data text-sm leading-6 text-text-secondary">
        Quando surgir febre, tosse, coriza ou outro sintoma, registre aqui para
        acompanhar a evolucao com contexto.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-container px-5 font-display text-sm font-medium text-on-primary-container transition-all hover:bg-primary active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Novo episodio
      </button>
    </section>
  );
}

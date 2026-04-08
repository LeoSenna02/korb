import type { SymptomEpisode } from "@/lib/db/types";
import { SymptomEpisodeCard } from "./SymptomEpisodeCard";

interface ActiveEpisodesSectionProps {
  episodes: SymptomEpisode[];
  onEdit: (episode: SymptomEpisode) => void;
  onResolve: (episode: SymptomEpisode) => void;
  onDelete: (episode: SymptomEpisode) => void;
  onGoToConsultas: () => void;
}

export function ActiveEpisodesSection({
  episodes,
  onEdit,
  onResolve,
  onDelete,
  onGoToConsultas,
}: ActiveEpisodesSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          Em acompanhamento
        </h2>
        <p className="mt-1 font-data text-sm text-text-secondary">
          Episodios ativos que ainda precisam de observacao.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-surface-variant/30 bg-surface-container-low px-5 py-6">
          <p className="font-display text-sm text-text-primary">
            Nenhum episodio ativo no momento.
          </p>
          <p className="mt-2 font-data text-xs leading-6 text-text-secondary">
            Quando um sintoma estiver em andamento, ele aparece aqui com atalhos
            para consulta e encerramento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <SymptomEpisodeCard
              key={episode.id}
              episode={episode}
              variant="active"
              onEdit={onEdit}
              onResolve={onResolve}
              onDelete={onDelete}
              onGoToConsultas={onGoToConsultas}
            />
          ))}
        </div>
      )}
    </section>
  );
}

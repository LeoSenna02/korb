import type { SymptomEpisode } from "@/lib/db/types";
import { SymptomEpisodeCard } from "./SymptomEpisodeCard";

interface ResolvedEpisodesSectionProps {
  episodes: SymptomEpisode[];
  onDelete: (episode: SymptomEpisode) => void;
}

export function ResolvedEpisodesSection({
  episodes,
  onDelete,
}: ResolvedEpisodesSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          Historico recente
        </h2>
        <p className="mt-1 font-data text-sm text-text-secondary">
          Episodios ja resolvidos para consulta futura.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-surface-variant/30 bg-surface-container-low px-5 py-6">
          <p className="font-display text-sm text-text-primary">
            Ainda nao ha episodios resolvidos.
          </p>
          <p className="mt-2 font-data text-xs leading-6 text-text-secondary">
            Quando um acompanhamento for encerrado, ele fica arquivado aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <SymptomEpisodeCard
              key={episode.id}
              episode={episode}
              variant="resolved"
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

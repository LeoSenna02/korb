"use client";

import { useState } from "react";
import { useHistoryData, useFilteredHistory } from "../hooks/useHistoryData";
import type { HistoryFilter } from "../types";
import { HistoryFilterBar, ActivityCard } from "./HistoryList";
import { WeeklyStatsGrid } from "./WeeklyStats";

export function HistoryView() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("tudo");
  const {
    filteredGroups,
    weeklyStats,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useHistoryData();

  const filteredData = useFilteredHistory(filteredGroups, activeFilter);

  if (isLoading) {
    return (
      <div className="px-6 pb-36">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-surface-container-low rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-36 flex flex-col items-center justify-center py-16 gap-3">
        <p className="font-display text-sm text-tertiary-container">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-display text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pb-36">
      <HistoryFilterBar active={activeFilter} onChange={setActiveFilter} />

      {isRefreshing && (
        <div className="mb-4 flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.2em] text-text-disabled">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Atualizando historico
        </div>
      )}

      <div className="flex flex-col gap-6">
        {filteredData.map((group) => (
          <section key={group.label}>
            <h2 className="font-data text-[10px] uppercase tracking-[0.2em] text-text-disabled mb-3">
              {group.label}
            </h2>
            <div className="flex flex-col gap-2.5">
              {group.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center border border-surface-variant/20">
            <svg
              className="w-7 h-7 text-text-disabled"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="font-display text-sm text-text-disabled text-center">
            Nenhum registro encontrado
          </p>
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="min-w-40 rounded-full border border-surface-variant/20 bg-surface-container-low px-5 py-3 font-display text-sm text-text-primary transition-colors hover:bg-surface-container disabled:opacity-60"
          >
            {isLoadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}

      {/* Weekly stats at the bottom */}
      {weeklyStats.length > 0 && (
        <div className="mt-8">
          <WeeklyStatsGrid stats={weeklyStats} />
        </div>
      )}
    </div>
  );
}

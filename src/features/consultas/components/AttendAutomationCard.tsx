import { CalendarPlus2 } from "lucide-react";

export function AttendAutomationCard() {
  return (
    <div className="rounded-2xl border border-[#88AFC7]/15 bg-[#88AFC7]/8 px-4 py-4 sm:h-full">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#88AFC7]/12 text-[#88AFC7]">
          <CalendarPlus2 className="h-4 w-4" strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Automacao
          </p>
          <p className="mt-2 font-data text-sm leading-relaxed text-text-primary">
            Ao salvar, o app sugere a proxima consulta com a data ja preenchida.
          </p>
        </div>
      </div>
    </div>
  );
}

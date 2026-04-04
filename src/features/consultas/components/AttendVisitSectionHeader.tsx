import { Link2 } from "lucide-react";

interface AttendVisitSectionHeaderProps {
  title: string;
}

export function AttendVisitSectionHeader({
  title,
}: AttendVisitSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Link2 className="h-4 w-4 text-[#8EAF96]" strokeWidth={1.8} />
      <h3 className="font-display text-lg text-text-primary">{title}</h3>
    </div>
  );
}

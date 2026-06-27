import { Calculator } from 'lucide-react';

type ModuleIconProps = {
  moduleId: string;
};

export function ModuleIcon({ moduleId }: ModuleIconProps) {
  const color =
    moduleId === 'k12'
      ? 'bg-cyan-50 text-cyan-700'
      : moduleId === 'k11'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-teal-50 text-teal-700';

  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${color}`}>
      <Calculator aria-hidden="true" className="h-6 w-6" />
    </span>
  );
}

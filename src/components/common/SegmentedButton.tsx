import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SegmentedButtonProps = {
  active: boolean;
  icon: IconComponent;
  label: string;
  onClick: () => void;
};

export function SegmentedButton({ active, icon: Icon, label, onClick }: SegmentedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
        active
          ? 'bg-slate-950 text-white'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700'
      }`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

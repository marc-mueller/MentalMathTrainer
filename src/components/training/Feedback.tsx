import { Check, X } from 'lucide-react';
import type { TranslationSet } from '../../i18n/copy';
import type { FeedbackState } from '../../types';

type FeedbackProps = {
  feedback: FeedbackState;
  t: TranslationSet;
};

export function Feedback({ feedback, t }: FeedbackProps) {
  if (!feedback) {
    return <div className="min-h-8 text-sm font-medium text-slate-500">&nbsp;</div>;
  }

  const isCorrect = feedback === 'correct';

  return (
    <div className={`flex min-h-8 items-center gap-2 text-sm font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
      {isCorrect ? <Check aria-hidden="true" className="h-5 w-5" /> : <X aria-hidden="true" className="h-5 w-5" />}
      <span>{isCorrect ? `${t.right}. ${t.nextComing}.` : t.wrong}</span>
    </div>
  );
}

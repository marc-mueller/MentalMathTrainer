import moduleData from '../data/modules.json';
import type { Language, LocalizedText, MathModule, Problem, RawModule } from '../types';

export function expandModules(modules: RawModule[]): MathModule[] {
  return modules.map((module) => {
    if (module.kind === 'multiplication-grid') {
      if (!module.range) {
        throw new Error(`Module ${module.id} is missing a multiplication range`);
      }

      const problems: Problem[] = [];
      for (let left = module.range.from; left <= module.range.to; left += 1) {
        for (let right = module.range.from; right <= module.range.to; right += 1) {
          problems.push({
            id: `${module.id}-${left}-${right}`,
            group: left,
            left: String(left),
            right: String(right),
            answer: String(left * right),
          });
        }
      }

      return { ...module, problems };
    }

    if (!module.problems) {
      throw new Error(`Module ${module.id} is missing problems`);
    }

    return { ...module, problems: module.problems };
  });
}

export function localize(value: LocalizedText | string, language: Language): string {
  if (typeof value === 'string') return value;
  return value[language] ?? value.en ?? '';
}

export const mathModules = expandModules(moduleData as RawModule[]);

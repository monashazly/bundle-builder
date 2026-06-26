'use client';

import { useBundleStore } from '@/store/bundleStore';
import { AccordionStep } from './AccordionStep';

export function Accordion() {
  const categories = useBundleStore((s) => s.categories);
  const activeStep = useBundleStore((s) => s.activeStep);
  const { setActiveStep } = useBundleStore.getState();

  return (
    <div className="flex flex-col gap-[13px]">
      {categories.map((category, index) => {
        const nextCategory = categories[index + 1];
        const nextLabel = nextCategory ? `Next: ${nextCategory.label}` : 'Done';

        return (
          <AccordionStep
            key={category.id}
            category={category}
            isActive={activeStep === category.stepIndex}
            onToggle={() => {
              setActiveStep(activeStep === category.stepIndex ? 0 : category.stepIndex);
            }}
            onNext={() => setActiveStep(category.stepIndex + 1)}
            nextLabel={nextLabel}
          />
        );
      })}
    </div>
  );
}

'use client';

import { Accordion } from '@/components/Accordion';
import { AccordionSkeleton } from '@/components/Accordion/AccordionSkeleton';
import { ReviewPanel } from '@/components/ReviewPanel';
import { ReviewPanelSkeleton } from '@/components/ReviewPanel/ReviewPanelSkeleton';
import { useBundleStore } from '@/store/bundleStore';
import { useEffect } from 'react';

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-text-muted">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-prim-600 text-text-on-brand rounded-lg hover:bg-prim-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

export function BundleBuilder() {
  const init = useBundleStore((s) => s.init);
  const loading = useBundleStore((s) => s.loading);
  const error = useBundleStore((s) => s.error);
  const categories = useBundleStore((s) => s.categories);

  useEffect(() => {
    init();
  }, []);

  if (error) return <ErrorState error={error} onRetry={init} />;

  const showSkeleton = loading || categories.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[60px] xl:px-[122px] py-[50px]">
        {/* Mobile-only hero heading */}
        <h1 className="lg:hidden text-[30px] font-bold text-[#0B0D10] text-center pb-[24px]">
          Let&apos;s get started!
        </h1>

        <div className="flex flex-col lg:flex-row gap-[29px] items-start">
          <div className="w-full lg:flex-1 lg:min-w-0">
            {showSkeleton ? <AccordionSkeleton /> : <Accordion />}
          </div>

          <div className="w-full lg:w-[399px] lg:flex-shrink-0 lg:sticky lg:top-[50px]">
            {showSkeleton ? <ReviewPanelSkeleton /> : <ReviewPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}

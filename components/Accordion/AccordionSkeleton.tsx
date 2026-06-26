'use client';

function StepSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-[15px] pt-[5px] pb-[5px]">
        <div className="h-[12px] w-[80px] bg-gray-100 rounded animate-pulse mb-[5px]" />
        <div className="flex items-center gap-[8px] py-[20px] -mx-[15px] w-[calc(100%+30px)] px-[15px]">
          <div className="w-[30px] h-[30px] rounded bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 h-[22px] bg-gray-100 rounded animate-pulse" />
          <div className="w-[80px] h-[14px] bg-gray-100 rounded animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function AccordionSkeleton() {
  return (
    <div className="flex flex-col gap-[13px]">
      {[1, 2, 3, 4].map((i) => (
        <StepSkeleton key={i} />
      ))}
    </div>
  );
}

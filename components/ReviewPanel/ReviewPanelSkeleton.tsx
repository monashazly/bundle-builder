'use client';

export function ReviewPanelSkeleton() {
  return (
    <div className="bg-secondary-active rounded-[10px] pt-[15px] px-[15px] pb-[20px]">
      {/* REVIEW label */}
      <div className="h-[12px] w-[50px] bg-gray-100 rounded animate-pulse mb-[10px]" />

      {/* Title */}
      <div className="h-[32px] w-[180px] bg-gray-100 rounded animate-pulse mb-[8px]" />
      {/* Subtitle */}
      <div className="h-[14px] w-full bg-gray-100 rounded animate-pulse mb-[4px]" />
      <div className="h-[14px] w-[70%] bg-gray-100 rounded animate-pulse mb-[30px]" />

      {/* Item rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-[12px] mb-[16px]">
          <div className="w-[48px] h-[48px] rounded bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <div className="h-[14px] w-[120px] bg-gray-100 rounded animate-pulse mb-[6px]" />
            <div className="h-[12px] w-[80px] bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-[50px] h-[14px] bg-gray-100 rounded animate-pulse flex-shrink-0" />
        </div>
      ))}

      {/* Checkout button */}
      <div className="h-[48px] w-full bg-gray-100 rounded-[4px] animate-pulse mt-[10px]" />
    </div>
  );
}

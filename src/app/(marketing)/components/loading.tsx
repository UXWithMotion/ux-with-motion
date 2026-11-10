import React from "react";

export default function ComponentsLoading() {
  const skeletonColumns = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="w-full min-h-screen bg-[#FBFCFD] pb-32">
      <div className="w-full px-6 lg:px-[70px] pt-8">
        <div className="flex gap-[24px] w-full items-start">
          {skeletonColumns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[24px] flex-1 min-w-0">
              {col.map((i) => (
                <div
                  key={i}
                  className="bg-[#F1F1F2] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip min-h-[253px]"
                >
                  {/* Top Bar Skeleton */}
                  <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 min-h-[50px]">
                    <div className="w-[60px] h-[22px] bg-[#E5E7EB] rounded-full animate-pulse ml-2" />
                    <div className="flex gap-[6px] items-center">
                      <div className="size-[34px] bg-[#E5E7EB] rounded-full animate-pulse" />
                      <div className="size-[34px] bg-[#E5E7EB] rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Preview Area Skeleton */}
                  <div className="h-[151px] w-full relative flex items-center justify-center shrink-0 overflow-hidden">
                    <div className="w-[120px] h-[38px] bg-[#E5E7EB] rounded-xl animate-pulse" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="flex items-center p-[16px] w-full shrink-0 mt-auto border-t border-[#DEE1E4]/60">
                    <div className="w-[130px] h-[18px] bg-[#E5E7EB] rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

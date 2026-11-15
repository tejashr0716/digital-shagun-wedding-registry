import React from "react";

interface ProgressBarProps {
  collected: number;
  target: number;
  percentage: number;
  showTarget?: boolean;
}

export default function ProgressBar({
  collected,
  target,
  percentage,
  showTarget = true,
}: ProgressBarProps) {
  const cappedPercentage = Math.min(Math.max(percentage, 0), 100);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-baseline text-xs font-medium">
        <div>
          <span className="text-gray-500">Collected: </span>
          <span className="font-bold text-gray-900 text-sm">{formatINR(collected)}</span>
        </div>
        {showTarget && (
          <div>
            <span className="text-gray-500">Target: </span>
            <span className="font-semibold text-gray-700">{formatINR(target)}</span>
          </div>
        )}
      </div>

      <div className="w-full bg-rose-100 rounded-full h-3 overflow-hidden p-0.5 border border-rose-200">
        <div
          className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-500">
        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
          {cappedPercentage.toFixed(1)}% Funded
        </span>
        {showTarget && target > collected && (
          <span>{formatINR(target - collected)} to reach goal</span>
        )}
      </div>
    </div>
  );
}

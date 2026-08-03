import React from 'react';
import { Activity } from 'lucide-react';

const AnalyticsChart = ({ workouts }) => {
  const chartData = [...workouts]
    .slice(0, 7)
    .reverse()
    .map((w) => ({
      title: w.title,
      volume: (w.load || 0) * (w.reps || 0),
      date: new Date(w.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    }));

  const hasData = chartData.length > 0;

  const width = 600;
  const height = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVolume = hasData ? Math.max(...chartData.map((d) => d.volume), 100) : 100;
  const yMax = Math.ceil(maxVolume / 50) * 50;

  const getX = (index) => {
    if (chartData.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (chartData.length - 1)) * chartWidth;
  };

  const getY = (volume) => {
    return paddingTop + chartHeight - (volume / yMax) * chartHeight;
  };

  let linePath = '';
  let areaPath = '';

  if (hasData) {
    chartData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.volume);
      if (i === 0) {
        linePath += `M ${x} ${y}`;
        areaPath += `M ${x} ${paddingTop + chartHeight} L ${x} ${y}`;
      } else {
        const prevX = getX(i - 1);
        const prevY = getY(chartData[i - 1].volume);
        const cpX1 = prevX + (x - prevX) / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + (x - prevX) / 2;
        const cpY2 = y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        areaPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }

      if (i === chartData.length - 1) {
        areaPath += ` L ${x} ${paddingTop + chartHeight} Z`;
      }
    });
  }

  const yTicks = [0, yMax / 2, yMax];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
        <Activity size={18} className="text-indigo-400" />
        Workout Volume Trend
      </h3>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          No data available to display trend.
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {yTicks.map((tick, index) => {
              const y = getY(tick);
              return (
                <g key={index}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    className="stroke-slate-800/60"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    {Math.round(tick)} kg
                  </text>
                </g>
              );
            })}

            {/* Area Path */}
            {areaPath && <path d={areaPath} fill="url(#chart-gradient)" />}

            {/* Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_4px_6px_rgba(99,102,241,0.2)]"
              />
            )}

            {/* Data Dots */}
            {chartData.map((d, i) => {
              const x = getX(i);
              const y = getY(d.volume);
              return (
                <g key={i} className="group/dot">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-indigo-500 stroke-slate-900 stroke-2 cursor-pointer hover:r-5 transition-all duration-150"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="fill-slate-200 text-[9px] font-bold opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none"
                  >
                    {d.volume}
                  </text>
                  <text
                    x={x}
                    y={paddingTop + chartHeight + 18}
                    className="fill-slate-500 text-[10px] text-center"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;

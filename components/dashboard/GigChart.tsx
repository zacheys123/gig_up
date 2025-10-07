import React from "react";

const data = [
  { month: "Jan", gigs: 2 },
  { month: "Feb", gigs: 3 },
  { month: "Mar", gigs: 5 },
  { month: "Apr", gigs: 4 },
  { month: "May", gigs: 7 },
  { month: "Jun", gigs: 6 },
];

export default function GigChart() {
  // Chart dimensions and margins
  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const xScale = (index: number) =>
    margin.left + (index * innerWidth) / (data.length - 1);
  const yScale = (value: number) => {
    const maxValue = Math.max(...data.map((item) => item.gigs));
    return margin.top + innerHeight - (value / maxValue) * innerHeight;
  };

  // Generate path data for the line
  const linePath = data
    .map((item, index) => {
      const x = xScale(index);
      const y = yScale(item.gigs);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={margin.left}
            y1={yScale(tick)}
            x2={width - margin.right}
            y2={yScale(tick)}
            stroke="#2D3748"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        ))}

        {/* X axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#2D3748"
          strokeWidth={1}
        />

        {/* Y axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#2D3748"
          strokeWidth={1}
        />

        {/* X axis labels */}
        {data.map((item, index) => (
          <text
            key={`x-label-${index}`}
            x={xScale(index)}
            y={height - margin.bottom / 2}
            textAnchor="middle"
            fill="#A0AEC0"
            fontSize="12"
          >
            {item.month}
          </text>
        ))}

        {/* Y axis labels */}
        {[0, 2, 4, 6].map((tick) => (
          <text
            key={`y-label-${tick}`}
            x={margin.left - 10}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#A0AEC0"
            fontSize="12"
          >
            {tick}
          </text>
        ))}

        {/* Line path */}
        <path d={linePath} fill="none" stroke="#ED8936" strokeWidth="2" />

        {/* Data points */}
        {data.map((item, index) => (
          <circle
            key={`point-${index}`}
            cx={xScale(index)}
            cy={yScale(item.gigs)}
            r="4"
            fill="#ED8936"
          />
        ))}

        {/* Interactive elements (hover effects would need JS) */}
      </svg>
    </div>
  );
}

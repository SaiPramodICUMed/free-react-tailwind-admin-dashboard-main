import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

interface ChartData {
  segmentName: string;
  value: number;
  valueForUnknown: number;
}

const formatUSD = (value: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return "€0";
  return `€${num.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
};

const renderLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#000"
      textAnchor="middle"
      fontSize={12}
    >
      {formatUSD(value)}
    </text>
  );
};

interface SimpleBarChartProps {
  data: ChartData[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  return (
    <BarChart
      style={{
        width: "100%",
        maxWidth: "1200px",
        maxHeight: "70vh",
        aspectRatio: 1.5,
      }}
      data={data}
      margin={{ top: 20, right: 20, left: 60, bottom: 120 }}
    >
      <defs>
        <linearGradient id="pvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.35 0.15 255.71)" />
          <stop offset="50%" stopColor="oklch(0.47 0.15 255.71)" />
          <stop offset="100%" stopColor="oklch(0.35 0.15 255.71)" />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="segmentName" interval={0} angle={-90} textAnchor="end" />
      <YAxis tickFormatter={formatUSD} />
      <Tooltip formatter={(value: any) => formatUSD(value)} />
      <Bar dataKey="value" fill="url(#pvGradient)">
        <LabelList dataKey="value" content={renderLabel} />
      </Bar>
    </BarChart>
  );
};

export default SimpleBarChart;
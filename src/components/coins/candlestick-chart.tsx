import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OhlcCandle } from "../../types/coin";
import { formatPriceTick } from "../../utils/format-price";

interface CandlestickChartProps {
  candles: OhlcCandle[];
  timeLabelFormatter: (timeMs: number) => string;
  fullDateFormatter: (timeMs: number) => string;
}

interface CandleShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: OhlcCandle;
}

// Custom shape for a Bar with dataKey [low, high]: draws a wick for the
// full range and a body rectangle for open/close.
function Candle(props: CandleShapeProps) {
  const { x, y, width, height, payload } = props;
  if (x === undefined || y === undefined || width === undefined || height === undefined || !payload) {
    return null;
  }

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? "var(--positive)" : "var(--negative)";

  const priceRange = high - low || 1;
  const priceToY = (price: number) => y + height * (1 - (price - low) / priceRange);

  const openY = priceToY(open);
  const closeY = priceToY(close);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

  const wickX = x + width / 2;
  const bodyWidth = Math.max(width * 0.6, 2);
  const bodyX = x + (width - bodyWidth) / 2;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect x={bodyX} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={color} />
    </g>
  );
}

function CandleTooltip({
  active,
  payload,
  fullDateFormatter,
}: {
  active?: boolean;
  payload?: Array<{ payload: OhlcCandle }>;
  fullDateFormatter: (timeMs: number) => string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const candle = payload[0].payload;
  return (
    <div
      dir="rtl"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        color: "var(--text-primary)",
        direction: "rtl",
        textAlign: "right",
      }}
    >
      <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>
        {fullDateFormatter(candle.time)}
      </div>
      <div>פתיחה: {formatPriceTick(candle.open)}</div>
      <div>שיא: {formatPriceTick(candle.high)}</div>
      <div>שפל: {formatPriceTick(candle.low)}</div>
      <div>סגירה: {formatPriceTick(candle.close)}</div>
    </div>
  );
}

export default function CandlestickChart({
  candles,
  timeLabelFormatter,
  fullDateFormatter,
}: CandlestickChartProps) {
  const data = candles.map((candle) => ({
    ...candle,
    range: [candle.low, candle.high] as [number, number],
    timeLabel: timeLabelFormatter(candle.time),
  }));

  return (
    // Forced LTR so the Y-axis labels render outside the plot area.
    <div style={{ direction: "ltr" }} dir="ltr">
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={data} margin={{ top: 12, right: 24, bottom: 8, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="timeLabel" stroke="var(--text-tertiary)" fontSize={12} minTickGap={24} />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 12.5 }}
            tickLine={{ stroke: "var(--text-tertiary)" }}
            axisLine={{ stroke: "var(--border-strong)" }}
            domain={["auto", "auto"]}
            width={80}
            tickFormatter={formatPriceTick}
          />
          <Tooltip content={<CandleTooltip fullDateFormatter={fullDateFormatter} />} />
          <Bar dataKey="range" shape={Candle} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

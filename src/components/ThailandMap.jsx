import { useState, useMemo } from 'react';
import { THAILAND_PROVINCES, THAILAND_REGIONS, PROVINCE_TO_REGION } from '../data/thailandMapData';

/**
 * ThailandMap - Interactive SVG choropleth map of Thailand
 *
 * Props:
 *   - data: Object mapping province IDs (e.g. "TH-10") or region names to numeric values
 *   - mode: "province" | "region" (default: "region")
 *   - colorScale: function(value, min, max) => color string (optional)
 *   - onProvinceClick: function(provinceId, title, region) (optional)
 *   - onRegionClick: function(regionName) (optional)
 *   - width / height: SVG dimensions (default: 100%)
 *   - showTooltip: boolean (default: true)
 *   - showLegend: boolean (default: true)
 *   - className: additional CSS class
 *
 * Usage (region mode):
 *   <ThailandMap data={{ Northern: 85, Northeastern: 72, Central: 95, Eastern: 68, Western: 45, Southern: 60 }} />
 *
 * Usage (province mode):
 *   <ThailandMap mode="province" data={{ "TH-10": 100, "TH-50": 80 }} />
 */
export default function ThailandMap({
  data = {},
  mode = 'region',
  colorScale,
  onProvinceClick,
  onRegionClick,
  width = '100%',
  height = '100%',
  showTooltip = true,
  showLegend = true,
  className = '',
}) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Compute value range
  const { min, max } = useMemo(() => {
    const vals = Object.values(data).filter(v => typeof v === 'number');
    if (vals.length === 0) return { min: 0, max: 100 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [data]);

  // Default color scale: blue gradient
  const defaultColorScale = (value, mn, mx) => {
    if (value == null) return '#e5e7eb'; // gray for no data
    const t = mx === mn ? 0.5 : (value - mn) / (mx - mn);
    // Interpolate from light blue to dark blue
    const r = Math.round(219 - t * 180);
    const g = Math.round(234 - t * 150);
    const b = Math.round(254 - t * 50);
    return `rgb(${r},${g},${b})`;
  };

  const getColor = colorScale || defaultColorScale;

  // Get fill color for a province
  const getProvinceFill = (provinceId) => {
    if (mode === 'region') {
      const region = PROVINCE_TO_REGION[provinceId];
      const value = data[region];
      if (value != null) return getColor(value, min, max);
      // Fallback to region default color
      return THAILAND_REGIONS[region]?.color || '#e5e7eb';
    } else {
      const value = data[provinceId];
      return getColor(value, min, max);
    }
  };

  const getValue = (provinceId) => {
    if (mode === 'region') {
      const region = PROVINCE_TO_REGION[provinceId];
      return data[region];
    }
    return data[provinceId];
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 10,
    });
  };

  const handleClick = (province) => {
    if (mode === 'region' && onRegionClick) {
      onRegionClick(PROVINCE_TO_REGION[province.id]);
    }
    if (onProvinceClick) {
      onProvinceClick(province.id, province.title, PROVINCE_TO_REGION[province.id]);
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        viewBox="-20 -25 589 1059"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
      >
        <g>
          {THAILAND_PROVINCES.map((province) => (
            <path
              key={province.id}
              d={province.d}
              fill={getProvinceFill(province.id)}
              stroke="#fff"
              strokeWidth="0.5"
              strokeOpacity="0.8"
              style={{
                cursor: 'pointer',
                transition: 'fill 0.2s ease, opacity 0.2s ease',
                opacity: hovered && hovered !== province.id &&
                  (mode === 'region'
                    ? PROVINCE_TO_REGION[hovered] !== PROVINCE_TO_REGION[province.id]
                    : true)
                  ? 0.6
                  : 1,
              }}
              onMouseEnter={() => setHovered(province.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(province)}
            />
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hovered && (() => {
        const province = THAILAND_PROVINCES.find(p => p.id === hovered);
        if (!province) return null;
        const region = PROVINCE_TO_REGION[hovered];
        const value = getValue(hovered);
        return (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translateY(-100%)',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="font-semibold">{province.title}</div>
            <div className="text-gray-300">Region: {region}</div>
            {value != null && (
              <div className="text-gray-300">Value: {typeof value === 'number' ? value.toLocaleString() : value}</div>
            )}
          </div>
        );
      })()}

      {/* Legend */}
      {showLegend && mode === 'region' && (
        <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg p-2 text-xs shadow">
          {Object.entries(THAILAND_REGIONS).map(([key, region]) => (
            <div key={key} className="flex items-center gap-1.5 py-0.5">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: data[key] != null ? getColor(data[key], min, max) : region.color }}
              />
              <span className="text-gray-700">{region.label}</span>
              {data[key] != null && (
                <span className="text-gray-500 ml-1">({data[key]})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

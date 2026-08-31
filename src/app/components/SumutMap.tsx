'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { SUMUT_MAP } from '@/data/sumut-map';

interface SumutMapProps {
  selected?: string;
  onSelect?: (name: string) => void;
  className?: string;
}

export default function SumutMap({ selected, onSelect, className = '' }: SumutMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { width, height, lakePath, neighbors, labels, regions } = SUMUT_MAP;

  const handleClick = useCallback((name: string) => {
    onSelect?.(name);
  }, [onSelect]);

  const active = useMemo(() => {
    const s = hovered || selected;
    return regions.find((r) => r.name === s);
  }, [hovered, selected, regions]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Di layar sempit (mobile), peta dirender lebih besar & bisa digeser horizontal */}
      <div className="w-full overflow-x-auto no-scrollbar">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[840px] sm:min-w-0 h-auto select-none"
        role="img"
        aria-label="Peta interaktif Kabupaten/Kota Sumatera Utara"
        style={{
          // Efek memudar: semakin ke tepi, peta semakin transparan (hingga opacity 0)
          maskImage: 'radial-gradient(ellipse 78% 78% at 50% 50%, #000 35%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 78% at 50% 50%, #000 35%, transparent 82%)',
        }}
      >
        {/* Provinsi tetangga (dekoratif, abu-abu pucat, tidak bisa diklik) */}
        {neighbors.map((nb) => (
          <path
            key={nb.name}
            d={nb.d}
            fill="#E4E7EB"
            stroke="#B8C0C9"
            strokeWidth={0.6}
            fillRule="evenodd"
            pointerEvents="none"
          />
        ))}

        {/* Danau Toba (dekoratif) */}
        {lakePath && (
          <path
            d={lakePath}
            fill="#BFE3F2"
            stroke="#7FB6D4"
            strokeWidth={0.8}
            fillRule="evenodd"
            pointerEvents="none"
          />
        )}

        {/* Wilayah Sumatera Utara */}
        {regions.map((r) => {
          const isSelected = r.name === selected;
          const isHovered = r.name === hovered;
          const fill = isSelected
            ? '#059669'
            : isHovered
              ? '#A7F3D0'
              : '#DCF0E6';
          return (
            <path
              key={r.name}
              d={r.d}
              fill={fill}
              stroke={isSelected || isHovered ? '#047857' : '#94B8A8'}
              strokeWidth={isSelected || isHovered ? 1.2 : 0.7}
              className="transition-colors duration-150"
              onClick={() => handleClick(r.name)}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <title>{r.name}</title>
            </path>
          );
        })}

        {/* Label geografis (Selat Malaka, Samudra Hindia, provinsi tetangga) */}
        {labels.map((l) => {
          const isRef = 'ref' in l && !!l.ref;
          return (
            <text
              key={l.text}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isRef ? 10 : 12}
              fontStyle={isRef ? 'normal' : 'italic'}
              fontWeight={isRef ? 700 : 500}
              letterSpacing={isRef ? 1 : 2}
              fill={isRef ? '#9AA3AD' : '#A6AFB8'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {l.text}
            </text>
          );
        })}

        {/* Label wilayah aktif (hover/terpilih) */}
        {active && (
          <text
            x={active.cx}
            y={active.cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={active.name.length > 14 ? 9 : 11}
            fontWeight={700}
            fill={active.name === selected ? '#FFFFFF' : '#065F46'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {active.name}
          </text>
        )}
      </svg>
      </div>

      {active && (
        <p className="text-xs font-bold text-emerald-dark">
          {active.name === selected ? `Terpilih: ${active.name}` : active.name}
        </p>
      )}
      {!active && (
        <p className="text-xs text-muted-foreground">
          Klik wilayah pada peta untuk memilih Kabupaten/Kota
        </p>
      )}
    </div>
  );
}

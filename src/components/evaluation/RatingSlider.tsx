"use client"

import { Info } from "lucide-react"

interface RatingSliderProps {
  label: string
  value: number          // 1-5
  onChange: (v: number) => void
  description?: string
  gradient?: string      // Tailwind gradient classes (ex: "from-emerald-400 to-emerald-600")
  borderColor?: string   // Tailwind border color for thumb (ex: "border-emerald-500")
}

const STEP_LABELS = ["1", "2", "3", "4", "5"]

export function RatingSlider({
  label,
  value,
  onChange,
  description,
  gradient = "from-pitch-400 to-pitch-600",
  borderColor = "border-pitch-500",
}: RatingSliderProps) {
  const pct = ((value - 1) / 4) * 100

  return (
    <div className="group">
      {/* Header : label + tooltip + valeur */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          {description && (
            <div className="relative">
              <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg bg-slate-800 text-xs text-white leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-lg">
                {description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          )}
        </div>
        <span className="text-lg font-bold tabular-nums text-slate-900">
          {value}<span className="text-slate-300 text-sm font-normal">/5</span>
        </span>
      </div>

      {/* Slider */}
      <div className="relative flex items-center h-7">
        {/* Track background */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-100" />
        {/* Filled track */}
        <div
          className={`absolute left-0 h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-75`}
          style={{ width: `${pct}%` }}
        />
        {/* Step markers */}
        <div className="absolute inset-x-0 flex justify-between px-0">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i + 1 <= value ? "bg-white/70" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
        {/* Native range input */}
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`relative z-10 w-full h-7 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:${borderColor}
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:${borderColor}
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-track]:appearance-none
            [&::-moz-range-track]:bg-transparent
            [&::-moz-range-track]:h-2
          `}
        />
      </div>
    </div>
  )
}

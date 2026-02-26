interface RangeSliderProps {
  min: number;
  max: number;
  value: { min: number | null; max: number | null };
  onChange: (value: { min: number | null; max: number | null }) => void;
  label?: string;
  formatValue?: (value: number) => string;
}

const RangeSlider = ({ min, max, value, onChange, label, formatValue }: RangeSliderProps) => {
  const currentMin = value.min ?? min;
  const currentMax = value.max ?? max;
  const format = formatValue ?? ((v) => String(v));

  return (
    <div className="flex flex-col gap-1 min-w-48">
      {/* Label + current range */}
      <div className="flex justify-between text-xs text-gray-500">
        {label && <span>{label}</span>}
        <span className="ml-auto">
          {format(currentMin)} – {format(currentMax)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-5 flex items-center">
        {/* Base track */}
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />

        {/* Active range */}
        <div
          className="absolute h-1.5 bg-slate-700 rounded-full"
          style={{
            left: `${((currentMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((currentMax - min) / (max - min)) * 100}%`
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={currentMin}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= currentMax) onChange({ ...value, min: val === min ? null : val });
          }}
          className="absolute w-full appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-700
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-md"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={currentMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= currentMin) onChange({ ...value, max: val === max ? null : val });
          }}
          className="absolute w-full appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-700
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>
    </div>
  );
};

export default RangeSlider;

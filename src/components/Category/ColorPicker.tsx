import { CATEGORY_COLOR_DISPLAY_MAP } from '../../constants/categories';
import type { CategoryColor } from '../../types/category';
import { Check } from 'lucide-react';

interface ColorPickerProps {
    value: CategoryColor;
    onChange: (color: CategoryColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const colors = Object.keys(CATEGORY_COLOR_DISPLAY_MAP) as CategoryColor[];

    return (
        <div className="flex gap-3">
            {colors.map((color) => {
                const isSelected = value === color;
                const { bg, ring } = CATEGORY_COLOR_DISPLAY_MAP[color];

                return (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`
                            relative w-8 h-8 rounded-full transition-all duration-200
                            ${bg} hover:scale-110
                            ${isSelected ? `ring-2 ring-offset-2 ${ring} scale-110` : 'opacity-80 hover:opacity-100'}
                        `}
                        title={color}
                    >
                        {isSelected && (
                            <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

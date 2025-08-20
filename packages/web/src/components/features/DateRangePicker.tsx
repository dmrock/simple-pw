import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from '../../types/api';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (dateRange: DateRange) => void;
  className?: string;
}

interface PresetOption {
  label: string;
  value: string;
  getDates: () => DateRange;
}

const presetOptions: PresetOption[] = [
  {
    label: 'Last 7 days',
    value: '7',
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 6)).toISOString(),
      to: endOfDay(new Date()).toISOString(),
    }),
  },
  {
    label: 'Last 30 days',
    value: '30',
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 29)).toISOString(),
      to: endOfDay(new Date()).toISOString(),
    }),
  },
  {
    label: 'Last 90 days',
    value: '90',
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 89)).toISOString(),
      to: endOfDay(new Date()).toISOString(),
    }),
  },
];

export function DateRangePicker({
  value,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('30'); // Default to 30 days

  // Find current preset or use custom
  const currentPreset = presetOptions.find((option) => {
    if (!value) return option.value === selectedPreset;
    const presetDates = option.getDates();
    return presetDates.from === value.from && presetDates.to === value.to;
  });

  const displayLabel = currentPreset ? currentPreset.label : 'Custom range';

  const handlePresetSelect = (preset: PresetOption) => {
    setSelectedPreset(preset.value);
    onChange(preset.getDates());
    setIsOpen(false);
  };

  // Initialize with default range if no value provided
  if (!value && selectedPreset) {
    const defaultPreset = presetOptions.find((p) => p.value === selectedPreset);
    if (defaultPreset) {
      onChange(defaultPreset.getDates());
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        <span className="text-sm">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20">
            <div className="py-1">
              {presetOptions.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    selectedPreset === preset.value
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              {/* Separator */}
              <div className="border-t border-gray-600 my-1" />

              {/* Custom range option (placeholder for future enhancement) */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 transition-colors"
                disabled
              >
                Custom range (coming soon)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get default date range
export function getDefaultDateRange(): DateRange {
  const defaultPreset = presetOptions[1];
  if (!defaultPreset) {
    throw new Error('Default preset not found');
  }
  return defaultPreset.getDates(); // Default to 30 days
}

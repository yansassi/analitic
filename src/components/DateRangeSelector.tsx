import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { DateRange } from '../utils/dateFilter';

interface DateRangeSelectorProps {
    selectedRange: DateRange;
    onRangeChange: (range: DateRange) => void;
    darkMode: boolean;
}

const DateRangeSelector = ({ selectedRange, onRangeChange, darkMode }: DateRangeSelectorProps) => {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    const ranges: { value: string; label: string }[] = [
        { value: '7d', label: '7 dias' },
        { value: '14d', label: '14 dias' },
        { value: '30d', label: '30 dias' },
        { value: '60d', label: '60 dias' },
        { value: '90d', label: '90 dias' },
        { value: 'all', label: 'Todo o período' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowCustomPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCustomSubmit = () => {
        if (startDate && endDate) {
            onRangeChange({
                start: new Date(startDate),
                end: new Date(endDate)
            });
            setShowCustomPicker(false);
        }
    };

    const isCustom = typeof selectedRange === 'object';
    const currentLabel = isCustom
        ? `${selectedRange.start.toLocaleDateString()} - ${selectedRange.end.toLocaleDateString()}`
        : ranges.find(r => r.value === selectedRange)?.label || 'Personalizado';

    return (
        <div className="relative" ref={pickerRef}>
            <div className={`flex items-center gap-2 p-1 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className={`px-3 py-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-5 h-5" />
                </div>

                {/* Desktop: Botões para ranges comuns */}
                <div className="hidden md:flex gap-1 overflow-x-auto hide-scrollbar">
                    {ranges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => onRangeChange(range.value as any)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${!isCustom && selectedRange === range.value
                                ? darkMode
                                    ? 'bg-gray-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-900 shadow-sm'
                                : darkMode
                                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}

                    <button
                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${isCustom
                            ? darkMode
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-blue-100 text-blue-700 shadow-sm'
                            : darkMode
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {isCustom ? currentLabel : 'Personalizado'}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>

                {/* Mobile: Dropdown simplificado (se necessário, mas focando no pedido do usuário) */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                        {isCustom ? currentLabel : (ranges.find(r => r.value === selectedRange)?.label || 'Selecione')}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Popover de Data Personalizada */}
            {showCustomPicker && (
                <div className={`absolute top-full right-0 mt-2 p-4 rounded-xl shadow-2xl z-50 w-72 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Data Personalizada</h3>
                        <button onClick={() => setShowCustomPicker(false)} className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Início</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`w-full p-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fim</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`w-full p-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>

                        <button
                            onClick={handleCustomSubmit}
                            disabled={!startDate || !endDate}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${startDate && endDate
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                }`}
                        >
                            Aplicar Filtro
                        </button>

                        {/* Lista de opções rápidas para Mobile dentro do popover */}
                        <div className="md:hidden pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
                            {ranges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => {
                                        onRangeChange(range.value as any);
                                        setShowCustomPicker(false);
                                    }}
                                    className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedRange === range.value
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeSelector;

import React from 'react';
import { TikTokData } from '../types';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface TikTokAudienceProps {
    data: TikTokData;
    darkMode: boolean;
}

const TikTokAudience: React.FC<TikTokAudienceProps> = ({ data, darkMode }) => {
    const { gender, territories } = data.audience;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: { color: darkMode ? '#e5e7eb' : '#374151' }
            },
        },
    };

    const barOptions = {
        responsive: true,
        indexAxis: 'y' as const,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' },
                grid: { display: false }
            },
            x: {
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' },
                grid: { color: darkMode ? '#374151' : '#e5e7eb' }
            }
        }
    };

    const genderData = {
        labels: gender.map(g => g.category),
        datasets: [
            {
                data: gender.map(g => g.percentage),
                backgroundColor: [
                    '#ec4899', // Rosa para Feminino
                    '#3b82f6', // Azul para Masculino
                    '#9ca3af', // Cinza para Outros
                ],
                borderWidth: 0,
            },
        ],
    };

    const territoryData = {
        labels: territories.slice(0, 10).map(t => t.category),
        datasets: [
            {
                label: 'Porcentagem',
                data: territories.slice(0, 10).map(t => t.percentage),
                backgroundColor: '#8b5cf6',
                borderRadius: 4,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gênero */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gênero
                </h3>
                <div className="h-64 flex items-center justify-center">
                    <Doughnut data={genderData} options={chartOptions} />
                </div>
            </div>

            {/* Territórios */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Principais Territórios
                </h3>
                <div className="h-64">
                    <Bar data={territoryData} options={barOptions} />
                </div>
            </div>
        </div>
    );
};

export default TikTokAudience;

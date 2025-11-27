import React from 'react';
import { TikTokData } from '../types';
import { Eye, Heart, MessageCircle, Share2, Users, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TikTokOverviewProps {
    data: TikTokData;
    darkMode: boolean;
}

const TikTokOverview: React.FC<TikTokOverviewProps> = ({ data, darkMode }) => {
    const { summary, overview } = data;

    const cards = [
        { title: 'Visualizações de Vídeo', value: summary.totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' },
        { title: 'Curtidas', value: summary.totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
        { title: 'Comentários', value: summary.totalComments, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100' },
        { title: 'Compartilhamentos', value: summary.totalShares, icon: Share2, color: 'text-yellow-500', bg: 'bg-yellow-100' },
        { title: 'Seguidores', value: summary.totalFollowers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
        { title: 'Posts Publicados', value: summary.totalPosts, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: darkMode ? '#e5e7eb' : '#374151' }
            },
            title: { display: false },
        },
        scales: {
            y: {
                grid: { color: darkMode ? '#374151' : '#e5e7eb' },
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
            },
            x: {
                grid: { display: false },
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' }
            }
        }
    };

    const createChartData = (label: string, metricData: { date: string, value: number }[], color: string) => ({
        labels: metricData.map(d => new Date(d.date).toLocaleDateString('pt-BR')),
        datasets: [
            {
                label,
                data: metricData.map(d => d.value),
                borderColor: color,
                backgroundColor: color + '20',
                fill: true,
                tension: 0.4,
            },
        ],
    });

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {card.value.toLocaleString('pt-BR')}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Visualizações de Vídeo</h3>
                    <Line options={chartOptions} data={createChartData('Visualizações', overview.videoViews, '#3b82f6')} />
                </div>
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Seguidores</h3>
                    <Line options={chartOptions} data={createChartData('Seguidores', overview.followers, '#8b5cf6')} />
                </div>
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Visitas ao Perfil</h3>
                    <Line options={chartOptions} data={createChartData('Visitas', overview.profileViews, '#ec4899')} />
                </div>
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Curtidas</h3>
                    <Line options={chartOptions} data={createChartData('Curtidas', overview.likes, '#ef4444')} />
                </div>
            </div>
        </div>
    );
};

export default TikTokOverview;

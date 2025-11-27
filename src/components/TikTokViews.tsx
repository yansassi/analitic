import React from 'react';
import { TikTokData } from '../types';
import { Eye, TrendingUp, Video, BarChart3, Award } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
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
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TikTokViewsProps {
    data: TikTokData;
    darkMode: boolean;
}

const TikTokViews: React.FC<TikTokViewsProps> = ({ data, darkMode }) => {
    // Calcular métricas
    const totalViews = data.summary.totalViews;
    const avgViewsPerVideo = data.summary.totalPosts > 0 ? Math.round(totalViews / data.summary.totalPosts) : 0;
    const totalVideos = data.summary.totalPosts;

    // Calcular taxa de engajamento (likes por view)
    const engagementRate = totalViews > 0 ? ((data.summary.totalLikes / totalViews) * 100).toFixed(2) : 0;

    // Top 10 vídeos mais visualizados
    const topVideos = [...data.posts]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Cards de resumo
    const summaryCards = [
        { title: 'Total de Visualizações', value: totalViews.toLocaleString('pt-BR'), icon: Eye, color: 'text-black', bg: 'bg-gray-200' },
        { title: 'Média por Vídeo', value: avgViewsPerVideo.toLocaleString('pt-BR'), icon: BarChart3, color: 'text-red-500', bg: 'bg-red-100' },
        { title: 'Total de Vídeos', value: totalVideos.toLocaleString('pt-BR'), icon: Video, color: 'text-blue-500', bg: 'bg-blue-100' },
        { title: 'Taxa de Engajamento', value: `${engagementRate}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' },
    ];

    // Dados para gráfico de linha (evolução)
    const lineChartData = {
        labels: data.overview.videoViews.map(v => new Date(v.date).toLocaleDateString('pt-BR')),
        datasets: [
            {
                label: 'Visualizações de Vídeo',
                data: data.overview.videoViews.map(v => v.value),
                borderColor: '#000000',
                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Dados para gráfico de barras (Top 10)
    const barChartData = {
        labels: topVideos.map(v => v.title.substring(0, 30) + '...'),
        datasets: [
            {
                label: 'Views',
                data: topVideos.map(v => v.views),
                backgroundColor: darkMode ? '#374151' : '#d1d5db',
                borderColor: '#000000',
                borderWidth: 1,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                titleColor: darkMode ? '#f3f4f6' : '#111827',
                bodyColor: darkMode ? '#f3f4f6' : '#111827',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
                borderWidth: 1,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: darkMode ? '#374151' : '#e5e7eb' },
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' },
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: darkMode ? '#9ca3af' : '#4b5563',
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                titleColor: darkMode ? '#f3f4f6' : '#111827',
                bodyColor: darkMode ? '#f3f4f6' : '#111827',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: darkMode ? '#374151' : '#e5e7eb' },
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' },
            },
            y: {
                grid: { display: false },
                ticks: { color: darkMode ? '#9ca3af' : '#4b5563' },
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {card.value}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráfico de Evolução */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Evolução de Visualizações
                </h3>
                <div style={{ height: '300px' }}>
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
            </div>

            {/* Gráfico de Top 10 Vídeos */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Top 10 Vídeos Mais Visualizados
                    </h3>
                </div>
                <div style={{ height: '500px' }}>
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
            </div>

            {/* Tabela Detalhada */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Detalhes dos Vídeos Mais Visualizados
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>#</th>
                                <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Título</th>
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Views</th>
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Likes</th>
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comentários</th>
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shares</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topVideos.map((video, index) => (
                                <tr
                                    key={video.id}
                                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                                >
                                    <td className={`py-3 px-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {index + 1}
                                    </td>
                                    <td className={`py-3 px-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <div className="max-w-md truncate">{video.title}</div>
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${darkMode ? 'text-black' : 'text-gray-900'}`}>
                                        {video.views.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {video.likes.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {video.comments.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {video.shares.toLocaleString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TikTokViews;

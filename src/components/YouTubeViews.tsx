import React from 'react';
import { ProcessedData } from '../types';
import { Eye, TrendingUp, Video, BarChart3, Award } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
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

interface YouTubeViewsProps {
    data: ProcessedData;
    darkMode: boolean;
}

const YouTubeViews: React.FC<YouTubeViewsProps> = ({ data, darkMode }) => {
    // Calcular métricas
    const totalViews = data.videos.reduce((acc, v) => acc + v.visualizacoes_intencionais, 0);
    const avgViewsPerVideo = data.videos.length > 0 ? Math.round(totalViews / data.videos.length) : 0;
    const totalVideos = data.videos.length;
    const avgWatchPercentage = data.videos.length > 0
        ? (data.videos.reduce((acc, v) => acc + v.porcentagem_visualizada_media, 0) / data.videos.length).toFixed(1)
        : 0;

    // Top 10 vídeos mais visualizados
    const topVideos = [...data.videos]
        .sort((a, b) => b.visualizacoes_intencionais - a.visualizacoes_intencionais)
        .slice(0, 10);

    // Cards de resumo
    const summaryCards = [
        { title: 'Total de Visualizações', value: totalViews.toLocaleString('pt-BR'), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' },
        { title: 'Média por Vídeo', value: avgViewsPerVideo.toLocaleString('pt-BR'), icon: BarChart3, color: 'text-green-500', bg: 'bg-green-100' },
        { title: 'Total de Vídeos', value: totalVideos.toLocaleString('pt-BR'), icon: Video, color: 'text-purple-500', bg: 'bg-purple-100' },
        { title: '% Visualizada Média', value: `${avgWatchPercentage}%`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-100' },
    ];

    // Dados para gráfico de barras (Top 10)
    const barChartData = {
        labels: topVideos.map(v => v.titulo.substring(0, 30) + '...'),
        datasets: [
            {
                label: 'Visualizações Intencionais',
                data: topVideos.map(v => v.visualizacoes_intencionais),
                backgroundColor: darkMode ? '#3b82f6' : '#60a5fa',
                borderColor: '#2563eb',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
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

            {/* Gráfico de Top 10 Vídeos */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Top 10 Vídeos Mais Visualizados
                    </h3>
                </div>
                <div style={{ height: '400px' }}>
                    <Bar data={barChartData} options={chartOptions} />
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
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>% Visualizada</th>
                                <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Continuaram</th>
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
                                        <div className="max-w-md truncate">{video.titulo}</div>
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {video.visualizacoes_intencionais.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {video.porcentagem_visualizada_media.toFixed(1)}%
                                    </td>
                                    <td className={`py-3 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {video.continuaram_assistindo.toFixed(1)}%
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

export default YouTubeViews;

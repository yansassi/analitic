import React from 'react';
import { InstagramData } from '../types';
import { Eye, TrendingUp, Image as ImageIcon, Film, BarChart3 } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
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
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface InstagramViewsProps {
    data: InstagramData;
    darkMode: boolean;
}

const InstagramViews: React.FC<InstagramViewsProps> = ({ data, darkMode }) => {
    // Calcular métricas
    const totalViews = data.visualizacoes.reduce((acc, v) => acc + v.valor, 0);
    const avgViewsPerDay = data.visualizacoes.length > 0 ? Math.round(totalViews / data.visualizacoes.length) : 0;
    const totalPosts = data.posts.length;
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    // Top posts mais visualizados (assumindo que 'visualizações' está relacionado ao alcance)
    const topPosts = [...data.posts]
        .sort((a, b) => b.alcance - a.alcance)
        .slice(0, 10);

    // Distribuição por tipo
    const postsByType: { [key: string]: number } = {};
    data.posts.forEach(post => {
        const type = post.tipo || 'Outros';
        postsByType[type] = (postsByType[type] || 0) + post.alcance;
    });

    // Cards de resumo
    const summaryCards = [
        { title: 'Total de Visualizações', value: totalViews.toLocaleString('pt-BR'), icon: Eye, color: 'text-pink-500', bg: 'bg-pink-100' },
        { title: 'Média Diária', value: avgViewsPerDay.toLocaleString('pt-BR'), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
        { title: 'Total de Posts', value: totalPosts.toLocaleString('pt-BR'), icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
        { title: 'Média por Post', value: avgViewsPerPost.toLocaleString('pt-BR'), icon: BarChart3, color: 'text-green-500', bg: 'bg-green-100' },
    ];

    // Dados para gráfico de linha (evolução temporal)
    const lineChartData = {
        labels: data.visualizacoes.map(v => new Date(v.data).toLocaleDateString('pt-BR')),
        datasets: [
            {
                label: 'Visualizações',
                data: data.visualizacoes.map(v => v.valor),
                borderColor: '#ec4899',
                backgroundColor: darkMode ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Dados para gráfico de pizza (distribuição por tipo)
    const pieChartData = {
        labels: Object.keys(postsByType),
        datasets: [
            {
                data: Object.values(postsByType),
                backgroundColor: [
                    '#ec4899',
                    '#8b5cf6',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                ],
                borderWidth: 2,
                borderColor: darkMode ? '#1f2937' : '#ffffff',
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

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: { color: darkMode ? '#e5e7eb' : '#374151' },
            },
            tooltip: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                titleColor: darkMode ? '#f3f4f6' : '#111827',
                bodyColor: darkMode ? '#f3f4f6' : '#111827',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
                borderWidth: 1,
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

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolução Temporal */}
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Evolução de Visualizações
                    </h3>
                    <div style={{ height: '300px' }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Distribuição por Tipo */}
                <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Distribuição por Tipo de Conteúdo
                    </h3>
                    <div style={{ height: '300px' }}>
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                </div>
            </div>

            {/* Top Posts */}
            <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Top 10 Posts com Maior Alcance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topPosts.map((post, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl font-bold text-pink-500">#{index + 1}</span>
                                <Film className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {post.tipo || 'Post'}
                            </p>
                            <p className={`text-xs mb-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {post.descricao?.substring(0, 50) || 'Sem descrição'}
                            </p>
                            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {post.alcance.toLocaleString('pt-BR')}
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>alcance</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InstagramViews;

import { useMemo } from 'react';
import type { ProcessedData, InstagramData, TikTokData, PlatformComparison } from '../types';
import {
    extractYouTubeMetrics,
    extractInstagramMetrics,
    extractTikTokMetrics,
    getBestPerformer,
    formatNumber,
    formatPercentage
} from '../utils/comparisonUtils';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { TrendingUp, Eye, Users, Heart, Award, Video } from 'lucide-react';
import YouTubeIcon from './icons/YouTubeIcon';
import InstagramIcon from './icons/InstagramIcon';
import TikTokIcon from './icons/TikTokIcon';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    youtubeData: ProcessedData | null;
    instagramData: InstagramData | null;
    tiktokData: TikTokData | null;
    darkMode: boolean;
}

const PlatformComparison = ({ youtubeData, instagramData, tiktokData, darkMode }: Props) => {
    // Extrai métricas de cada plataforma disponível
    const platforms = useMemo(() => {
        const result: PlatformComparison[] = [];

        if (youtubeData) {
            result.push(extractYouTubeMetrics(youtubeData));
        }
        if (instagramData) {
            result.push(extractInstagramMetrics(instagramData));
        }
        if (tiktokData) {
            result.push(extractTikTokMetrics(tiktokData));
        }

        return result;
    }, [youtubeData, instagramData, tiktokData]);

    // Se não houver pelo menos 2 plataformas, não mostra
    if (platforms.length < 2) {
        return (
            <div className={`text-center py-20 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Comparação de Plataformas
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Importe dados de pelo menos 2 plataformas para visualizar a comparação
                </p>
            </div>
        );
    }

    // Ícones das plataformas
    const getPlatformIcon = (platform: 'youtube' | 'instagram' | 'tiktok') => {
        switch (platform) {
            case 'youtube':
                return <YouTubeIcon className="w-6 h-6" />;
            case 'instagram':
                return <InstagramIcon className="w-6 h-6" />;
            case 'tiktok':
                return <TikTokIcon className="w-6 h-6" />;
        }
    };

    // Helper para opções dos gráficos
    const getChartOptions = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false, text: title },
            tooltip: {
                backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                titleColor: darkMode ? '#FFFFFF' : '#000000',
                bodyColor: darkMode ? '#FFFFFF' : '#000000',
                borderColor: darkMode ? '#374151' : '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatNumber(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
            },
            x: {
                grid: { display: false },
                ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' }
            }
        }
    });

    // Dados para os gráficos
    const chartLabels = platforms.map(p => p.platformName);
    const chartColors = platforms.map(p => p.color);

    const viewsData = {
        labels: chartLabels,
        datasets: [{
            label: 'Visualizações',
            data: platforms.map(p => p.totalViews),
            backgroundColor: chartColors,
            borderRadius: 4,
        }]
    };

    const engagementData = {
        labels: chartLabels,
        datasets: [{
            label: 'Engajamento',
            data: platforms.map(p => p.totalEngagement),
            backgroundColor: chartColors,
            borderRadius: 4,
        }]
    };

    const postsData = {
        labels: chartLabels,
        datasets: [{
            label: 'Posts/Vídeos',
            data: platforms.map(p => p.totalPosts),
            backgroundColor: chartColors,
            borderRadius: 4,
        }]
    };

    const avgViewsData = {
        labels: chartLabels,
        datasets: [{
            label: 'Média de Views',
            data: platforms.map(p => Math.round(p.avgViewsPerPost)),
            backgroundColor: chartColors,
            borderRadius: 4,
        }]
    };

    // Determina os melhores performers
    const bestViewsPlatform = getBestPerformer(platforms, 'totalViews');
    const bestEngagementPlatform = getBestPerformer(platforms, 'totalEngagement');
    const bestEngagementRatePlatform = getBestPerformer(platforms, 'engagementRate');
    const bestGrowthPlatform = getBestPerformer(platforms, 'followersGrowth');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Comparação de Plataformas
                    </h2>
                </div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Comparação de métricas entre {platforms.map(p => p.platformName).join(', ')}
                </p>
            </div>

            {/* Cards de Resumo por Plataforma */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                    <div
                        key={platform.platform}
                        className={`rounded-xl p-6 shadow-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {getPlatformIcon(platform.platform)}
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {platform.platformName}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Visualizações
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatNumber(platform.totalViews)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Heart className="w-4 h-4 inline mr-1" />
                                    Engajamento
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatNumber(platform.totalEngagement)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <TrendingUp className="w-4 h-4 inline mr-1" />
                                    Taxa de Engajamento
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatPercentage(platform.engagementRate)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Video className="w-4 h-4 inline mr-1" />
                                    Posts/Vídeos
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {platform.totalPosts}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Crescimento
                                </span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    +{formatNumber(platform.followersGrowth)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cards de Melhores Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white shadow-lg`}>
                    <Award className="w-6 h-6 mb-2" />
                    <p className="text-sm opacity-90">Mais Visualizações</p>
                    <p className="text-xl font-bold">{bestViewsPlatform}</p>
                </div>

                <div className={`rounded-xl p-4 ${darkMode ? 'bg-gradient-to-br from-pink-900 to-pink-800' : 'bg-gradient-to-br from-pink-500 to-pink-600'} text-white shadow-lg`}>
                    <Award className="w-6 h-6 mb-2" />
                    <p className="text-sm opacity-90">Maior Engajamento</p>
                    <p className="text-xl font-bold">{bestEngagementPlatform}</p>
                </div>

                <div className={`rounded-xl p-4 ${darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'} text-white shadow-lg`}>
                    <Award className="w-6 h-6 mb-2" />
                    <p className="text-sm opacity-90">Melhor Taxa de Engaj.</p>
                    <p className="text-xl font-bold">{bestEngagementRatePlatform}</p>
                </div>

                <div className={`rounded-xl p-4 ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white shadow-lg`}>
                    <Award className="w-6 h-6 mb-2" />
                    <p className="text-sm opacity-90">Maior Crescimento</p>
                    <p className="text-xl font-bold">{bestGrowthPlatform}</p>
                </div>
            </div>

            {/* Gráficos de Comparação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualizações */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Visualizações Totais
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={viewsData} options={getChartOptions('Visualizações Totais')} />
                    </div>
                </div>

                {/* Engajamento */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Engajamento Total
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={engagementData} options={getChartOptions('Engajamento Total')} />
                    </div>
                </div>

                {/* Quantidade de Posts */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Quantidade de Conteúdo
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={postsData} options={getChartOptions('Quantidade de Conteúdo')} />
                    </div>
                </div>

                {/* Média de Views por Post */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Média de Visualizações por Post
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={avgViewsData} options={getChartOptions('Média de Visualizações por Post')} />
                    </div>
                </div>
            </div>

            {/* Tabela Comparativa Detalhada */}
            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tabela Comparativa Detalhada
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                    Métrica
                                </th>
                                {platforms.map((platform) => (
                                    <th
                                        key={platform.platform}
                                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                                    >
                                        {platform.platformName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Total de Visualizações
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatNumber(platform.totalViews)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Alcance Total
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatNumber(platform.totalReach)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Engajamento Total
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatNumber(platform.totalEngagement)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Taxa de Engajamento
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatPercentage(platform.engagementRate)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Crescimento de Seguidores
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        +{formatNumber(platform.followersGrowth)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Posts/Vídeos Publicados
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {platform.totalPosts}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Média de Views por Post
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatNumber(platform.avgViewsPerPost)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    Salvamentos/Inscrições
                                </td>
                                {platforms.map((platform) => (
                                    <td key={platform.platform} className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatNumber(platform.saves)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlatformComparison;

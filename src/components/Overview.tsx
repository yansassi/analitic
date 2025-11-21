import { ProcessedData } from '../types';
import { 
  Eye, Clock, Users, TrendingUp, ThumbsUp, UserPlus, 
  Target, Zap, Award, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface OverviewProps {
  data: ProcessedData;
  darkMode: boolean;
}

const Overview = ({ data, darkMode }: OverviewProps) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  const formatDecimal = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${formatDecimal(hours, 1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  // Métricas principais
  const totalViews = data.videos.reduce((sum, v) => sum + v.visualizacoes, 0);
  const totalWatchTime = data.videos.reduce((sum, v) => sum + v.tempo_exibicao_horas, 0);
  const totalSubscribers = data.videos.reduce((sum, v) => sum + v.inscricoes_obtidas, 0);
  const totalLikes = data.videos.reduce((sum, v) => sum + v.marcacoes_gostei, 0);
  const totalComments = data.videos.reduce((sum, v) => sum + v.comentarios_adicionados, 0);
  const totalShares = data.videos.reduce((sum, v) => sum + v.compartilhamentos, 0);
  const totalImpressions = data.videos.reduce((sum, v) => sum + (v.impressoes || 0), 0);

  // Métricas calculadas
  const avgEngagement = data.videos.length > 0 
    ? data.videos.reduce((sum, v) => sum + v.porcentagem_visualizada_media, 0) / data.videos.length 
    : 0;
  
  const avgCTR = data.videos.length > 0 
    ? data.videos.reduce((sum, v) => sum + (v.taxa_cliques_impressoes || 0), 0) / data.videos.length 
    : 0;

  const totalUniqueViewers = data.videos.reduce((sum, v) => sum + (v.espectadores_unicos || 0), 0);
  
  const avgViewDuration = totalViews > 0 
    ? (totalWatchTime * 3600) / totalViews 
    : 0;

  // Taxa de conversão (views para inscrições)
  const conversionRate = totalViews > 0 ? (totalSubscribers / totalViews) * 100 : 0;

  // Engagement rate
  const engagementRate = totalViews > 0 
    ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
    : 0;

  // Análise de conteúdo
  const shortsData = data.contentType.find(c => c.tipo_conteudo === 'Shorts');
  const videosData = data.contentType.find(c => c.tipo_conteudo === 'Vídeos');

  // Top 5 vídeos
  const topVideos = [...data.videos]
    .sort((a, b) => b.visualizacoes - a.visualizacoes)
    .slice(0, 5);

  // Análise de crescimento (se tiver dados temporais)
  const getGrowthTrend = () => {
    if (data.videos.length < 2) return 'neutral';
    const recentVideos = data.videos.slice(-3);
    const olderVideos = data.videos.slice(0, 3);
    
    const recentAvg = recentVideos.reduce((sum, v) => sum + v.visualizacoes, 0) / recentVideos.length;
    const olderAvg = olderVideos.reduce((sum, v) => sum + v.visualizacoes, 0) / olderVideos.length;
    
    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'neutral';
  };

  const growthTrend = getGrowthTrend();

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string; 
    subtitle: string; 
    icon: any; 
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-4 h-4" />}
            {trend === 'down' && <ArrowDown className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visualizações Totais"
          value={formatNumber(totalViews)}
          subtitle={`${data.videos.length} vídeos publicados`}
          icon={Eye}
          color="blue"
          trend={growthTrend}
        />
        <MetricCard
          title="Tempo de Exibição"
          value={formatTime(totalWatchTime)}
          subtitle={`${formatDecimal(avgViewDuration, 0)}s média por view`}
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="Novos Inscritos"
          value={formatNumber(totalSubscribers)}
          subtitle={`${formatDecimal(conversionRate, 3)}% taxa de conversão`}
          icon={UserPlus}
          color="purple"
        />
        <MetricCard
          title="Taxa de Engajamento"
          value={`${formatDecimal(engagementRate, 2)}%`}
          subtitle={`${formatNumber(totalLikes)} likes totais`}
          icon={ThumbsUp}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Impressões"
          value={formatNumber(totalImpressions)}
          subtitle={`CTR: ${formatDecimal(avgCTR, 2)}%`}
          icon={Target}
          color="indigo"
        />
        <MetricCard
          title="Espectadores Únicos"
          value={formatNumber(totalUniqueViewers)}
          subtitle={`${formatDecimal(totalViews / Math.max(totalUniqueViewers, 1), 2)} views/pessoa`}
          icon={Users}
          color="pink"
        />
        <MetricCard
          title="% Visualizada Média"
          value={`${formatDecimal(avgEngagement, 1)}%`}
          subtitle="Retenção média"
          icon={TrendingUp}
          color="yellow"
        />
        <MetricCard
          title="Interações Totais"
          value={formatNumber(totalLikes + totalComments + totalShares)}
          subtitle={`${formatNumber(totalComments)} comentários`}
          icon={Zap}
          color="red"
        />
      </div>

      {/* Shorts vs Vídeos */}
      {(shortsData || videosData) && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance por Tipo de Conteúdo
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortsData && (
              <div className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📱 Shorts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Vídeos:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {shortsData.videos_publicados || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Views:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(shortsData.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CTR:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDecimal(shortsData.taxa_cliques_impressoes, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Inscritos:</span>
                    <span className={`font-bold text-green-600`}>
                      +{formatNumber(shortsData.inscricoes_obtidas)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {videosData && (
              <div className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎬 Vídeos Longos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Vídeos:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {videosData.videos_publicados || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Views:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(videosData.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CTR:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDecimal(videosData.taxa_cliques_impressoes, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Inscritos:</span>
                    <span className={`font-bold text-green-600`}>
                      +{formatNumber(videosData.inscricoes_obtidas)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top 5 Vídeos */}
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
      }`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Top 5 Vídeos Mais Vistos
          </h2>
        </div>
        
        <div className="space-y-4">
          {topVideos.map((video, index) => (
            <div
              key={`top-video-${video.id}-${index}`}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-600 text-white' :
                darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {video.titulo}
                </h3>
                <div className={`flex items-center gap-4 mt-1 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>{formatNumber(video.visualizacoes)} views</span>
                  <span>•</span>
                  <span>{formatDecimal(video.porcentagem_visualizada_media, 1)}% retido</span>
                  <span>•</span>
                  <span>+{video.inscricoes_obtidas} inscritos</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(video.marcacoes_gostei)}
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  likes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;

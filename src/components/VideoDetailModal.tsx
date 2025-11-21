import { VideoData } from '../types';
import { X, Eye, Clock, ThumbsUp, ThumbsDown, Share2, MessageCircle, UserPlus, Users, Target, TrendingUp, Zap, Calendar, Timer, Percent } from 'lucide-react';

interface VideoDetailModalProps {
  video: VideoData;
  darkMode: boolean;
  onClose: () => void;
}

const VideoDetailModal = ({ video, darkMode, onClose }: VideoDetailModalProps) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  const formatDecimal = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular score de viralização
  const getViralityScore = (): number => {
    const viewsScore = Math.min((video.visualizacoes / 10000) * 20, 20);
    const engagementScore = Math.min(video.porcentagem_visualizada_media / 5, 20);
    const ctrScore = Math.min((video.taxa_cliques_impressoes || 0) * 5, 20);
    const socialScore = Math.min(
      ((video.marcacoes_gostei + video.compartilhamentos + video.comentarios_adicionados) / 100) * 20, 
      20
    );
    const subscriptionScore = Math.min((video.inscricoes_obtidas / 50) * 20, 20);
    
    return viewsScore + engagementScore + ctrScore + socialScore + subscriptionScore;
  };

  const viralityScore = getViralityScore();

  const getPerformanceLabel = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: 'Viral 🔥', color: 'red' };
    if (score >= 60) return { text: 'Excelente ⭐', color: 'green' };
    if (score >= 40) return { text: 'Bom 👍', color: 'blue' };
    if (score >= 20) return { text: 'Regular 😐', color: 'yellow' };
    return { text: 'Fraco 📉', color: 'gray' };
  };

  const performance = getPerformanceLabel(viralityScore);

  const MetricCard = ({ icon: Icon, label, value, color = 'blue' }: any) => (
    <div className={`p-4 rounded-lg ${
      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 text-${color}-600`} />
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {video.titulo}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4" />
                  {formatDate(video.horario_publicacao)}
                </div>
                <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Timer className="w-4 h-4" />
                  {formatDuration(video.duracao_segundos)}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Score de Viralização */}
          <div className={`mt-4 p-4 rounded-xl ${
            darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Score de Viralização
              </span>
              <span className={`text-2xl font-bold text-${performance.color}-600`}>
                {performance.text}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-4 bg-gray-300 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    viralityScore >= 80 ? 'bg-red-600' :
                    viralityScore >= 60 ? 'bg-green-600' :
                    viralityScore >= 40 ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${viralityScore}%` }}
                />
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDecimal(viralityScore, 0)}/100
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Métricas Principais */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Métricas Principais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                icon={Eye} 
                label="Visualizações" 
                value={formatNumber(video.visualizacoes)}
                color="blue"
              />
              <MetricCard 
                icon={Clock} 
                label="Tempo de Exibição" 
                value={`${formatDecimal(video.tempo_exibicao_horas, 1)}h`}
                color="green"
              />
              <MetricCard 
                icon={Users} 
                label="Espectadores Únicos" 
                value={formatNumber(video.espectadores_unicos)}
                color="purple"
              />
              <MetricCard 
                icon={Target} 
                label="Impressões" 
                value={formatNumber(video.impressoes)}
                color="orange"
              />
            </div>
          </div>

          {/* Performance e Retenção */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📈 Performance e Retenção
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-purple-600" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    % Visualizada Média
                  </span>
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal(video.porcentagem_visualizada_media, 1)}%
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-purple-600"
                    style={{ width: `${video.porcentagem_visualizada_media}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Continuaram Assistindo
                  </span>
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal(video.continuaram_assistindo, 1)}%
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-green-600"
                    style={{ width: `${video.continuaram_assistindo}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    CTR (Taxa de Cliques)
                  </span>
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal(video.taxa_cliques_impressoes, 2)}%
                </div>
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${Math.min(video.taxa_cliques_impressoes * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engajamento */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💬 Engajamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                icon={ThumbsUp} 
                label="Likes" 
                value={formatNumber(video.marcacoes_gostei)}
                color="green"
              />
              <MetricCard 
                icon={ThumbsDown} 
                label="Dislikes" 
                value={formatNumber(video.marcacoes_nao_gostei)}
                color="red"
              />
              <MetricCard 
                icon={MessageCircle} 
                label="Comentários" 
                value={formatNumber(video.comentarios_adicionados)}
                color="blue"
              />
              <MetricCard 
                icon={Share2} 
                label="Compartilhamentos" 
                value={formatNumber(video.compartilhamentos)}
                color="purple"
              />
            </div>
            
            {/* Like/Dislike Ratio */}
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taxa de Aprovação (Likes vs Dislikes)
                </span>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal(video.gostei_vs_nao_gostei_pct, 1)}%
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-green-600"
                  style={{ width: `${video.gostei_vs_nao_gostei_pct}%` }}
                />
                <div 
                  className="bg-red-600"
                  style={{ width: `${100 - video.gostei_vs_nao_gostei_pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Crescimento */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🚀 Crescimento do Canal
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Inscrições Obtidas
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  +{formatNumber(video.inscricoes_obtidas)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-red-600" />
                  <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    Inscrições Perdidas
                  </span>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  -{formatNumber(video.inscricoes_perdidas)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Ganho Líquido
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {video.inscricoes_obtidas - video.inscricoes_perdidas >= 0 ? '+' : ''}
                  {formatNumber(video.inscricoes_obtidas - video.inscricoes_perdidas)}
                </div>
              </div>
            </div>
          </div>

          {/* Público */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              👥 Público
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                icon={Users} 
                label="Novos Espectadores" 
                value={formatNumber(video.novos_espectadores)}
                color="blue"
              />
              <MetricCard 
                icon={Users} 
                label="Recorrentes" 
                value={formatNumber(video.espectadores_recorrentes)}
                color="green"
              />
              <MetricCard 
                icon={Users} 
                label="Casuais" 
                value={formatNumber(video.espectadores_casuais)}
                color="yellow"
              />
              <MetricCard 
                icon={Eye} 
                label="Views/Espectador" 
                value={formatDecimal(video.media_visualizacoes_por_espectador, 2)}
                color="purple"
              />
            </div>

            {/* Distribuição do Público */}
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Distribuição de Espectadores
              </div>
              <div className="flex h-6 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${(video.novos_espectadores / video.espectadores_unicos) * 100}%` }}
                >
                  {((video.novos_espectadores / video.espectadores_unicos) * 100).toFixed(0)}%
                </div>
                <div 
                  className="bg-green-600 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${(video.espectadores_recorrentes / video.espectadores_unicos) * 100}%` }}
                >
                  {((video.espectadores_recorrentes / video.espectadores_unicos) * 100).toFixed(0)}%
                </div>
                <div 
                  className="bg-yellow-600 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${(video.espectadores_casuais / video.espectadores_unicos) * 100}%` }}
                >
                  {((video.espectadores_casuais / video.espectadores_unicos) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Novos</span>
                <span className={darkMode ? 'text-green-400' : 'text-green-600'}>Recorrentes</span>
                <span className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}>Casuais</span>
              </div>
            </div>
          </div>

          {/* Hypes */}
          {(video.hypes > 0 || video.pontos_hype > 0) && (
            <div>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ⚡ Hypes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                  icon={Zap} 
                  label="Total de Hypes" 
                  value={formatNumber(video.hypes)}
                  color="yellow"
                />
                <MetricCard 
                  icon={Zap} 
                  label="Pontos de Hype" 
                  value={formatNumber(video.pontos_hype)}
                  color="orange"
                />
              </div>
            </div>
          )}

          {/* Métricas Calculadas */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🧮 Métricas Calculadas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taxa de Conversão
                </div>
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal((video.inscricoes_obtidas / video.visualizacoes) * 100, 3)}%
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Views → Inscritos
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taxa de Engajamento
                </div>
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDecimal(((video.marcacoes_gostei + video.comentarios_adicionados + video.compartilhamentos) / video.visualizacoes) * 100, 2)}%
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Interações / Views
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Duração Média/View
                </div>
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDuration(video.duracao_media_visualizacao_segundos)}
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Tempo médio assistido
                </div>
              </div>
            </div>
          </div>

          {/* ID do Vídeo */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ID do Vídeo
            </div>
            <div className={`font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {video.id}
            </div>
            <a 
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              ▶ Assistir no YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailModal;

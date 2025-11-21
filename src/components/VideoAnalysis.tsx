import { useState } from 'react';
import { ProcessedData, VideoData } from '../types';
import { 
  ArrowUpDown, Eye, ThumbsUp, UserPlus, 
  Search, Filter 
} from 'lucide-react';
import VideoDetailModal from './VideoDetailModal';

interface VideoAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

type SortField = 'visualizacoes' | 'porcentagem_visualizada_media' | 'inscricoes_obtidas' | 
  'marcacoes_gostei' | 'taxa_cliques_impressoes' | 'tempo_exibicao_horas';

const VideoAnalysis = ({ data, darkMode }: VideoAnalysisProps) => {
  const [sortField, setSortField] = useState<SortField>('visualizacoes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [minViews, setMinViews] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toString();
  };

  const formatDecimal = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const getViralityScore = (video: VideoData): number => {
    // Score de viralização (0-100)
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

  const getPerformanceLabel = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: 'Viral 🔥', color: 'text-red-600' };
    if (score >= 60) return { text: 'Excelente ⭐', color: 'text-green-600' };
    if (score >= 40) return { text: 'Bom 👍', color: 'text-blue-600' };
    if (score >= 20) return { text: 'Regular 😐', color: 'text-yellow-600' };
    return { text: 'Fraco 📉', color: 'text-gray-600' };
  };

  const filteredAndSortedVideos = data.videos
    .filter(v => 
      v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      v.visualizacoes >= minViews
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 font-semibold transition-colors ${
        sortField === field
          ? darkMode ? 'text-blue-400' : 'text-blue-600'
          : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Filtros e Busca
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Mínimo de visualizações: {formatNumber(minViews)}
            </label>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={minViews}
              onChange={(e) => setMinViews(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Mostrando {filteredAndSortedVideos.length} de {data.videos.length} vídeos
        </div>
      </div>

      {/* Lista de Vídeos */}
      <div className={`rounded-xl overflow-hidden ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
      }`}>
        {/* Dica de clique */}
        <div className={`px-6 py-3 border-b ${
          darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-blue-50 border-blue-100'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            💡 <strong>Dica:</strong> Clique em qualquer vídeo para ver TODAS as informações detalhadas
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase">Score</th>
                <th className="px-6 py-4 text-left text-xs uppercase">Título</th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="visualizacoes">Views</SortButton>
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="porcentagem_visualizada_media">Retenção</SortButton>
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="taxa_cliques_impressoes">CTR</SortButton>
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="inscricoes_obtidas">Inscritos</SortButton>
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="marcacoes_gostei">Likes</SortButton>
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase">
                  <SortButton field="tempo_exibicao_horas">Tempo (h)</SortButton>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredAndSortedVideos.map((video) => {
                const viralityScore = getViralityScore(video);
                const performance = getPerformanceLabel(viralityScore);
                
                return (
                  <tr
                    key={`video-analysis-${video.id}`} 
                    onClick={() => setSelectedVideo(video)}
                    className={`transition-all cursor-pointer ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                    }`}
                    title="Clique para ver todos os detalhes"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`text-xs font-bold ${performance.color}`}>
                          {performance.text}
                        </div>
                        <div className="w-16 h-2 bg-gray-300 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${
                              viralityScore >= 80 ? 'bg-red-600' :
                              viralityScore >= 60 ? 'bg-green-600' :
                              viralityScore >= 40 ? 'bg-blue-600' :
                              'bg-gray-600'
                            }`}
                            style={{ width: `${viralityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {video.titulo}
                      </div>
                      <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(video.horario_publicacao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(video.visualizacoes)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                        video.porcentagem_visualizada_media >= 50 ? 'bg-green-100 text-green-800' :
                        video.porcentagem_visualizada_media >= 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {formatDecimal(video.porcentagem_visualizada_media, 1)}%
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDecimal(video.taxa_cliques_impressoes, 2)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-600 font-semibold">
                        +{formatNumber(video.inscricoes_obtidas)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatNumber(video.marcacoes_gostei)}
                    </td>
                    <td className={`px-6 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDecimal(video.tempo_exibicao_horas, 1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas dos vídeos filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <Eye className="w-8 h-8 text-blue-600 mb-3" />
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(filteredAndSortedVideos.reduce((sum, v) => sum + v.visualizacoes, 0))}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Visualizações totais
          </div>
        </div>

        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <UserPlus className="w-8 h-8 text-green-600 mb-3" />
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(filteredAndSortedVideos.reduce((sum, v) => sum + v.inscricoes_obtidas, 0))}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Novos inscritos
          </div>
        </div>

        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <ThumbsUp className="w-8 h-8 text-purple-600 mb-3" />
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatDecimal(
              filteredAndSortedVideos.reduce((sum, v) => sum + v.porcentagem_visualizada_media, 0) / 
              Math.max(filteredAndSortedVideos.length, 1),
              1
            )}%
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Retenção média
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedVideo && (
        <VideoDetailModal 
          video={selectedVideo}
          darkMode={darkMode}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoAnalysis;

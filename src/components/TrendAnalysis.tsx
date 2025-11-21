import { ProcessedData } from '../types';
import { TrendingUp } from 'lucide-react';

interface TrendAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const TrendAnalysis = ({ data, darkMode }: TrendAnalysisProps) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));
  
  // Análise de crescimento
  const videos = [...data.videos].sort((a, b) => 
    new Date(a.horario_publicacao).getTime() - new Date(b.horario_publicacao).getTime()
  );
  
  const recentVideos = videos.slice(-5);
  const olderVideos = videos.slice(0, 5);
  
  const recentAvgViews = recentVideos.reduce((sum, v) => sum + v.visualizacoes, 0) / recentVideos.length;
  const olderAvgViews = olderVideos.reduce((sum, v) => sum + v.visualizacoes, 0) / olderVideos.length;
  const viewsGrowth = ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100;

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Análise de Tendências
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg text-center ${
            darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {viewsGrowth >= 0 ? '+' : ''}{viewsGrowth.toFixed(1)}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
              Crescimento em Views
            </div>
            <div className={`text-xs mt-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
              Últimos 5 vs Primeiros 5
            </div>
          </div>

          <div className={`p-6 rounded-lg text-center ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(recentAvgViews)}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Média Recente
            </div>
            <div className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Views por vídeo
            </div>
          </div>

          <div className={`p-6 rounded-lg text-center ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data.videos.length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total de Vídeos
            </div>
            <div className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No período analisado
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Vídeos Mais Recentes
          </h3>
          <div className="space-y-2">
            {recentVideos.reverse().map((video, index) => (
              <div key={`trend-video-${video.id}-${index}`} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {video.titulo}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(video.horario_publicacao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(video.visualizacoes)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;

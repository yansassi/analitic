import { ProcessedData } from '../types';
import { 
  BarChart3, 
  Smartphone, 
  Video, 
  AlertCircle,
  Eye, 
  Clock, 
  MousePointerClick,
  Users,
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Zap, 
  TrendingUp, 
  UserPlus
} from 'lucide-react';

interface PerformanceComparisonProps {
  data: ProcessedData;
  darkMode: boolean;
}

const PerformanceComparison = ({ data, darkMode }: PerformanceComparisonProps) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));
  
  // Função para normalizar nomes e encontrar tipos de conteúdo
  const findContentByType = (type: string) => {
    return data.contentType.find(c => 
      c.tipo_conteudo?.toLowerCase().includes(type.toLowerCase())
    );
  };

  const rawShorts = findContentByType('shorts');
  const rawVideos = data.contentType.find(c => 
    c.tipo_conteudo?.toLowerCase().includes('vídeo') || c.tipo_conteudo?.toLowerCase().includes('video')
  );
  
  // Objeto vazio padrão com TODOS os campos necessários zerados
  const emptyData = {
    visualizacoes: 0,
    tempo_exibicao_horas: 0,
    inscricoes_obtidas: 0,
    inscricoes_perdidas: 0,
    taxa_cliques_impressoes: 0,
    porcentagem_visualizada_media: 0,
    videos_publicados: 0,
    impressoes: 0,
    espectadores_unicos: 0,
    marcacoes_gostei: 0,
    compartilhamentos: 0,
    comentarios_adicionados: 0,
    hypes: 0
  };

  const shorts = rawShorts || emptyData;
  const videos = rawVideos || emptyData;
  
  // Verifica se temos algum dado para mostrar
  const hasData = rawShorts || rawVideos;

  // Componente auxiliar para cards de métrica
  const MetricCard = ({ label, icon: Icon, shortsVal, videosVal, suffix = '', formatFn = (v: any) => v }: any) => (
    <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${
      darkMode ? 'bg-gray-700/40 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`flex items-center gap-2 text-sm font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <Icon className="w-4 h-4 opacity-70" />
        {label}
      </div>
      
      <div className="grid grid-cols-2 gap-4 relative">
        {/* Linha divisória */}
        <div className={`absolute left-1/2 top-0 bottom-0 w-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} -translate-x-1/2`}></div>
        
        {/* Coluna Shorts */}
        <div className="text-center">
          <div className={`text-lg font-bold ${shortsVal === 0 ? 'text-gray-400' : 'text-red-500'}`}>
            {formatFn(shortsVal)}{suffix}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
             <Smartphone className="w-3 h-3" />
             <span className="text-[10px] uppercase font-bold">Shorts</span>
          </div>
        </div>
        
        {/* Coluna Vídeos */}
        <div className="text-center">
           <div className={`text-lg font-bold ${videosVal === 0 ? 'text-gray-400' : 'text-blue-500'}`}>
            {formatFn(videosVal)}{suffix}
          </div>
          <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
             <Video className="w-3 h-3" />
             <span className="text-[10px] uppercase font-bold">Vídeos</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasData) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dados de comparação indisponíveis
        </h3>
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          O arquivo "Tipo de conteúdo" não foi encontrado ou está vazio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Shorts vs Vídeos
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Comparativo detalhado de performance por formato
            </p>
          </div>
        </div>

        {/* SEÇÃO 1: VISÃO GERAL */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Eye className="w-4 h-4" /> Visão Geral
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard 
              label="Visualizações Totais" 
              icon={Eye}
              shortsVal={shorts.visualizacoes} 
              videosVal={videos.visualizacoes} 
              formatFn={formatNumber}
            />
            <MetricCard 
              label="Tempo Assistido (Horas)" 
              icon={Clock}
              shortsVal={shorts.tempo_exibicao_horas} 
              videosVal={videos.tempo_exibicao_horas} 
              formatFn={(v: number) => formatNumber(v)}
              suffix="h"
            />
            <MetricCard 
              label="Vídeos Publicados" 
              icon={Video}
              shortsVal={shorts.videos_publicados} 
              videosVal={videos.videos_publicados} 
              formatFn={formatNumber}
            />
          </div>
        </div>

        {/* SEÇÃO 2: ALCANCE & AUDIÊNCIA */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            <MousePointerClick className="w-4 h-4" /> Alcance & Audiência
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard 
              label="Impressões" 
              icon={MousePointerClick}
              shortsVal={shorts.impressoes} 
              videosVal={videos.impressoes} 
              formatFn={formatNumber}
            />
            <MetricCard 
              label="CTR (Taxa de Clique)" 
              icon={MousePointerClick}
              shortsVal={shorts.taxa_cliques_impressoes} 
              videosVal={videos.taxa_cliques_impressoes} 
              formatFn={(v: number) => v.toFixed(1)}
              suffix="%"
            />
             <MetricCard 
              label="Espectadores Únicos" 
              icon={Users}
              shortsVal={shorts.espectadores_unicos} 
              videosVal={videos.espectadores_unicos} 
              formatFn={formatNumber}
            />
          </div>
        </div>

        {/* SEÇÃO 3: ENGAJAMENTO */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <ThumbsUp className="w-4 h-4" /> Engajamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="Gostei (Likes)" 
              icon={ThumbsUp}
              shortsVal={shorts.marcacoes_gostei} 
              videosVal={videos.marcacoes_gostei} 
              formatFn={formatNumber}
            />
            <MetricCard 
              label="Compartilhamentos" 
              icon={Share2}
              shortsVal={shorts.compartilhamentos} 
              videosVal={videos.compartilhamentos} 
              formatFn={formatNumber}
            />
            <MetricCard 
              label="Comentários" 
              icon={MessageCircle}
              shortsVal={shorts.comentarios_adicionados} 
              videosVal={videos.comentarios_adicionados} 
              formatFn={formatNumber}
            />
            <MetricCard 
              label="Retenção Média" 
              icon={TrendingUp}
              shortsVal={shorts.porcentagem_visualizada_media} 
              videosVal={videos.porcentagem_visualizada_media} 
              formatFn={(v: number) => v.toFixed(1)}
              suffix="%"
            />
          </div>
        </div>

        {/* SEÇÃO 4: CONVERSÃO (INSCRITOS) */}
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            <UserPlus className="w-4 h-4" /> Conversão de Inscritos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/40 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Saldo de Inscritos</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-xl font-bold ${shorts.inscricoes_obtidas - shorts.inscricoes_perdidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {shorts.inscricoes_obtidas - shorts.inscricoes_perdidas > 0 ? '+' : ''}
                    {formatNumber(shorts.inscricoes_obtidas - shorts.inscricoes_perdidas)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Shorts</div>
                </div>
                <div>
                  <div className={`text-xl font-bold ${videos.inscricoes_obtidas - videos.inscricoes_perdidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {videos.inscricoes_obtidas - videos.inscricoes_perdidas > 0 ? '+' : ''}
                    {formatNumber(videos.inscricoes_obtidas - videos.inscricoes_perdidas)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Vídeos</div>
                </div>
              </div>
            </div>

            {/* Card de Hypes se houver dados */}
            {(shorts.hypes > 0 || videos.hypes > 0) && (
               <MetricCard 
                label="Hypes" 
                icon={Zap}
                shortsVal={shorts.hypes} 
                videosVal={videos.hypes} 
                formatFn={formatNumber}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceComparison;
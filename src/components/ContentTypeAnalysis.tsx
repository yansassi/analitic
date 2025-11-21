import { useState } from 'react';
import { ProcessedData } from '../types';
import { 
  Video, 
  Smartphone, 
  Radio, 
  PlayCircle,
  Eye, 
  Clock, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  UserMinus,
  TrendingUp,
  MousePointerClick,
  Zap,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ContentTypeAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const ContentTypeAnalysis = ({ data, darkMode }: ContentTypeAnalysisProps) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));
  
  const formatPercent = (num: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'percent', 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(num / 100);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('shorts')) return <Smartphone className="w-6 h-6 text-red-500" />;
    if (lowerType.includes('vídeo') || lowerType.includes('video')) return <Video className="w-6 h-6 text-blue-500" />;
    if (lowerType.includes('vivo') || lowerType.includes('live')) return <Radio className="w-6 h-6 text-purple-500" />;
    return <PlayCircle className="w-6 h-6 text-gray-500" />;
  };

  const toggleExpand = (type: string) => {
    if (expandedType === type) {
      setExpandedType(null);
    } else {
      setExpandedType(type);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Seção */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <PlayCircle className="w-8 h-8 text-red-600" />
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Desempenho por Formato
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comparativo detalhado entre Shorts, Vídeos e Transmissões ao vivo
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Cards dos Tipos de Conteúdo */}
        <div className="grid grid-cols-1 gap-4">
          {data.contentType.map((type, index) => {
            const isExpanded = expandedType === type.tipo_conteudo;
            
            return (
              <div 
                key={`content-type-${index}`}
                className={`rounded-xl transition-all duration-300 border cursor-pointer ${
                  darkMode 
                    ? `bg-gray-700/30 hover:bg-gray-700/50 ${isExpanded ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-600'}` 
                    : `bg-gray-50 hover:bg-gray-100 ${isExpanded ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`
                }`}
                onClick={() => toggleExpand(type.tipo_conteudo)}
              >
                {/* Resumo Principal (Sempre Visível) */}
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Lado Esquerdo: Ícone e Título */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        {getIcon(type.tipo_conteudo)}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {type.tipo_conteudo}
                        </h3>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatNumber(type.videos_publicados)} publicados
                        </div>
                      </div>
                    </div>

                    {/* Métricas Principais (Grid Responsivo) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1">
                      <div>
                        <div className={`text-xs uppercase font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Visualizações</div>
                        <div className={`text-lg font-bold flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Eye className="w-4 h-4 text-blue-500" />
                          {formatNumber(type.visualizacoes)}
                        </div>
                      </div>
                      
                      <div>
                         <div className={`text-xs uppercase font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tempo Assistido</div>
                         <div className={`text-lg font-bold flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Clock className="w-4 h-4 text-orange-500" />
                          {type.tempo_exibicao_horas.toFixed(1)}h
                        </div>
                      </div>

                      <div>
                         <div className={`text-xs uppercase font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Retenção</div>
                         <div className={`text-lg font-bold flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          {formatPercent(type.porcentagem_visualizada_media)}
                        </div>
                      </div>

                      <div>
                         <div className={`text-xs uppercase font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Inscritos</div>
                         <div className={`text-lg font-bold flex items-center gap-1 ${type.inscricoes_obtidas - type.inscricoes_perdidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <UserPlus className="w-4 h-4" />
                          {type.inscricoes_obtidas - type.inscricoes_perdidas > 0 ? '+' : ''}
                          {formatNumber(type.inscricoes_obtidas - type.inscricoes_perdidas)}
                        </div>
                      </div>
                    </div>

                    {/* Ícone de Expandir */}
                    <div className="hidden md:block text-gray-400">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && (
                  <div className={`px-6 pb-6 pt-4 border-t ${darkMode ? 'border-gray-600 bg-gray-800/20' : 'border-gray-200 bg-white/50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Bloco 1: Engajamento */}
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                        <h4 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          <ThumbsUp className="w-4 h-4" /> Engajamento
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                               <ThumbsUp className="w-3 h-3" /> Gostei (Likes)
                            </span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(type.marcacoes_gostei)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                               <Share2 className="w-3 h-3" /> Compartilhamentos
                            </span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(type.compartilhamentos)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                               <MessageCircle className="w-3 h-3" /> Comentários
                            </span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(type.comentarios_adicionados)}</span>
                          </div>
                          {type.hypes > 0 && (
                            <div className="flex justify-between text-yellow-500">
                              <span className="text-sm flex items-center gap-1"><Zap className="w-3 h-3"/> Hypes</span>
                              <span className="font-bold">{type.hypes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bloco 2: Alcance e Visualização */}
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                        <h4 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          <MousePointerClick className="w-4 h-4" /> Alcance
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Impressões</span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {type.impressoes > 0 ? formatNumber(type.impressoes) : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Taxa de Cliques (CTR)</span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {type.taxa_cliques_impressoes > 0 ? formatPercent(type.taxa_cliques_impressoes) : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duração Média</span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatDuration(type.duracao_media_visualizacao_segundos)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                             <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Continuaram Assistindo</span>
                             <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {type.continuaram_assistindo > 0 ? formatPercent(type.continuaram_assistindo) : '-'}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Bloco 3: Público */}
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                        <h4 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          <Users className="w-4 h-4" /> Público
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Espectadores Únicos</span>
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {type.espectadores_unicos > 0 ? formatNumber(type.espectadores_unicos) : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                               <UserPlus className="w-3 h-3" /> Inscrições Ganhas
                            </span>
                            <span className="font-semibold text-green-500">+{formatNumber(type.inscricoes_obtidas)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                               <UserMinus className="w-3 h-3" /> Inscrições Perdidas
                            </span>
                            <span className="font-semibold text-red-500">-{formatNumber(type.inscricoes_perdidas)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Saldo de Inscritos</span>
                            <span className={`font-bold ${type.inscricoes_obtidas - type.inscricoes_perdidas >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatNumber(type.inscricoes_obtidas - type.inscricoes_perdidas)}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {data.contentType.length === 0 && (
             <div className={`text-center py-12 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
               <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
               <p>Nenhum dado de tipo de conteúdo encontrado.</p>
               <p className="text-xs mt-1">Verifique se o arquivo "Tipo de conteúdo" está presente no ZIP.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentTypeAnalysis;
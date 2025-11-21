import { ProcessedData } from '../types';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  data: ProcessedData;
  darkMode: boolean;
}

const AIInsights = ({ data, darkMode }: AIInsightsProps) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));

  // Análise automática
  const generateInsights = () => {
    const insights = [];
    
    // Análise de performance
    const avgViews = data.videos.reduce((sum, v) => sum + v.visualizacoes, 0) / data.videos.length;
    const topPerformers = data.videos.filter(v => v.visualizacoes > avgViews * 1.5);
    const underPerformers = data.videos.filter(v => v.visualizacoes < avgViews * 0.5);
    
    if (topPerformers.length > 0) {
      insights.push({
        type: 'success',
        title: `${topPerformers.length} Vídeos de Alto Desempenho`,
        description: `Você tem ${topPerformers.length} vídeos com performance 50% acima da média. Analise o que os torna especiais!`,
        icon: CheckCircle,
        color: 'green'
      });
    }
    
    if (underPerformers.length > 0) {
      insights.push({
        type: 'warning',
        title: `${underPerformers.length} Vídeos Abaixo da Média`,
        description: `Estes vídeos podem precisar de otimização de título, thumbnail ou descrição.`,
        icon: AlertTriangle,
        color: 'yellow'
      });
    }
    
    // Análise de retenção
    const avgRetention = data.videos.reduce((sum, v) => sum + v.porcentagem_visualizada_media, 0) / data.videos.length;
    if (avgRetention > 50) {
      insights.push({
        type: 'success',
        title: 'Excelente Retenção de Audiência',
        description: `Sua retenção média de ${avgRetention.toFixed(1)}% está acima do padrão do YouTube. Continue criando conteúdo envolvente!`,
        icon: TrendingUp,
        color: 'blue'
      });
    } else if (avgRetention < 30) {
      insights.push({
        type: 'suggestion',
        title: 'Oportunidade de Melhoria na Retenção',
        description: 'Considere hooks mais fortes nos primeiros 5 segundos e cortes mais dinâmicos.',
        icon: Lightbulb,
        color: 'purple'
      });
    }
    
    // Análise de CTR
    const avgCTR = data.videos.reduce((sum, v) => sum + (v.taxa_cliques_impressoes || 0), 0) / data.videos.length;
    if (avgCTR > 5) {
      insights.push({
        type: 'success',
        title: 'CTR Acima da Média',
        description: `Seu CTR de ${avgCTR.toFixed(2)}% indica thumbnails e títulos eficazes.`,
        icon: CheckCircle,
        color: 'green'
      });
    } else if (avgCTR < 2) {
      insights.push({
        type: 'suggestion',
        title: 'Otimize Thumbnails e Títulos',
        description: 'CTR baixo pode indicar que thumbnails e títulos não estão chamando atenção.',
        icon: Lightbulb,
        color: 'orange'
      });
    }
    
    // Análise de crescimento de inscritos
    const totalSubscribers = data.videos.reduce((sum, v) => sum + v.inscricoes_obtidas, 0);
    const totalViews = data.videos.reduce((sum, v) => sum + v.visualizacoes, 0);
    const conversionRate = (totalSubscribers / totalViews) * 100;
    
    if (conversionRate > 1) {
      insights.push({
        type: 'success',
        title: 'Alta Taxa de Conversão',
        description: `${conversionRate.toFixed(2)}% dos espectadores se inscrevem - excelente!`,
        icon: TrendingUp,
        color: 'green'
      });
    } else if (conversionRate < 0.5) {
      insights.push({
        type: 'suggestion',
        title: 'Incentive Mais Inscrições',
        description: 'Adicione CTAs claros pedindo inscrições no início e final dos vídeos.',
        icon: Lightbulb,
        color: 'purple'
      });
    }
    
    // Análise de Shorts vs Vídeos
    const shortsData = data.contentType.find(c => c.tipo_conteudo === 'Shorts');
    const videosData = data.contentType.find(c => c.tipo_conteudo === 'Vídeos');
    
    if (shortsData && videosData) {
      const shortsPerVideo = shortsData.visualizacoes / Math.max(shortsData.videos_publicados, 1);
      const longPerVideo = videosData.visualizacoes / Math.max(videosData.videos_publicados, 1);
      
      if (shortsPerVideo > longPerVideo * 2) {
        insights.push({
          type: 'info',
          title: 'Shorts Performam Melhor',
          description: `Seus Shorts têm ${((shortsPerVideo/longPerVideo - 1) * 100).toFixed(0)}% mais views por vídeo. Considere aumentar a produção.`,
          icon: TrendingUp,
          color: 'blue'
        });
      }
    }
    
    return insights;
  };

  const insights = generateInsights();
  
  // Melhores vídeos para replicar
  const topVideos = [...data.videos]
    .sort((a, b) => b.visualizacoes - a.visualizacoes)
    .slice(0, 3);

  const InsightCard = ({ insight }: any) => {
    const Icon = insight.icon;
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
    };

    return (
      <div className={`rounded-xl p-6 border-2 ${
        darkMode ? 'bg-gray-800 border-gray-700' : `${colorClasses[insight.color as keyof typeof colorClasses]} bg-opacity-20`
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-white'
          }`}>
            <Icon className={`w-6 h-6 text-${insight.color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {insight.title}
            </h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {insight.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gradient-to-br from-purple-900 to-blue-900 border border-purple-700' : 
        'bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Insights Automáticos com IA
            </h2>
            <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
              Análises geradas automaticamente baseadas nos seus dados
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>

      {/* Vídeos para Replicar */}
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Padrões de Sucesso - Replique Estes Vídeos
        </h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Seus vídeos de melhor performance - analise o que os torna especiais
        </p>
        
        <div className="space-y-4">
          {topVideos.map((video, index) => (
            <div key={video.id} className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  'bg-orange-600 text-white'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {video.titulo}
                  </h4>
                  <div className={`flex gap-4 mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>{formatNumber(video.visualizacoes)} views</span>
                    <span>•</span>
                    <span>{video.porcentagem_visualizada_media.toFixed(1)}% retenção</span>
                    <span>•</span>
                    <span>{video.taxa_cliques_impressoes.toFixed(2)}% CTR</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    +{video.inscricoes_obtidas}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    inscritos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações Acionáveis */}
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          💡 Próximos Passos Recomendados
        </h3>
        
        <div className="space-y-3">
          <div className={`p-4 rounded-lg border-l-4 border-blue-600 ${
            darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
          }`}>
            <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ✅ Analise seus vídeos de melhor performance
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Identifique padrões: tópicos, duração, estilo de thumbnail, CTAs usados
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 border-purple-600 ${
            darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
          }`}>
            <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ✅ Otimize vídeos com baixo desempenho
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Atualize thumbnails e títulos dos vídeos que estão abaixo da média
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 border-green-600 ${
            darkMode ? 'bg-gray-700/50' : 'bg-green-50'
          }`}>
            <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ✅ Mantenha consistência de publicação
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              O algoritmo favorece canais com upload regular e previsível
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;

import { ProcessedData } from '../types';
import { UserCheck, UserPlus } from 'lucide-react';

interface AudienceAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const AudienceAnalysis = ({ data, darkMode }: AudienceAnalysisProps) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  const formatPercent = (num: number): string => {
    return num.toFixed(2);
  };

  // Dados demográficos
  const genderData = data.demographics.filter(d => d.tipo === 'Gênero');
  const ageData = data.demographics.filter(d => d.tipo === 'Idade');

  // Dados de novos vs recorrentes
  const newRecurrent = data.newRecurrent || [];
  const newViewers = newRecurrent.find(nr => nr.tipo_espectador === 'Novos espectadores');
  const recurrentViewers = newRecurrent.find(nr => nr.tipo_espectador === 'Espectadores recorrentes');

  // Status de inscrição
  const subscriptionStatus = data.subscriptionStatus || [];
  const subscribedData = subscriptionStatus.find(s => s.status_inscricao === 'Inscrito');
  const nonSubscribedData = subscriptionStatus.find(s => s.status_inscricao === 'Não inscrito');

  // Comportamento da audiência
  const audienceBehavior = data.audienceBehavior || [];

  // Filtrar dados específicos de comportamento
  const newViewersBehavior = audienceBehavior.find(b => b.tipo_publico === 'Novos espectadores');
  const casualViewersBehavior = audienceBehavior.find(b => b.tipo_publico === 'Espectadores casuais');

  return (
    <div className="space-y-6">
      {/* Novos vs Recorrentes */}
      {(newViewers || recurrentViewers) && (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Novos vs Espectadores Recorrentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {newViewers && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700' : 
                'bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Novos Espectadores
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Visualizações:</span>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(newViewers.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Retenção média:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(newViewers.porcentagem_visualizada_media)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Tempo de exibição:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(newViewers.tempo_exibicao_horas)}h
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {recurrentViewers && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-green-900 to-green-800 border border-green-700' : 
                'bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Espectadores Recorrentes
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Visualizações:</span>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(recurrentViewers.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Retenção média:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(recurrentViewers.porcentagem_visualizada_media)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Tempo de exibição:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(recurrentViewers.tempo_exibicao_horas)}h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inscritos vs Não Inscritos */}
      {(subscribedData || nonSubscribedData) && (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🔔 Status de Inscrição
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscribedData && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ✅ Inscritos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Views:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(subscribedData.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>% Total:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(
                        (subscribedData.visualizacoes / 
                        (subscribedData.visualizacoes + (nonSubscribedData?.visualizacoes || 0))) * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Retenção:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(subscribedData.porcentagem_visualizada_media)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {nonSubscribedData && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  👤 Não Inscritos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Views:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(nonSubscribedData.visualizacoes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>% Total:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(
                        (nonSubscribedData.visualizacoes / 
                        ((subscribedData?.visualizacoes || 0) + nonSubscribedData.visualizacoes)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Retenção:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(nonSubscribedData.porcentagem_visualizada_media)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distribuição por Gênero */}
      {genderData.length > 0 && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            👥 Distribuição por Gênero
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {genderData.map((gender, index) => (
              <div key={`gender-${gender.categoria}-${index}`} className={`p-6 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {gender.categoria === 'Masculino' ? '👨 Masculino' : '👩 Feminino'}
                  </h3>
                  <span className={`text-3xl font-bold ${
                    gender.categoria === 'Masculino' ? 'text-blue-600' : 'text-pink-600'
                  }`}>
                    {formatPercent(gender.visualizacoes_pct)}%
                  </span>
                </div>
                
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
                  <div 
                    className={gender.categoria === 'Masculino' ? 'bg-blue-600 h-full' : 'bg-pink-600 h-full'}
                    style={{ width: `${gender.visualizacoes_pct}%` }}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Retenção média:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(gender.porcentagem_visualizada_media)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Continuaram assistindo:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(gender.continuaram_assistindo_pct)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição por Idade */}
      {ageData.length > 0 && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Distribuição por Faixa Etária
          </h2>
          
          <div className="space-y-4">
            {ageData
              .sort((a, b) => b.visualizacoes_pct - a.visualizacoes_pct)
              .map((age, index) => (
                <div key={`age-${age.categoria}-${index}`} className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {age.categoria}
                    </span>
                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPercent(age.visualizacoes_pct)}%
                    </span>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all"
                      style={{ width: `${age.visualizacoes_pct}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Retenção: {formatPercent(age.porcentagem_visualizada_media)}%
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Tempo: {formatPercent(age.tempo_exibicao_horas_pct)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Comportamento da Audiência - Visão Detalhada */}
      {audienceBehavior.length > 0 && (
        <>
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gradient-to-br from-orange-900 to-red-900 border border-orange-700' :
            'bg-gradient-to-br from-orange-50 to-red-50 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Comportamento de Visualização
                </h2>
                <p className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                  Análise detalhada do comportamento do público
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Comportamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Novos Espectadores */}
            {newViewersBehavior && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700' :
                'bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">👤</div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Novos Espectadores
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Visualizações:</span>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(newViewersBehavior.visualizacoes)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Vis. Intencionais:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(newViewersBehavior.visualizacoes_intencionais)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Tempo de exibição:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(newViewersBehavior.tempo_exibicao_horas)}h
                    </span>
                  </div>

                  <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>Retenção média:</span>
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatPercent(newViewersBehavior.porcentagem_visualizada_media)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${newViewersBehavior.porcentagem_visualizada_media}%` }}
                      />
                    </div>
                  </div>

                  {newViewersBehavior.impressoes > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>Impressões:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(newViewersBehavior.impressoes)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-blue-200' : 'text-blue-900'}>CTR:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatPercent(newViewersBehavior.taxa_cliques_impressoes)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Espectadores Casuais */}
            {casualViewersBehavior && (
              <div className={`rounded-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-green-900 to-green-800 border border-green-700' :
                'bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">🎲</div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Espectadores Casuais
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Visualizações:</span>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(casualViewersBehavior.visualizacoes)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Vis. Intencionais:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(casualViewersBehavior.visualizacoes_intencionais)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Tempo de exibição:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(casualViewersBehavior.tempo_exibicao_horas)}h
                    </span>
                  </div>

                  <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-green-800/50' : 'bg-green-100'}`}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-900'}`}>Retenção média:</span>
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatPercent(casualViewersBehavior.porcentagem_visualizada_media)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${casualViewersBehavior.porcentagem_visualizada_media}%` }}
                      />
                    </div>
                  </div>

                  {casualViewersBehavior.impressoes > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-green-200' : 'text-green-900'}>Impressões:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(casualViewersBehavior.impressoes)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-green-200' : 'text-green-900'}>CTR:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatPercent(casualViewersBehavior.taxa_cliques_impressoes)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comparativo Detalhado de Comportamento */}
          <div>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Comparativo Detalhado de Comportamento
            </h3>

            <div className="space-y-4">
              {audienceBehavior
                .filter(b => b.visualizacoes > 0 && b.tipo_publico !== 'Desconhecido')
                .map((behavior, index) => {
                  const isTotal = behavior.tipo_publico === 'Total';
                  const icon = behavior.tipo_publico === 'Total' ? '📈' :
                              behavior.tipo_publico === 'Novos espectadores' ? '👤' :
                              behavior.tipo_publico === 'Espectadores casuais' ? '🎯' : '❓';

                  const bgColor = isTotal
                    ? (darkMode ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300')
                    : behavior.tipo_publico === 'Novos espectadores'
                    ? (darkMode ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300')
                    : (darkMode ? 'bg-gradient-to-r from-green-900/40 to-green-800/40 border-green-700' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-300');

                  // Calcular métricas importantes
                  const hasImpressions = behavior.impressoes > 0;
                  const hasComments = behavior.comentarios_adicionados > 0;

                  return (
                    <div
                      key={`behavior-${behavior.tipo_publico}-${index}`}
                      className={`rounded-lg p-5 border-2 ${bgColor} transition-all hover:shadow-lg`}
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-300 dark:border-gray-600">
                        <span className="text-3xl">{icon}</span>
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {behavior.tipo_publico}
                          </h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isTotal ? 'Métricas gerais do canal' : 'Análise de comportamento'}
                          </p>
                        </div>
                      </div>

                      {/* Grid de Métricas - Sempre 4 colunas principais */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Visualizações */}
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/30' : 'bg-white/70'}`}>
                          <div className={`text-xs mb-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            👁️ Visualizações
                          </div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(behavior.visualizacoes)}
                          </div>
                        </div>

                        {/* Retenção */}
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/30' : 'bg-white/70'}`}>
                          <div className={`text-xs mb-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ⏱️ Retenção
                          </div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {behavior.porcentagem_visualizada_media > 0
                              ? `${formatPercent(behavior.porcentagem_visualizada_media)}%`
                              : '-'}
                          </div>
                        </div>

                        {/* Tempo de Exibição */}
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/30' : 'bg-white/70'}`}>
                          <div className={`text-xs mb-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            🕐 Tempo Exibição
                          </div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(behavior.tempo_exibicao_horas)}h
                          </div>
                        </div>

                        {/* CTR (se tiver impressões) ou Visualizações Intencionais */}
                        {hasImpressions ? (
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/30' : 'bg-white/70'}`}>
                            <div className={`text-xs mb-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              🎯 CTR
                            </div>
                            <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatPercent(behavior.taxa_cliques_impressoes)}%
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-black/30' : 'bg-white/70'}`}>
                            <div className={`text-xs mb-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              🎬 Views Intencionais
                            </div>
                            <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(behavior.visualizacoes_intencionais)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Métricas Secundárias - Apenas se relevantes */}
                      {(hasImpressions || hasComments) && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {hasImpressions && (
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/50'}`}>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Impressões
                              </div>
                              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatNumber(behavior.impressoes)}
                              </div>
                            </div>
                          )}
                          {hasComments && (
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/50'}`}>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                💬 Comentários
                              </div>
                              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatNumber(behavior.comentarios_adicionados)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Insights sobre Comportamento */}
          {(newViewersBehavior || casualViewersBehavior) && (
            <div className={`rounded-xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Insights de Comportamento
              </h3>

              <div className="space-y-3">
                {newViewersBehavior && newViewersBehavior.visualizacoes > 0 && (
                  <div className={`p-4 rounded-lg border-l-4 border-blue-600 ${
                    darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                  }`}>
                    <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Novos Espectadores
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Representam a maior parte das visualizações ({formatNumber(newViewersBehavior.visualizacoes)} views)
                      com retenção média de {formatPercent(newViewersBehavior.porcentagem_visualizada_media)}%.
                      {newViewersBehavior.porcentagem_visualizada_media >= 70
                        ? ' Excelente engajamento com audiência nova!'
                        : newViewersBehavior.porcentagem_visualizada_media >= 50
                        ? ' Bom engajamento, continue criando conteúdo atrativo.'
                        : ' Considere otimizar os primeiros segundos do vídeo para reter novos espectadores.'}
                    </p>
                  </div>
                )}

                {casualViewersBehavior && casualViewersBehavior.visualizacoes > 0 && (
                  <div className={`p-4 rounded-lg border-l-4 border-green-600 ${
                    darkMode ? 'bg-gray-700/50' : 'bg-green-50'
                  }`}>
                    <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Espectadores Casuais
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatNumber(casualViewersBehavior.visualizacoes)} visualizações de espectadores casuais
                      com retenção de {formatPercent(casualViewersBehavior.porcentagem_visualizada_media)}%.
                      {casualViewersBehavior.porcentagem_visualizada_media >= 60
                        ? ' Ótima capacidade de reter até audiência casual!'
                        : ' Oportunidade de converter casuais em recorrentes com CTAs efetivos.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AudienceAnalysis;

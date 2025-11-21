import { ProcessedData } from '../types';
import { Smartphone, Tv, Tablet, Monitor, Cpu } from 'lucide-react';

interface DeviceTypeAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const DeviceTypeAnalysis = ({ data, darkMode }: DeviceTypeAnalysisProps) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType.includes('móvel')) return Smartphone;
    if (deviceType === 'TV') return Tv;
    if (deviceType === 'Tablet') return Tablet;
    if (deviceType === 'Computador') return Monitor;
    return Monitor;
  };

  const getDeviceColor = (deviceType: string) => {
    if (deviceType.includes('móvel')) return 'blue';
    if (deviceType === 'TV') return 'purple';
    if (deviceType === 'Tablet') return 'green';
    if (deviceType === 'Computador') return 'orange';
    return 'gray';
  };

  const aggregateTimeSeriesData = () => {
    if (!data.deviceTypeTimeSeries || data.deviceTypeTimeSeries.length === 0) {
      return [];
    }

    const deviceMap = new Map();

    data.deviceTypeTimeSeries.forEach(item => {
      if (!deviceMap.has(item.tipo_dispositivo)) {
        deviceMap.set(item.tipo_dispositivo, {
          tipo_dispositivo: item.tipo_dispositivo,
          total_visualizacoes: 0,
          days_active: 0,
        });
      }

      const device = deviceMap.get(item.tipo_dispositivo);
      device.total_visualizacoes += item.visualizacoes_intencionais;
      if (item.visualizacoes_intencionais > 0) {
        device.days_active += 1;
      }
    });

    return Array.from(deviceMap.values()).sort((a, b) => b.total_visualizacoes - a.total_visualizacoes);
  };

  const timeSeriesDevices = aggregateTimeSeriesData();
  const totalViews = timeSeriesDevices.reduce((sum, device) => sum + device.total_visualizacoes, 0);

  const getOSIcon = () => {
    return Cpu;
  };

  const getOSColor = (osName: string) => {
    if (osName.includes('Android')) return 'green';
    if (osName.includes('iOS')) return 'blue';
    if (osName.includes('Windows')) return 'blue';
    if (osName.includes('Smart TV') || osName.includes('WebOS') || osName.includes('Roku')) return 'purple';
    if (osName.includes('Playstation') || osName.includes('Xbox')) return 'red';
    if (osName.includes('Mac')) return 'gray';
    if (osName.includes('Linux')) return 'orange';
    return 'gray';
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-gradient-to-br from-blue-900 to-purple-900 border border-blue-700' :
        'bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analise por Tipo de Dispositivo
            </h2>
            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
              Desempenho detalhado por dispositivo ao longo do tempo
            </p>
          </div>
        </div>
      </div>

      {data.deviceType && data.deviceType.length > 0 && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resumo Geral por Dispositivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.deviceType
              .filter(device => device.tipo_dispositivo !== 'Total')
              .map((device) => {
                const Icon = getDeviceIcon(device.tipo_dispositivo);
                const color = getDeviceColor(device.tipo_dispositivo);

                return (
                  <div
                    key={device.tipo_dispositivo}
                    className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                      darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg bg-${color}-100`}>
                        <Icon className={`w-6 h-6 text-${color}-600`} />
                      </div>
                      <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {device.tipo_dispositivo}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Visualizacoes:</span>
                        <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(device.visualizacoes)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tempo de exibicao:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(device.tempo_exibicao_horas)}h
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Retencao media:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {device.porcentagem_visualizada_media.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CTR:</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {device.taxa_cliques_impressoes.toFixed(2)}%
                        </span>
                      </div>

                      {device.impressoes > 0 && (
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Impressoes:</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(device.impressoes)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {timeSeriesDevices.length > 0 && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analise Temporal por Dispositivo
          </h3>

          <div className="space-y-4">
            {timeSeriesDevices.map((device) => {
              const percentage = (device.total_visualizacoes / totalViews) * 100;
              const Icon = getDeviceIcon(device.tipo_dispositivo);
              const color = getDeviceColor(device.tipo_dispositivo);

              return (
                <div
                  key={device.tipo_dispositivo}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {device.tipo_dispositivo}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatNumber(device.total_visualizacoes)} views
                        </span>
                        <span className={`text-lg font-bold text-${color}-600`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${color}-600 transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs">
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      Dias ativos: {device.days_active}
                    </span>
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      Media diaria: {formatNumber(device.total_visualizacoes / Math.max(device.days_active, 1))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.deviceType && data.deviceType.length > 0 && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Metricas de Engajamento
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase">Dispositivo</th>
                  <th className="px-4 py-3 text-right text-xs uppercase">Likes</th>
                  <th className="px-4 py-3 text-right text-xs uppercase">Compartilhamentos</th>
                  <th className="px-4 py-3 text-right text-xs uppercase">Aprovacao</th>
                  <th className="px-4 py-3 text-right text-xs uppercase">Continuaram</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {data.deviceType
                  .filter(device => device.tipo_dispositivo !== 'Total')
                  .map((device) => (
                    <tr
                      key={`engagement-${device.tipo_dispositivo}`}
                      className={`transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getDeviceIcon(device.tipo_dispositivo);
                            return <Icon className="w-4 h-4" />;
                          })()}
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {device.tipo_dispositivo}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(device.marcacoes_gostei)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(device.compartilhamentos)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded ${
                          device.gostei_vs_nao_gostei_pct >= 95 ? 'bg-green-100 text-green-800' :
                          device.gostei_vs_nao_gostei_pct >= 90 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {device.gostei_vs_nao_gostei_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {device.continuaram_assistindo.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.operatingSystem && data.operatingSystem.length > 0 && (
        <>
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gradient-to-br from-green-900 to-teal-900 border border-green-700' :
            'bg-gradient-to-br from-green-50 to-teal-50 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-8 h-8 text-green-600" />
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analise por Sistema Operacional
                </h2>
                <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                  Performance detalhada de cada sistema operacional
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top Sistemas Operacionais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.operatingSystem
                .filter(os => os.sistema_operacional !== 'Total')
                .sort((a, b) => b.visualizacoes - a.visualizacoes)
                .slice(0, 9)
                .map((os) => {
                  const Icon = getOSIcon();
                  const color = getOSColor(os.sistema_operacional);

                  return (
                    <div
                      key={`os-card-${os.sistema_operacional}`}
                      className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                        darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg bg-${color}-100`}>
                          <Icon className={`w-6 h-6 text-${color}-600`} />
                        </div>
                        <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {os.sistema_operacional}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Visualizacoes:</span>
                          <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(os.visualizacoes)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tempo de exibicao:</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(os.tempo_exibicao_horas)}h
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Retencao media:</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {os.porcentagem_visualizada_media.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CTR:</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {os.taxa_cliques_impressoes > 0 ? `${os.taxa_cliques_impressoes.toFixed(2)}%` : '-'}
                          </span>
                        </div>

                        {os.impressoes > 0 && (
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Impressoes:</span>
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(os.impressoes)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Tabela Completa - Sistemas Operacionais
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase">Sistema</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Views</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Tempo (h)</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Retencao</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">CTR</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Likes</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Compartilh.</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Aprovacao</th>
                    <th className="px-4 py-3 text-right text-xs uppercase">Continuaram</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {data.operatingSystem
                    .filter(os => os.sistema_operacional !== 'Total')
                    .sort((a, b) => b.visualizacoes - a.visualizacoes)
                    .map((os) => (
                      <tr
                        key={`os-table-${os.sistema_operacional}`}
                        className={`transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-green-600" />
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {os.sistema_operacional}
                            </span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(os.visualizacoes)}
                        </td>
                        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatNumber(os.tempo_exibicao_horas)}h
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded ${
                            os.porcentagem_visualizada_media >= 70 ? 'bg-green-100 text-green-800' :
                            os.porcentagem_visualizada_media >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {os.porcentagem_visualizada_media.toFixed(1)}%
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {os.taxa_cliques_impressoes > 0 ? `${os.taxa_cliques_impressoes.toFixed(2)}%` : '-'}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(os.marcacoes_gostei)}
                        </td>
                        <td className={`px-4 py-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatNumber(os.compartilhamentos)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {os.gostei_vs_nao_gostei_pct > 0 ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded ${
                              os.gostei_vs_nao_gostei_pct >= 95 ? 'bg-green-100 text-green-800' :
                              os.gostei_vs_nao_gostei_pct >= 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {os.gostei_vs_nao_gostei_pct.toFixed(1)}%
                            </span>
                          ) : (
                            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {os.continuaram_assistindo.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeviceTypeAnalysis;

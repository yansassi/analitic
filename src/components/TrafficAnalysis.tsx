import { ProcessedData } from '../types';
import { Zap, Target } from 'lucide-react';

interface TrafficAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const TrafficAnalysis = ({ data, darkMode }: TrafficAnalysisProps) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));

  const totalViews = data.trafficSources.reduce((sum, t) => sum + t.visualizacoes, 0);

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-yellow-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Origem do Tráfego
          </h2>
        </div>
        
        <div className="space-y-4">
          {data.trafficSources.map((source) => {
            const percentage = (source.visualizacoes / totalViews) * 100;
            return (
              <div key={source.origem} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {source.origem}
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 h-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex gap-4 text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {formatNumber(source.visualizacoes)} views
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    CTR: {source.taxa_cliques_impressoes.toFixed(2)}%
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Retenção: {source.porcentagem_visualizada_media.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dispositivos
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.deviceType.map((device) => (
            <div key={device.tipo_dispositivo} className={`p-6 rounded-lg text-center ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(device.visualizacoes)}
              </div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {device.tipo_dispositivo}
              </div>
              <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {device.porcentagem_visualizada_media.toFixed(1)}% retenção
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalysis;

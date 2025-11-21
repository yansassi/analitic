import { useState } from 'react';
import { ProcessedData } from '../types';
import { Globe, MapPin, TrendingUp, Clock, ThumbsUp, MessageCircle, Share2, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface GeographicAnalysisProps {
  data: ProcessedData;
  darkMode: boolean;
}

const GeographicAnalysis = ({ data, darkMode }: GeographicAnalysisProps) => {
  // Estado para controlar quais cards de países estão expandidos
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(Math.round(num));
  
  const formatPercent = (num: number) => new Intl.NumberFormat('pt-BR', { 
    style: 'percent', 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(num / 100);

  // Função auxiliar para pegar o nome do país caso seja código (simples mapeamento)
  const getCountryName = (code: string) => {
    const names: Record<string, string> = {
      'BR': 'Brasil',
      'PT': 'Portugal',
      'US': 'Estados Unidos',
      'AO': 'Angola',
      'MZ': 'Moçambique',
      'IN': 'Índia',
      'AR': 'Argentina',
      'ES': 'Espanha',
      'FR': 'França',
      'DE': 'Alemanha',
      'IT': 'Itália',
      'GB': 'Reino Unido',
      'JP': 'Japão',
      'MX': 'México',
      'CO': 'Colômbia',
      'CL': 'Chile',
      'PE': 'Peru',
      'RU': 'Rússia'
    };
    // Se o código vier "BR", retorna "Brasil". Se vier o nome completo, retorna ele mesmo.
    return names[code] || code;
  };

  // Função para pegar a bandeira (emoji) baseada no código
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const toggleCountry = (countryCode: string) => {
    if (expandedCountry === countryCode) {
      setExpandedCountry(null);
    } else {
      setExpandedCountry(countryCode);
    }
  };

  return (
    <div className="space-y-8">
      {/* Seção: Top Países (Cards Interativos) */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Desempenho por País
            </h2>
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {data.countries.length} países encontrados
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.countries.slice(0, 10).map((country, index) => {
            const isExpanded = expandedCountry === country.pais_codigo;
            
            return (
              <div 
                key={`country-${country.pais_codigo}-${index}`} 
                className={`rounded-lg transition-all duration-200 border cursor-pointer ${
                  darkMode 
                    ? `bg-gray-700/30 hover:bg-gray-700/50 ${isExpanded ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-600'}` 
                    : `bg-gray-50 hover:bg-gray-100 ${isExpanded ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`
                }`}
                onClick={() => toggleCountry(country.pais_codigo)}
              >
                {/* Cabeçalho do Card */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFlagEmoji(country.pais_codigo)}</span>
                      <div>
                        <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getCountryName(country.pais_nome)}
                        </div>
                        <div className={`text-xs font-mono uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {country.pais_codigo}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="text-right">
                        <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(country.visualizacoes)}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>views</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Métricas Resumidas */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-sm flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {country.tempo_exibicao_horas.toFixed(1)}h
                    </span>
                    <span className={`text-sm flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Users className="w-3.5 h-3.5 text-green-500" />
                      +{country.inscricoes_obtidas}
                    </span>
                    <span className={`text-sm flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                      {formatPercent(country.porcentagem_visualizada_media)}
                    </span>
                  </div>
                </div>

                {/* Área Expandida (Detalhes Completos) */}
                {isExpanded && (
                  <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? 'border-gray-600 bg-gray-700/20' : 'border-gray-200 bg-gray-100/50'}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                      <div className="text-center p-2 rounded bg-opacity-10 bg-blue-500">
                        <ThumbsUp className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gostei</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(country.marcacoes_gostei)}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-opacity-10 bg-green-500">
                        <Share2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Comp.</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(country.compartilhamentos)}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-opacity-10 bg-yellow-500">
                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Coment.</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(country.comentarios_adicionados)}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-opacity-10 bg-red-500">
                         <div className="text-xs font-bold text-red-500 mb-1">Insc.</div>
                         <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Perdidas</div>
                         <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{country.inscricoes_perdidas}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {data.countries.length === 0 && (
            <div className={`col-span-2 text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Nenhum dado de país encontrado. Verifique o arquivo CSV.
            </div>
          )}
        </div>
      </div>

      {/* Seção: Top Cidades (Layout Compacto) */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-green-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Principais Cidades
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.cities.slice(0, 12).map((city, index) => (
            <div key={`city-${city.cidade_id}-${index}`} className={`p-3 rounded-lg border-l-4 ${index < 3 ? 'border-green-500' : 'border-gray-300'} ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-2">
                 <div className="overflow-hidden">
                    <div className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={city.nome_cidade}>
                      {city.nome_cidade}
                    </div>
                 </div>
                 <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(city.visualizacoes)}</div>
              </div>
              <div className="flex justify-between items-center">
                 <span className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {formatPercent(city.porcentagem_visualizada_media)} retenção
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeographicAnalysis;
import { InstagramData } from '../types';
import { Users, MapPin, Globe, Heart } from 'lucide-react';

interface InstagramAudienceProps {
  data: InstagramData;
  darkMode: boolean;
}

const InstagramAudience = ({ data, darkMode }: InstagramAudienceProps) => {
  // Ordenações e fatiamento dos dados
  const topCidades = [...data.publicoCidades]
    .sort((a, b) => (b.porcentagem || 0) - (a.porcentagem || 0))
    .slice(0, 10);

  const topPaises = [...data.publicoPaises]
    .sort((a, b) => (b.porcentagem || 0) - (a.porcentagem || 0))
    .slice(0, 5);

  const topPaginas = [...data.publicoPaginas]
    .sort((a, b) => (b.porcentagem || 0) - (a.porcentagem || 0))
    .slice(0, 12);

  const faixasEtarias = [...data.publicoIdadeGenero].sort((a, b) => {
    return a.categoria.localeCompare(b.categoria);
  });

  const instaGradient = "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500";

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* 1. Afinidades (O dado mais valioso) */}
      <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
            <Heart className="w-6 h-6" />
          </div>
          Interesses da Audiência (Páginas que seguem)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPaginas.map((pagina, idx) => (
            <div
              key={idx}
              className={`group p-4 rounded-xl border flex justify-between items-center transition-all duration-200 hover:shadow-md
                ${darkMode
                  ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                  : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-pink-200'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${instaGradient}`}>
                  {idx + 1}
                </div>
                <span className={`font-bold text-sm truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} title={pagina.nome}>
                  {pagina.nome}
                </span>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${darkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>
                {pagina.porcentagem}%
              </span>
            </div>
          ))}
          {topPaginas.length === 0 && (
            <div className="col-span-3 py-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium mb-1">Nenhum interesse encontrado.</p>
              <p className="text-xs text-gray-400">Verifique se o arquivo "Público" foi importado corretamente.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 2. Faixa Etária e Gênero */}
        <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            Faixa Etária e Gênero
          </h3>

          {/* Legenda */}
          <div className="flex justify-end gap-4 mb-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Mulheres</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Homens</span>
            </div>
          </div>

          <div className="space-y-6">
            {faixasEtarias.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{item.categoria}</span>
                  <div className="flex gap-4 text-xs opacity-80">
                    <span className="text-pink-500">{item.valorMulheres}%</span>
                    <span className="text-blue-500">{item.valorHomens}%</span>
                  </div>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <div className="bg-pink-500 h-full relative" style={{ width: `${(item.valorMulheres || 0) * 2}%` }}></div>
                  <div className="bg-blue-500 h-full relative" style={{ width: `${(item.valorHomens || 0) * 2}%` }}></div>
                </div>
              </div>
            ))}
            {faixasEtarias.length === 0 && <p className="text-center text-gray-500 py-8">Dados demográficos não encontrados.</p>}
          </div>
        </div>

        {/* 3. Geografia */}
        <div className="space-y-8">
          {/* Cidades */}
          <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <MapPin className="w-6 h-6" />
              </div>
              Principais Cidades
            </h3>
            <div className="space-y-5">
              {topCidades.map((city, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-sm font-bold w-1/3 truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} title={city.categoria}>
                    {city.categoria}
                  </span>
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="h-2.5 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full shadow-sm" style={{ width: `${(city.porcentagem || 0) * 5}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {city.porcentagem}%
                    </span>
                  </div>
                </div>
              ))}
              {topCidades.length === 0 && <p className="text-center text-gray-500 py-4">Sem dados geográficos.</p>}
            </div>
          </div>

          {/* Países */}
          <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-6 h-6" />
              </div>
              Principais Países
            </h3>
            <div className="flex flex-wrap gap-2">
              {topPaises.map((pais, idx) => (
                <div key={idx} className={`px-4 py-1.5 rounded-full text-sm border font-medium flex items-center gap-2 ${darkMode ? 'border-indigo-900 bg-indigo-900/20 text-indigo-300' : 'border-indigo-100 bg-indigo-50 text-indigo-700'}`}>
                  {pais.categoria}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-indigo-800'}`}>
                    {pais.porcentagem}%
                  </span>
                </div>
              ))}
              {topPaises.length === 0 && <p className="text-gray-500 text-sm italic">Sem dados de países.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstagramAudience;
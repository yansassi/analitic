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

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Afinidades (O dado mais valioso) */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Heart className="w-6 h-6 text-pink-500" />
          Interesses da Audiência (Páginas que seguem)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPaginas.map((pagina, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border-l-4 flex justify-between items-center shadow-sm
                ${darkMode 
                  ? 'border-l-pink-500 border-gray-700 bg-gray-700' 
                  : 'border-l-pink-500 border-gray-300 bg-gray-50' // Fundo sólido para contraste
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {idx + 1}
                </div>
                {/* CORREÇÃO DE CONTRASTE: Texto preto e negrito */}
                <span className={`font-extrabold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={pagina.nome}>
                  {pagina.nome}
                </span>
              </div>
              <span className="flex-shrink-0 text-sm font-bold text-pink-600 bg-pink-100 dark:bg-pink-900/50 px-2 py-1 rounded-md">
                {pagina.porcentagem}%
              </span>
            </div>
          ))}
          {topPaginas.length === 0 && (
            <div className="col-span-3 py-8 text-center">
               <p className="text-gray-500 mb-2">Nenhum interesse encontrado.</p>
               <p className="text-xs text-gray-400">Verifique se o arquivo "Público" foi importado corretamente.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. Faixa Etária e Gênero */}
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Users className="w-6 h-6 text-blue-500" />
            Faixa Etária e Gênero
          </h3>
          <div className="space-y-5">
            {faixasEtarias.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-900 font-bold'}>{item.categoria}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-pink-500 font-semibold">Mulheres: {item.valorMulheres}%</span>
                    <span className="text-blue-500 font-semibold">Homens: {item.valorHomens}%</span>
                  </div>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <div className="bg-pink-500 h-full relative group" style={{ width: `${(item.valorMulheres || 0) * 2}%` }}></div>
                  <div className="bg-blue-500 h-full relative group" style={{ width: `${(item.valorHomens || 0) * 2}%` }}></div>
                </div>
              </div>
            ))}
            {faixasEtarias.length === 0 && <p className="text-center text-gray-500">Dados demográficos não encontrados.</p>}
          </div>
        </div>

        {/* 3. Geografia */}
        <div className="space-y-6">
          {/* Cidades */}
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <MapPin className="w-6 h-6 text-green-500" />
              Principais Cidades
            </h3>
            <div className="space-y-4">
              {topCidades.map((city, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  {/* CORREÇÃO DE CONTRASTE: Texto preto e negrito */}
                  <span className={`text-sm font-bold w-1/3 truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`} title={city.categoria}>
                    {city.categoria}
                  </span>
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="h-3 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(city.porcentagem || 0) * 5}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {city.porcentagem}%
                    </span>
                  </div>
                </div>
              ))}
              {topCidades.length === 0 && <p className="text-center text-gray-500">Sem dados geográficos.</p>}
            </div>
          </div>

          {/* Países */}
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Globe className="w-6 h-6 text-indigo-500" />
              Principais Países
            </h3>
            <div className="flex flex-wrap gap-2">
              {topPaises.map((pais, idx) => (
                <div key={idx} className={`px-3 py-1 rounded-full text-sm border font-medium ${darkMode ? 'border-indigo-900 bg-indigo-900/30 text-indigo-300' : 'border-indigo-200 bg-indigo-50 text-indigo-800'}`}>
                  {pais.categoria}: <strong className="ml-1">{pais.porcentagem}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstagramAudience;
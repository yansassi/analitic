import { useState } from 'react';
import { InstagramData, InstagramPost } from '../types';
import { 
  Eye, UserPlus, MousePointerClick, TrendingUp, Heart, Users, 
  MapPin, Smartphone, Bookmark, ExternalLink, Globe
} from 'lucide-react';
import InstagramPostDetailModal from './InstagramPostDetailModal';

interface InstagramOverviewProps {
  data: InstagramData;
  darkMode: boolean;
}

const InstagramOverview = ({ data, darkMode }: InstagramOverviewProps) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  // Cards de KPI
  const cards = [
    { 
      title: 'Alcance Total', 
      value: formatNumber(data.resumo.totalAlcance), 
      icon: Users, 
      color: 'text-purple-500', 
      bg: 'bg-purple-100 dark:bg-purple-900/30' 
    },
    { 
      title: 'Visualizações', 
      value: formatNumber(data.resumo.totalVisualizacoes), 
      icon: Eye, 
      color: 'text-blue-500', 
      bg: 'bg-blue-100 dark:bg-blue-900/30' 
    },
    { 
      title: 'Interações', 
      value: formatNumber(data.resumo.totalInteracoes), 
      icon: Heart, 
      color: 'text-red-500', 
      bg: 'bg-red-100 dark:bg-red-900/30' 
    },
    { 
      title: 'Novos Seguidores', 
      value: formatNumber(data.resumo.totalSeguidoresGanhos), 
      icon: UserPlus, 
      color: 'text-green-500', 
      bg: 'bg-green-100 dark:bg-green-900/30' 
    },
    { 
      title: 'Visitas ao Perfil', 
      value: formatNumber(data.resumo.totalVisitas), 
      icon: MousePointerClick, 
      color: 'text-pink-500', 
      bg: 'bg-pink-100 dark:bg-pink-900/30' 
    },
    { 
      title: 'Salvamentos', 
      value: formatNumber(data.resumo.totalSalvamentos), 
      icon: Bookmark, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30' 
    },
  ];

  // Ordenações
  const topPosts = [...data.posts]
    .filter(p => p.visualizacoes > 0)
    .sort((a, b) => b.visualizacoes - a.visualizacoes)
    .slice(0, 10);
  
  const topCidades = [...data.publicoCidades]
    .sort((a, b) => (b.porcentagem || 0) - (a.porcentagem || 0))
    .slice(0, 5);
  
  const topPaginas = [...data.publicoPaginas]
    .sort((a, b) => (b.porcentagem || 0) - (a.porcentagem || 0))
    .slice(0, 5);

  // Funil
  const funnel = [
    { label: 'Alcance (Pessoas alcançadas)', value: data.resumo.totalAlcance, color: 'bg-purple-500' },
    { label: 'Visualizações (Impressões)', value: data.resumo.totalVisualizacoes, color: 'bg-blue-500' },
    { label: 'Interações (Engajamento)', value: data.resumo.totalInteracoes, color: 'bg-red-500' },
    { label: 'Conversão (Seguidores)', value: data.resumo.totalSeguidoresGanhos, color: 'bg-green-500' }
  ];
  const maxFunnelVal = Math.max(...funnel.map(f => f.value)) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Modal de Detalhes */}
      <InstagramPostDetailModal 
        post={selectedPost} 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        darkMode={darkMode}
      />

      {/* 1. KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`p-6 rounded-xl shadow-lg hover:transform hover:scale-105 transition-all ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <h3 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</h3>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Coluna Esquerda */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Funil */}
          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
             <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
               <TrendingUp className="w-5 h-5 text-blue-500" /> Funil de Performance
             </h3>
             <div className="space-y-6">
               {funnel.map((item, idx) => (
                 <div key={idx}>
                   <div className="flex justify-between text-sm mb-1">
                     <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                     <span className="font-bold text-gray-500">{formatNumber(item.value)}</span>
                   </div>
                   <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full ${item.color}`} 
                       style={{ width: `${(item.value / maxFunnelVal) * 100}%` }}
                     />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Afinidades */}
          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
               <Heart className="w-5 h-5 text-pink-500" /> Afinidades do Público
            </h3>
            <div className="space-y-4">
              {topPaginas.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className={`text-sm truncate max-w-[70%] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {page.nome}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>
                    {page.porcentagem}%
                  </span>
                </div>
              ))}
              {topPaginas.length === 0 && <p className="text-gray-500 text-sm italic">Dados indisponíveis.</p>}
            </div>
          </div>

          {/* Cidades */}
          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
               <MapPin className="w-5 h-5 text-green-500" /> Top Cidades
            </h3>
            <div className="space-y-4">
              {topCidades.map((city, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{city.categoria}</span>
                  <div className="flex items-center gap-2 w-24">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${city.porcentagem}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{city.porcentagem}%</span>
                  </div>
                </div>
              ))}
              {topCidades.length === 0 && <p className="text-gray-500 text-sm italic">Dados indisponíveis.</p>}
            </div>
          </div>

        </div>

        {/* 3. Coluna Direita: Top Posts (Interativa) */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Smartphone className="w-5 h-5" />
                Performance dos Posts
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Clique para detalhes
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Conteúdo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500" title="Visualizações"><Eye className="w-4 h-4 mx-auto"/></th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500" title="Alcance"><Globe className="w-4 h-4 mx-auto"/></th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500" title="Curtidas"><Heart className="w-4 h-4 mx-auto"/></th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500" title="Salvamentos"><Bookmark className="w-4 h-4 mx-auto"/></th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {topPosts.map((post, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedPost(post)}
                      className={`cursor-pointer transition-all duration-200 ${
                        darkMode 
                          ? 'hover:bg-gray-700/80 active:bg-gray-700' 
                          : 'hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={post.descricao}>
                          {post.descricao || 'Post sem legenda'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{new Date(post.data).toLocaleDateString('pt-BR')}</span>
                          {post.tipo && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 uppercase">{post.tipo.replace('do Instagram', '')}</span>}
                          {post.link && (
                            <a 
                              href={post.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(post.visualizacoes)}</td>
                      <td className={`px-4 py-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatNumber(post.alcance)}</td>
                      <td className={`px-4 py-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatNumber(post.curtidas)}</td>
                      <td className={`px-4 py-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatNumber(post.salvamentos)}</td>
                    </tr>
                  ))}
                  {topPosts.length === 0 && (
                     <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum post encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramOverview;
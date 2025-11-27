import { useState } from 'react';
import { InstagramData, InstagramPost } from '../types';
import {
  Eye, UserPlus, MousePointerClick, TrendingUp, Heart, Users,
  MapPin, Smartphone, Bookmark, ArrowUpRight
} from 'lucide-react';
import InstagramPostDetailModal from './InstagramPostDetailModal';

interface InstagramOverviewProps {
  data: InstagramData;
  darkMode: boolean;
}

const InstagramOverview = ({ data, darkMode }: InstagramOverviewProps) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  // Gradientes do Instagram para uso geral
  const instaGradient = "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500";

  // Cards de KPI com Design Premium
  const cards = [
    {
      title: 'Alcance Total',
      value: formatNumber(data.resumo.totalAlcance),
      icon: Users,
      gradient: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-purple-500/20'
    },
    {
      title: 'Visualizações',
      value: formatNumber(data.resumo.totalVisualizacoes),
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Interações',
      value: formatNumber(data.resumo.totalInteracoes),
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      shadow: 'shadow-pink-500/20'
    },
    {
      title: 'Novos Seguidores',
      value: formatNumber(data.resumo.totalSeguidoresGanhos),
      icon: UserPlus,
      gradient: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/20'
    },
    {
      title: 'Visitas ao Perfil',
      value: formatNumber(data.resumo.totalVisitas),
      icon: MousePointerClick,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/20'
    },
    {
      title: 'Salvamentos',
      value: formatNumber(data.resumo.totalSalvamentos),
      icon: Bookmark,
      gradient: 'from-yellow-500 to-orange-600',
      shadow: 'shadow-yellow-500/20'
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
    { label: 'Alcance', sub: 'Pessoas alcançadas', value: data.resumo.totalAlcance, color: 'bg-purple-500' },
    { label: 'Impressões', sub: 'Visualizações totais', value: data.resumo.totalVisualizacoes, color: 'bg-blue-500' },
    { label: 'Engajamento', sub: 'Interações totais', value: data.resumo.totalInteracoes, color: 'bg-pink-500' },
    { label: 'Conversão', sub: 'Novos seguidores', value: data.resumo.totalSeguidoresGanhos, color: 'bg-green-500' }
  ];
  const maxFunnelVal = Math.max(...funnel.map(f => f.value)) || 1;

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Modal de Detalhes */}
      <InstagramPostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        darkMode={darkMode}
      />

      {/* 1. KPIs Principais - Grid Moderno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.shadow} 
                ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' : 'bg-white border border-gray-100 shadow-lg'}`}
            >
              {/* Background Decorativo */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${card.gradient}`}></div>

              <div className="flex items-start justify-between mb-4">
                <div className="relative z-10">
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
                  <h3 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Barra de progresso decorativa */}
              <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div className={`h-full bg-gradient-to-r ${card.gradient} w-2/3 opacity-80`}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* 2. Coluna Esquerda (Funil e Afinidades) - 4 colunas */}
        <div className="lg:col-span-4 space-y-8">

          {/* Funil */}
          <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              Funil de Performance
            </h3>
            <div className="space-y-6 relative">
              {/* Linha conectora vertical */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-700 -z-10"></div>

              {funnel.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className={`block text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.label}</span>
                      <span className="text-xs text-gray-500">{item.sub}</span>
                    </div>
                    <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(item.value)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} shadow-sm`}
                      style={{ width: `${(item.value / maxFunnelVal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Afinidades */}
          <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                <Heart className="w-5 h-5" />
              </div>
              Interesses do Público
            </h3>
            <div className="space-y-3">
              {topPaginas.map((page, idx) => (
                <div key={idx} className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-pink-50/50'}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${instaGradient}`}>
                      {idx + 1}
                    </span>
                    <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-pink-700'}`}>
                      {page.nome}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${darkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>
                    {page.porcentagem}%
                  </span>
                </div>
              ))}
              {topPaginas.length === 0 && <p className="text-gray-500 text-sm italic text-center py-4">Dados de afinidade indisponíveis.</p>}
            </div>
          </div>

          {/* Cidades */}
          <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <MapPin className="w-5 h-5" />
              </div>
              Top Cidades
            </h3>
            <div className="space-y-4">
              {topCidades.map((city, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{city.categoria}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full shadow-sm" style={{ width: `${city.porcentagem}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{city.porcentagem}%</span>
                  </div>
                </div>
              ))}
              {topCidades.length === 0 && <p className="text-gray-500 text-sm italic text-center py-4">Dados geográficos indisponíveis.</p>}
            </div>
          </div>

        </div>

        {/* 3. Coluna Direita (Tabela de Posts) - 8 colunas */}
        <div className="lg:col-span-8">
          <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Smartphone className="w-6 h-6 text-purple-500" />
                  Top Posts
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Os conteúdos com melhor desempenho no período
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                Ordenado por Visualizações
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Conteúdo</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Views</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Alcance</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Likes</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Salvos</th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Ação</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {topPosts.map((post, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPost(post)}
                      className={`group cursor-pointer transition-all duration-200 ${darkMode
                          ? 'hover:bg-gray-700/40'
                          : 'hover:bg-purple-50/30'
                        }`}
                    >
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className={`text-sm font-medium line-clamp-2 mb-1 ${darkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'}`} title={post.descricao}>
                              {post.descricao || 'Post sem legenda'}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{new Date(post.data).toLocaleDateString('pt-BR')}</span>
                              {post.tipo && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${post.tipo.toLowerCase().includes('reels')
                                    ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                  }`}>
                                  {post.tipo.replace('do Instagram', '')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`block text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(post.visualizacoes)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatNumber(post.alcance)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-pink-500">
                          <Heart className="w-3 h-3 fill-current" />
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(post.curtidas)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatNumber(post.salvamentos)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {topPosts.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Smartphone className="w-8 h-8 opacity-20" />
                        <p>Nenhum post encontrado no período.</p>
                      </div>
                    </td></tr>
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
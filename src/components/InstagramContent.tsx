import { useState } from 'react';
import { InstagramData, InstagramPost } from '../types';
import {
    LayoutGrid, TrendingUp, MessageCircle, Share2, Bookmark, Heart, Eye,
    Clock, ArrowUpRight, BarChart, Star
} from 'lucide-react';
import InstagramPostDetailModal from './InstagramPostDetailModal';

interface InstagramContentProps {
    data: InstagramData;
    darkMode: boolean;
}

const InstagramContent = ({ data, darkMode }: InstagramContentProps) => {
    const [filterType, setFilterType] = useState<string>('todos');
    const [sortBy, setSortBy] = useState<keyof InstagramPost>('visualizacoes');
    const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

    const handlePostClick = (post: InstagramPost) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    // --- LÓGICA DE ANÁLISE CRUZADA (MIGRADA DA ABA PÚBLICO) ---

    // 1. Análise Completa por Dia da Semana
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const viewsByDay = new Array(7).fill(0);
    const interactionsByDay = new Array(7).fill(0);
    const reachByDay = new Array(7).fill(0);
    const postsByDay = new Array(7).fill(0);

    data.posts.forEach(post => {
        if (!post.data) return;
        const date = new Date(post.data);
        if (!isNaN(date.getTime())) {
            const day = date.getDay();
            viewsByDay[day] += post.visualizacoes;
            interactionsByDay[day] += (post.curtidas + post.comentarios + post.salvamentos + post.compartilhamentos);
            reachByDay[day] += post.alcance;
            postsByDay[day] += 1;
        }
    });

    const bestDaysByViews = daysOfWeek.map((day, idx) => ({
        day,
        value: viewsByDay[idx],
        count: postsByDay[idx]
    })).sort((a, b) => b.value - a.value);

    const bestDaysByInteractions = daysOfWeek.map((day, idx) => ({
        day,
        value: interactionsByDay[idx],
        count: postsByDay[idx]
    })).sort((a, b) => b.value - a.value);

    const bestDaysByReach = daysOfWeek.map((day, idx) => ({
        day,
        value: reachByDay[idx],
        count: postsByDay[idx]
    })).sort((a, b) => b.value - a.value);

    const bestDaysByEngagement = daysOfWeek.map((day, idx) => ({
        day,
        value: postsByDay[idx] > 0 ? Math.round(interactionsByDay[idx] / postsByDay[idx]) : 0,
        count: postsByDay[idx]
    })).sort((a, b) => b.value - a.value);

    const maxViewsDay = Math.max(...bestDaysByViews.map(d => d.value)) || 1;
    const maxInteractionsDay = Math.max(...bestDaysByInteractions.map(d => d.value)) || 1;
    const maxReachDay = Math.max(...bestDaysByReach.map(d => d.value)) || 1;
    const maxEngagementDay = Math.max(...bestDaysByEngagement.map(d => d.value)) || 1;

    // 2. Afinidade por Formato (Baseado em Engajamento Médio)
    const formatStats: Record<string, { interactions: number, count: number }> = {};
    data.posts.forEach(post => {
        const type = post.tipo || 'Outros';
        if (!formatStats[type]) formatStats[type] = { interactions: 0, count: 0 };
        formatStats[type].interactions += (post.curtidas + post.comentarios + post.salvamentos);
        formatStats[type].count += 1;
    });

    const formatAffinity = Object.entries(formatStats).map(([type, stats]) => ({
        type: type.replace('do Instagram', '').trim(),
        avgInteractions: Math.round(stats.interactions / stats.count)
    })).sort((a, b) => b.avgInteractions - a.avgInteractions);

    const maxAffinity = Math.max(...formatAffinity.map(f => f.avgInteractions)) || 1;

    // 3. Top 10 Conteúdo (Engajamento Total)
    const topContent = [...data.posts]
        .sort((a, b) => {
            const engA = a.curtidas + a.comentarios + a.salvamentos;
            const engB = b.curtidas + b.comentarios + b.salvamentos;
            return engB - engA;
        })
        .slice(0, 10);


    // --- FILTRAGEM E ORDENAÇÃO DA TABELA ---
    const filteredPosts = data.posts.filter(post => {
        if (filterType === 'todos') return true;
        return post.tipo.toLowerCase().includes(filterType.toLowerCase());
    }).sort((a, b) => {
        const valA = (a[sortBy] as number) || 0;
        const valB = (b[sortBy] as number) || 0;
        return valB - valA;
    });

    // KPIs Calculados
    const totalPosts = filteredPosts.length;
    const totalViews = filteredPosts.reduce((acc, curr) => acc + curr.visualizacoes, 0);
    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    const totalEngajamento = filteredPosts.reduce((acc, curr) =>
        acc + curr.curtidas + curr.comentarios + curr.compartilhamentos + curr.salvamentos, 0);
    const avgEngajamento = totalPosts > 0 ? Math.round(totalEngajamento / totalPosts) : 0;

    const bestPost = filteredPosts.length > 0 ? filteredPosts[0] : null;

    return (
        <div className="space-y-8 animate-fade-in pb-10">

            {/* Header e Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Análise de Conteúdo</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Performance detalhada dos seus posts, reels e stories.
                    </p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                    >
                        <option value="todos">Todos os Tipos</option>
                        <option value="reel">Reels</option>
                        <option value="imagem">Imagens</option>
                        <option value="carrossel">Carrosséis</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as keyof InstagramPost)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                    >
                        <option value="visualizacoes">Por Visualizações</option>
                        <option value="curtidas">Por Curtidas</option>
                        <option value="comentarios">Por Comentários</option>
                        <option value="compartilhamentos">Por Compartilhamentos</option>
                        <option value="salvamentos">Por Salvamentos</option>
                    </select>
                </div>
            </div>

            {/* KPIs de Conteúdo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-6 rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total de Posts</p>
                            <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalPosts}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">No período selecionado</div>
                </div>

                <div className={`p-6 rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Média de Views</p>
                            <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(avgViews)}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Eye className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">Por publicação</div>
                </div>

                <div className={`p-6 rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Média Engajamento</p>
                            <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(avgEngajamento)}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                            <Heart className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">Interações por post</div>
                </div>

                <div
                    className={`p-6 rounded-2xl shadow-lg border cursor-pointer transition-all hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                    onClick={() => bestPost && handlePostClick(bestPost)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Melhor Post</p>
                            <h3 className={`text-xl font-bold truncate max-w-[150px] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {bestPost ? formatNumber(bestPost.visualizacoes) : '-'}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{bestPost?.descricao || 'Nenhum post'}</div>
                </div>
            </div>

            {/* SEÇÃO DE ANÁLISE CRUZADA (NOVO) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Dias com Mais Visualizações */}
                <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Eye className="w-5 h-5" />
                        </div>
                        Dias com Mais Visualizações
                    </h3>
                    <div className="space-y-3">
                        {bestDaysByViews.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-1/3">
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.day}</span>
                                </div>
                                <div className="flex items-center gap-3 w-2/3">
                                    <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-blue-400/70'}`}
                                            style={{ width: `${(item.value / maxViewsDay) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold w-16 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatNumber(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dias com Mais Interações */}
                <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                            <Heart className="w-5 h-5" />
                        </div>
                        Dias com Mais Interações
                    </h3>
                    <div className="space-y-3">
                        {bestDaysByInteractions.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-1/3">
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.day}</span>
                                </div>
                                <div className="flex items-center gap-3 w-2/3">
                                    <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-pink-500' : 'bg-pink-400/70'}`}
                                            style={{ width: `${(item.value / maxInteractionsDay) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold w-16 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatNumber(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dias com Mais Alcance */}
                <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        Dias com Mais Alcance
                    </h3>
                    <div className="space-y-3">
                        {bestDaysByReach.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-1/3">
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.day}</span>
                                </div>
                                <div className="flex items-center gap-3 w-2/3">
                                    <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-orange-400/70'}`}
                                            style={{ width: `${(item.value / maxReachDay) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold w-16 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatNumber(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dias com Melhor Engajamento Médio */}
                <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <Star className="w-5 h-5" />
                        </div>
                        Melhor Engajamento Médio
                    </h3>
                    <div className="space-y-3">
                        {bestDaysByEngagement.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-1/3">
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.day}</span>
                                </div>
                                <div className="flex items-center gap-3 w-2/3">
                                    <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-purple-500' : 'bg-purple-400/70'}`}
                                            style={{ width: `${(item.value / maxEngagementDay) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold w-16 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatNumber(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Afinidade por Formato (mantém como estava) */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className={`rounded-2xl shadow-lg p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <BarChart className="w-6 h-6" />
                        </div>
                        Formatos Preferidos (Engajamento)
                    </h3>
                    <div className="space-y-6">
                        {formatAffinity.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-2 font-bold">
                                    <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{item.type}</span>
                                    <span className="text-green-500">{formatNumber(item.avgInteractions)} interações/post</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <div
                                        className="bg-green-500 h-full relative rounded-full"
                                        style={{ width: `${(item.avgInteractions / maxAffinity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {formatAffinity.length === 0 && <p className="text-center text-gray-500 py-8">Sem dados de formato.</p>}
                    </div>
                </div>
            </div>

            {/* SEÇÃO TOP 10 CONTEÚDO (NOVO) */}
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className={`text-xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                            <Star className="w-6 h-6" />
                        </div>
                        Top 10 Conteúdo Favorito (Engajamento)
                    </h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Posts que geraram maior conexão (Likes + Comentários + Salvamentos)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Post</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Engajamento Total</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Likes</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Comentários</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {topContent.map((post, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => handlePostClick(post)}
                                    className={`transition-colors cursor-pointer ${darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-blue-50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            #{idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className={`text-sm font-medium line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`} title={post.descricao}>
                                            {post.descricao || 'Sem descrição'}
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 block">{new Date(post.data).toLocaleDateString('pt-BR')} • {post.tipo}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                            {formatNumber(post.curtidas + post.comentarios + post.salvamentos)}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-4 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatNumber(post.curtidas)}</td>
                                    <td className={`px-4 py-4 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatNumber(post.comentarios)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabela Detalhada (JÁ EXISTENTE) */}
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detalhamento de Posts</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Post</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Tipo</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Data</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500" title="Visualizações"><Eye className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500" title="Curtidas"><Heart className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500" title="Comentários"><MessageCircle className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500" title="Compartilhamentos"><Share2 className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500" title="Salvamentos"><Bookmark className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Link</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {filteredPosts.map((post, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => handlePostClick(post)}
                                    className={`transition-colors cursor-pointer ${darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-blue-50'}`}
                                >
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className={`text-sm font-medium line-clamp-2 mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`} title={post.descricao}>
                                            {post.descricao || 'Sem descrição'}
                                        </div>
                                        {post.duracao && post.duracao > 0 && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> {post.duracao}s
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide ${post.tipo.toLowerCase().includes('reel')
                                            ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {post.tipo.replace('do Instagram', '')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center text-xs text-gray-500">
                                        {new Date(post.data).toLocaleDateString('pt-BR')}
                                        <br />
                                        {new Date(post.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className={`px-4 py-4 text-center font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(post.visualizacoes)}</td>
                                    <td className={`px-4 py-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(post.curtidas)}</td>
                                    <td className={`px-4 py-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(post.comentarios)}</td>
                                    <td className={`px-4 py-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(post.compartilhamentos)}</td>
                                    <td className={`px-4 py-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(post.salvamentos)}</td>
                                    <td className="px-4 py-4 text-center">
                                        {post.link && (
                                            <a
                                                href={post.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className={`inline-flex p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPosts.length === 0 && (
                                <tr><td colSpan={9} className="p-8 text-center text-gray-500">Nenhum post encontrado com os filtros atuais.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InstagramPostDetailModal
                post={selectedPost}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                darkMode={darkMode}
            />
        </div>
    );
};

export default InstagramContent;

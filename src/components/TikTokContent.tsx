import React, { useState } from 'react';
import { TikTokData, TikTokPost } from '../types';
import { Search, Filter, ArrowUpDown, ExternalLink, Play, Heart, MessageCircle, Share2 } from 'lucide-react';

interface TikTokContentProps {
    data: TikTokData;
    darkMode: boolean;
}

const TikTokContent: React.FC<TikTokContentProps> = ({ data, darkMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof TikTokPost>('views');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: keyof TikTokPost) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredPosts = data.posts
        .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });

    const Th = ({ field, label, icon: Icon }: { field: keyof TikTokPost, label: string, icon?: any }) => (
        <th
            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
                <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'opacity-100' : 'opacity-30'}`} />
            </div>
        </th>
    );

    return (
        <div className="space-y-6">
            {/* Controles */}
            <div className={`p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="relative w-full md:w-96">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        placeholder="Buscar vídeos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                            }`}
                    />
                </div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Filter className="w-4 h-4" />
                    <span>{filteredPosts.length} vídeos encontrados</span>
                </div>
            </div>

            {/* Tabela */}
            <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                            <tr>
                                <Th field="title" label="Vídeo" />
                                <Th field="date" label="Data" />
                                <Th field="views" label="Visualizações" icon={Play} />
                                <Th field="likes" label="Curtidas" icon={Heart} />
                                <Th field="comments" label="Comentários" icon={MessageCircle} />
                                <Th field="shares" label="Compartilhamentos" icon={Share2} />
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`font-medium line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {post.title || 'Sem título'}
                                            </span>
                                            {post.link && (
                                                <a
                                                    href={post.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 mt-1 w-fit"
                                                >
                                                    Ver no TikTok <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {new Date(post.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {post.views.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {post.likes.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {post.comments.toLocaleString('pt-BR')}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {post.shares.toLocaleString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TikTokContent;

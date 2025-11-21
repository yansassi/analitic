import { InstagramPost } from '../types';
import { X, Heart, MessageCircle, Share2, Bookmark, Eye, MapPin, Calendar, ExternalLink, Smartphone } from 'lucide-react';

interface InstagramPostDetailModalProps {
  post: InstagramPost | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const InstagramPostDetailModal = ({ post, isOpen, onClose, darkMode }: InstagramPostDetailModalProps) => {
  if (!isOpen || !post) return null;

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', { 
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  // Calcula taxa de engajamento (Interações / Alcance)
  const engajamento = post.alcance > 0 
    ? ((post.curtidas + post.comentarios + post.salvamentos) / post.alcance * 100).toFixed(2) 
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Detalhes da Publicação</h3>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: {post.id}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Descrição e Link */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">
              {post.descricao || "Sem legenda..."}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(post.data)}
              </span>
              {post.link && (
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Ver no Instagram
                </a>
              )}
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatNumber(post.visualizacoes)}</div>
              <div className="text-xs text-gray-500">Visualizações</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatNumber(post.alcance)}</div>
              <div className="text-xs text-gray-500">Alcance</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <span className="block text-2xl mb-2">🎯</span>
              <div className="text-2xl font-bold">{engajamento}%</div>
              <div className="text-xs text-gray-500">Taxa Engajamento</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <Bookmark className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{formatNumber(post.salvamentos)}</div>
              <div className="text-xs text-gray-500">Salvamentos</div>
            </div>
          </div>

          {/* Detalhes de Interação */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Interações Detalhadas
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <Heart className="w-5 h-5 text-red-500 mb-1" />
                <span className="font-bold text-lg">{formatNumber(post.curtidas)}</span>
                <span className="text-xs text-gray-500">Curtidas</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <MessageCircle className="w-5 h-5 text-blue-400 mb-1" />
                <span className="font-bold text-lg">{formatNumber(post.comentarios)}</span>
                <span className="text-xs text-gray-500">Comentários</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <Share2 className="w-5 h-5 text-green-500 mb-1" />
                <span className="font-bold text-lg">{formatNumber(post.compartilhamentos)}</span>
                <span className="text-xs text-gray-500">Compartilhamentos</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t text-center text-xs ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
          Dica: Posts com muitos salvamentos indicam conteúdo de alto valor para sua audiência.
        </div>
      </div>
    </div>
  );
};

export default InstagramPostDetailModal;
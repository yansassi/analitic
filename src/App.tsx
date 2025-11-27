import { useState, useEffect } from 'react';
import ZipReportImporter from './components/ZipReportImporter';
import Overview from './components/Overview';
import VideoAnalysis from './components/VideoAnalysis';
import AudienceAnalysis from './components/AudienceAnalysis';
import GeographicAnalysis from './components/GeographicAnalysis';
import TrafficAnalysis from './components/TrafficAnalysis';
import PerformanceComparison from './components/PerformanceComparison';
import TrendAnalysis from './components/TrendAnalysis';
import AIInsights from './components/AIInsights';
import DeviceTypeAnalysis from './components/DeviceTypeAnalysis';
// Componentes do Instagram
import InstagramOverview from './components/InstagramOverview';
import InstagramAudience from './components/InstagramAudience';
import InstagramContent from './components/InstagramContent';
import InstagramViews from './components/InstagramViews';
// Componentes do TikTok
import TikTokOverview from './components/TikTokOverview';
import TikTokContent from './components/TikTokContent';
import TikTokAudience from './components/TikTokAudience';
import TikTokViews from './components/TikTokViews';
// Componentes de Views
import YouTubeViews from './components/YouTubeViews';
// Componente de Comparação
import PlatformComparison from './components/PlatformComparison';

import { ProcessedData, InstagramData, TikTokData } from './types';
import { BarChart3, Users, Globe, TrendingUp, Zap, Target, Brain, Download, LogOut, Upload, Monitor, LayoutDashboard, Video, Search, AlertTriangle, Eye } from 'lucide-react';
import AuthPage from './components/AuthPage';
import { supabase } from './lib/supabase';
import { getUserAnalyses, getAnalysisById, saveYoutubeAnalysis } from './services/youtubeDataService';
import { getUserInstagramAnalyses, getInstagramAnalysisById, saveInstagramAnalysis } from './services/instagramDataService';
import { getUserTikTokAnalyses, getTikTokAnalysisById, saveTikTokAnalysis } from './services/tiktokDataService';
import YouTubeIcon from './components/icons/YouTubeIcon';
import InstagramIcon from './components/icons/InstagramIcon';
import TikTokIcon from './components/icons/TikTokIcon';
import { DateRange, filterInstagramData, filterTikTokData, filterYoutubeData } from './utils/dateFilter';
import DateRangeSelector from './components/DateRangeSelector';

type SocialNetwork = 'youtube' | 'instagram' | 'tiktok' | 'comparison';

function App() {
  const [activeSocialNetwork, setActiveSocialNetwork] = useState<SocialNetwork>('youtube');

  // Estados de dados
  const [youtubeData, setYoutubeData] = useState<ProcessedData | null>(null);
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [tiktokData, setTiktokData] = useState<TikTokData | null>(null);

  // Abas ativas
  const [activeYoutubeTab, setActiveYoutubeTab] = useState<string>('overview');
  const [activeInstagramTab, setActiveInstagramTab] = useState<string>('overview');
  const [activeTikTokTab, setActiveTikTokTab] = useState<string>('overview');

  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [instagramSearchTerm, setInstagramSearchTerm] = useState('');
  const [youtubeSearchTerm, setYoutubeSearchTerm] = useState('');
  const [tiktokSearchTerm, setTiktokSearchTerm] = useState('');
  const [comparisonSearchTerm, setComparisonSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Lógica de filtragem do Instagram
  const getFilteredInstagramData = (overrideTerm?: string) => {
    if (!instagramData) return null;

    // 1. Filtro de Data
    let filtered = filterInstagramData(instagramData, dateRange);

    // 2. Filtro de Busca
    const term = (overrideTerm !== undefined ? overrideTerm : instagramSearchTerm).trim().toLowerCase();
    if (term) {
      const filteredPosts = filtered.posts.filter(post =>
        (post.descricao && post.descricao.toLowerCase().includes(term)) ||
        (post.tipo && post.tipo.toLowerCase().includes(term))
      );
      filtered = { ...filtered, posts: filteredPosts };
    }

    return filtered;
  };

  // Lógica de filtragem do YouTube
  const getFilteredYoutubeData = (overrideTerm?: string) => {
    if (!youtubeData) return null;

    // 1. Filtro de Data
    let filtered = filterYoutubeData(youtubeData, dateRange);

    // 2. Filtro de Busca
    const term = (overrideTerm !== undefined ? overrideTerm : youtubeSearchTerm).trim().toLowerCase();
    if (term) {
      const filteredVideos = filtered.videos.filter(video =>
        video.titulo && video.titulo.toLowerCase().includes(term)
      );
      filtered = { ...filtered, videos: filteredVideos };
    }

    return filtered;
  };

  // Lógica de filtragem do TikTok
  const getFilteredTikTokData = (overrideTerm?: string) => {
    if (!tiktokData) return null;
    
    // 1. Filtro de Data
    let filtered = filterTikTokData(tiktokData, dateRange);

    // 2. Filtro de Busca
    const term = (overrideTerm !== undefined ? overrideTerm : tiktokSearchTerm).trim().toLowerCase();
    if (term) {
      const filteredPosts = filtered.posts.filter(post =>
        post.title && post.title.toLowerCase().includes(term)
      );
      filtered = { ...filtered, posts: filteredPosts };
    }

    return filtered;
  };

  // Helper para pegar os dados ativos para exportação
  const currentData = activeSocialNetwork === 'youtube' ? youtubeData : activeSocialNetwork === 'instagram' ? instagramData : tiktokData;

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      (async () => { await checkAuth(); })();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
      if (session) await loadLatestAnalysis();
    } catch (error) {
      console.error('Erro ao verificar autenticacao:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestAnalysis = async () => {
    try {
      setLoadingData(true);

      // Carregar YouTube
      const youtubeAnalyses = await getUserAnalyses();
      if (youtubeAnalyses.length > 0) {
        const latestYoutube = youtubeAnalyses[0];
        const youtubeData = await getAnalysisById(latestYoutube.id);
        if (youtubeData) setYoutubeData(youtubeData);
      }

      // Carregar Instagram
      const instagramAnalyses = await getUserInstagramAnalyses();
      if (instagramAnalyses.length > 0) {
        const latestInstagram = instagramAnalyses[0];
        const instagramData = await getInstagramAnalysisById(latestInstagram.id);
        if (instagramData) setInstagramData(instagramData);
      }

      // Carregar TikTok
      const tiktokAnalyses = await getUserTikTokAnalyses();
      if (tiktokAnalyses.length > 0) {
        const latestTikTok = tiktokAnalyses[0];
        const tiktokData = await getTikTokAnalysisById(latestTikTok.id);
        if (tiktokData) setTiktokData(tiktokData);
      }

    } catch (error) {
      console.error('Erro ao carregar analises:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      setYoutubeData(null);
      setInstagramData(null);
      setTiktokData(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleDataProcessed = async (processedData: any) => {
    const timestamp = new Date().toLocaleString();

    try {
      if (activeSocialNetwork === 'youtube') {
        setYoutubeData(processedData);
        if (isAuthenticated) {
          await saveYoutubeAnalysis(processedData, `Importação YouTube ${timestamp}`);
        }
      } else if (activeSocialNetwork === 'instagram') {
        setInstagramData(processedData);
        if (isAuthenticated) {
          await saveInstagramAnalysis(processedData, `Importação Instagram ${timestamp}`);
        }
      } else {
        setTiktokData(processedData);
        if (isAuthenticated) {
          await saveTikTokAnalysis(processedData, `Importação TikTok ${timestamp}`);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar dados automaticamente:", error);
      // Opcional: Mostrar toast de erro
    }

    setShowImportModal(false);
  };

  // Definição das Abas do YouTube
  const youtubeTabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3, color: 'blue' },
    { id: 'videos', name: 'Análise de Vídeos', icon: Target, color: 'purple' },
    { id: 'views', name: 'Views', icon: Eye, color: 'red' },
    { id: 'audience', name: 'Público', icon: Users, color: 'green' },
    { id: 'geographic', name: 'Geografia', icon: Globe, color: 'orange' },
    { id: 'traffic', name: 'Tráfego', icon: Zap, color: 'yellow' },
    { id: 'devices', name: 'Dispositivos', icon: Monitor, color: 'blue' },
    { id: 'comparison', name: 'Comparações', icon: TrendingUp, color: 'pink' },
    { id: 'trends', name: 'Tendências', icon: TrendingUp, color: 'indigo' },
    { id: 'insights', name: 'Insights IA', icon: Brain, color: 'red' },
  ];

  // Definição das Abas do Instagram (NOVO)
  const instagramTabs = [
    { id: 'overview', name: 'Visão Geral', icon: LayoutDashboard, color: 'pink' },
    { id: 'content', name: 'Conteúdo', icon: Video, color: 'orange' },
    { id: 'views', name: 'Views', icon: Eye, color: 'purple' },
    { id: 'audience', name: 'Público', icon: Users, color: 'purple' },
  ];

  // Definição das Abas do TikTok
  const tiktokTabs = [
    { id: 'overview', name: 'Visão Geral', icon: LayoutDashboard, color: 'black' },
    { id: 'content', name: 'Conteúdo', icon: Video, color: 'blue' },
    { id: 'views', name: 'Views', icon: Eye, color: 'red' },
    { id: 'audience', name: 'Público', icon: Users, color: 'pink' },
  ];

  const exportReport = () => {
    if (!currentData) return;
    const report = {
      generated_at: new Date().toISOString(),
      network: activeSocialNetwork,
      data: currentData
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSocialNetwork}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => checkAuth()} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Social Media Analytics Pro
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard avançado com IA e análises em tempo real
              </p>
            </div>
            <div className="flex gap-3">
              {userEmail && (
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 shadow-md'
                  }`}>
                  <span className="text-sm">{userEmail}</span>
                </div>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${darkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
              >
                {darkMode ? '☀️ Claro' : '🌙 Escuro'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-all shadow-lg ${activeSocialNetwork === 'youtube'
                  ? 'bg-red-600 hover:bg-red-700'
                  : activeSocialNetwork === 'instagram'
                    ? 'bg-pink-600 hover:bg-pink-700'
                    : activeSocialNetwork === 'tiktok'
                      ? 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                <Upload className="w-4 h-4" />
                Importar {
                  activeSocialNetwork === 'youtube' ? 'YouTube' :
                    activeSocialNetwork === 'instagram' ? 'Instagram' :
                      activeSocialNetwork === 'tiktok' ? 'TikTok' :
                        'Dados'
                }
              </button>
              {currentData && (
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {loadingData && (
          <div className={`rounded-xl p-6 mb-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-3"></div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando análise...</p>
          </div>
        )}

        {/* Seletor de Rede Social e Filtro de Data */}
        <div className={`relative rounded-xl overflow-hidden mb-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700 pr-48 md:pr-0 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveSocialNetwork('youtube')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${activeSocialNetwork === 'youtube'
                ? `border-b-4 border-red-600 ${darkMode ? 'text-white bg-gray-700' : 'text-red-600 bg-red-50'}`
                : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <YouTubeIcon className="w-6 h-6" />
              YouTube
            </button>
            <button
              onClick={() => setActiveSocialNetwork('instagram')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${activeSocialNetwork === 'instagram'
                ? `border-b-4 border-pink-600 ${darkMode ? 'text-white bg-gray-700' : 'text-pink-600 bg-pink-50'}`
                : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <InstagramIcon className="w-6 h-6" />
              Instagram
            </button>
            <button
              onClick={() => setActiveSocialNetwork('tiktok')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${activeSocialNetwork === 'tiktok'
                ? `border-b-4 border-black dark:border-white ${darkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-50'}`
                : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <TikTokIcon className="w-6 h-6" />
              TikTok
            </button>
            {/* Botão de Comparação - só aparece quando há 2+ plataformas */}
            {[youtubeData, instagramData, tiktokData].filter(d => d !== null).length >= 2 && (
              <button
                onClick={() => setActiveSocialNetwork('comparison')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${activeSocialNetwork === 'comparison'
                  ? `border-b-4 border-blue-600 ${darkMode ? 'text-white bg-gray-700' : 'text-blue-600 bg-blue-50'}`
                  : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <TrendingUp className="w-6 h-6" />
                Comparação
              </button>
            )}
          </div>

          {/* Date Range Selector - Posicionado no canto direito da barra de abas */}
          <div className="absolute top-0 right-0 h-full flex items-center px-4">
            <DateRangeSelector
              selectedRange={dateRange}
              onRangeChange={setDateRange}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* CONTEÚDO YOUTUBE */}
        {activeSocialNetwork === 'youtube' && youtubeData && (
          <>
            {/* Header do YouTube com Busca */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
              <div className={`rounded-xl overflow-hidden shadow-lg flex-1 w-full md:w-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex overflow-x-auto hide-scrollbar">
                  {youtubeTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveYoutubeTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${activeYoutubeTab === tab.id
                          ? `border-b-4 border-${tab.color}-600 ${darkMode ? 'text-white' : `text-${tab.color}-600`}`
                          : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barra de Busca Global YouTube */}
              <div className={`relative w-full md:w-64 group`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${youtubeSearchTerm ? 'text-red-500' : 'text-gray-400'
                  }`}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por título..."
                  value={youtubeSearchTerm}
                  onChange={(e) => setYoutubeSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all font-medium ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500 placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 focus:shadow-md placeholder-gray-400'
                    }`}
                />
                {youtubeSearchTerm && (
                  <div className={`absolute -bottom-6 right-0 text-xs font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    Filtrando {getFilteredYoutubeData()?.videos.length} vídeos
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeYoutubeTab === 'overview' && <Overview data={getFilteredYoutubeData()!} darkMode={darkMode} />}
              {activeYoutubeTab === 'videos' && <VideoAnalysis data={getFilteredYoutubeData()!} darkMode={darkMode} />}
              {activeYoutubeTab === 'views' && <YouTubeViews data={getFilteredYoutubeData()!} darkMode={darkMode} />}

              {/* Abas com aviso de filtro não aplicável */}
              {['audience', 'geographic', 'traffic', 'devices', 'comparison', 'trends', 'insights'].includes(activeYoutubeTab) && (
                <div className="relative">
                  {youtubeSearchTerm && (
                    <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-fade-in`}>
                      <div className={`p-6 rounded-xl max-w-md text-center shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="mb-4 p-3 bg-yellow-100 text-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtro não aplicável a esta seção</h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Os dados desta seção (Geografia, Público, etc.) são agregados gerais do canal e não podem ser filtrados por vídeos específicos ("{youtubeSearchTerm}").
                        </p>
                        <button
                          onClick={() => setYoutubeSearchTerm('')}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Limpar Filtro
                        </button>
                      </div>
                    </div>
                  )}
                  {activeYoutubeTab === 'audience' && <AudienceAnalysis data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'geographic' && <GeographicAnalysis data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'traffic' && <TrafficAnalysis data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'devices' && <DeviceTypeAnalysis data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'comparison' && <PerformanceComparison data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'trends' && <TrendAnalysis data={youtubeData} darkMode={darkMode} />}
                  {activeYoutubeTab === 'insights' && <AIInsights data={youtubeData} darkMode={darkMode} />}
                </div>
              )}
            </div>
          </>
        )}

        {/* CONTEÚDO INSTAGRAM */}
        {activeSocialNetwork === 'instagram' && instagramData && (
          <>
            {/* Header do Instagram com Busca */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
              {/* Nova Barra de Abas para Instagram */}
              <div className={`rounded-xl overflow-hidden shadow-lg flex-1 w-full md:w-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex overflow-x-auto hide-scrollbar">
                  {instagramTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveInstagramTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${activeInstagramTab === tab.id
                          ? `border-b-4 border-${tab.color}-600 ${darkMode ? 'text-white' : `text-${tab.color}-600`}`
                          : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barra de Busca Global */}
              <div className={`relative w-full md:w-64 group`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${instagramSearchTerm ? 'text-pink-500' : 'text-gray-400'
                  }`}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por palavra ou #hashtag..."
                  value={instagramSearchTerm}
                  onChange={(e) => setInstagramSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all font-medium ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500 placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500 focus:shadow-md placeholder-gray-400'
                    }`}
                />
                {instagramSearchTerm && (
                  <div className={`absolute -bottom-6 right-0 text-xs font-bold ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                    Filtrando {getFilteredInstagramData()?.posts.length} posts
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeInstagramTab === 'overview' && <InstagramOverview data={getFilteredInstagramData()!} darkMode={darkMode} />}
              {activeInstagramTab === 'content' && <InstagramContent data={getFilteredInstagramData()!} darkMode={darkMode} />}
              {activeInstagramTab === 'views' && <InstagramViews data={getFilteredInstagramData()!} darkMode={darkMode} />}
              {activeInstagramTab === 'audience' && (
                <div className="relative">
                  {instagramSearchTerm && (
                    <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-fade-in`}>
                      <div className={`p-6 rounded-xl max-w-md text-center shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="mb-4 p-3 bg-yellow-100 text-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtro não aplicável ao Público</h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Os dados demográficos (cidades, países, idade) são gerais da conta e não podem ser filtrados por posts específicos ("{instagramSearchTerm}").
                        </p>
                        <button
                          onClick={() => setInstagramSearchTerm('')}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Limpar Filtro
                        </button>
                      </div>
                    </div>
                  )}
                  <InstagramAudience data={instagramData} darkMode={darkMode} />
                </div>
              )}
            </div>
          </>
        )}

        {/* CONTEÚDO TIKTOK */}
        {activeSocialNetwork === 'tiktok' && tiktokData && (
          <>
            {/* Header do TikTok */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
              <div className={`rounded-xl overflow-hidden shadow-lg flex-1 w-full md:w-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex overflow-x-auto hide-scrollbar">
                  {tiktokTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTikTokTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${activeTikTokTab === tab.id
                          ? `border-b-4 border-black dark:border-white ${darkMode ? 'text-white' : 'text-black'}`
                          : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barra de Busca Global TikTok */}
              <div className={`relative w-full md:w-64 group`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${tiktokSearchTerm ? 'text-black dark:text-white' : 'text-gray-400'
                  }`}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por título..."
                  value={tiktokSearchTerm}
                  onChange={(e) => setTiktokSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all font-medium ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-black focus:shadow-md placeholder-gray-400'
                    }`}
                />
                {tiktokSearchTerm && (
                  <div className={`absolute -bottom-6 right-0 text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Filtrando {getFilteredTikTokData()?.posts.length} posts
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeTikTokTab === 'overview' && <TikTokOverview data={getFilteredTikTokData()!} darkMode={darkMode} />}
              {activeTikTokTab === 'content' && <TikTokContent data={getFilteredTikTokData()!} darkMode={darkMode} />}
              {activeTikTokTab === 'views' && <TikTokViews data={getFilteredTikTokData()!} darkMode={darkMode} />}
              
              {/* Abas com aviso de filtro não aplicável */}
              {activeTikTokTab === 'audience' && (
                <div className="relative">
                  {tiktokSearchTerm && (
                    <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-fade-in`}>
                      <div className={`p-6 rounded-xl max-w-md text-center shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="mb-4 p-3 bg-yellow-100 text-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtro não aplicável ao Público</h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Os dados demográficos são gerais da conta e não podem ser filtrados por posts específicos ("{tiktokSearchTerm}").
                        </p>
                        <button
                          onClick={() => setTiktokSearchTerm('')}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm transition-colors"
                        >
                          Limpar Filtro
                        </button>
                      </div>
                    </div>
                  )}
                  <TikTokAudience data={getFilteredTikTokData()!} darkMode={darkMode} />
                </div>
              )}
            </div>
          </>
        )}

        {/* CONTEÚDO DE COMPARAÇÃO */}
        {activeSocialNetwork === 'comparison' && (
          <>
             {/* Header da Comparação com Busca */}
             <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4 mb-6">
              {/* Barra de Busca Global Comparação */}
              <div className={`relative w-full md:w-64 group`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${comparisonSearchTerm ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar em todas as redes..."
                  value={comparisonSearchTerm}
                  onChange={(e) => setComparisonSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all font-medium ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:shadow-md placeholder-gray-400'
                    }`}
                />
                {comparisonSearchTerm && (
                  <div className={`absolute -bottom-6 right-0 text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Filtrando conteúdo em todas as redes
                  </div>
                )}
              </div>
            </div>

            <PlatformComparison
              youtubeData={getFilteredYoutubeData(comparisonSearchTerm)}
              instagramData={getFilteredInstagramData(comparisonSearchTerm)}
              tiktokData={getFilteredTikTokData(comparisonSearchTerm)}
              darkMode={darkMode}
            />
          </>
        )}

        {/* Estado Vazio (Sem dados) */}
        {((activeSocialNetwork === 'youtube' && !youtubeData) || (activeSocialNetwork === 'instagram' && !instagramData) || (activeSocialNetwork === 'tiktok' && !tiktokData)) && (
          <div className={`text-center py-20 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-6xl mb-4">
              {activeSocialNetwork === 'youtube' ? '📊' : activeSocialNetwork === 'instagram' ? '📸' : '🎵'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeSocialNetwork === 'youtube' ? 'YouTube Analytics' : activeSocialNetwork === 'instagram' ? 'Instagram Analytics' : 'TikTok Analytics'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Faça upload do arquivo ZIP exportado do {activeSocialNetwork === 'youtube' ? 'YouTube Studio' : activeSocialNetwork === 'instagram' ? 'Meta Business Suite/Instagram' : 'TikTok Analytics'}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowImportModal(true)}
                className={`px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${activeSocialNetwork === 'youtube' ? 'bg-red-600 hover:bg-red-700' :
                  activeSocialNetwork === 'instagram' ? 'bg-pink-600 hover:bg-pink-700' :
                    'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                  }`}
              >
                <Upload className="w-5 h-5" />
                Importar Dados
              </button>
            </div>
          </div>
        )}

      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className={`max-w-2xl w-full rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <ZipReportImporter
              onDataProcessed={handleDataProcessed}
              darkMode={darkMode}
              socialNetwork={activeSocialNetwork === 'comparison' ? 'youtube' : activeSocialNetwork}
            />
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default App;
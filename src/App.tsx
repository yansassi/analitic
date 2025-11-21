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

import { ProcessedData, InstagramData } from './types';
import { BarChart3, Users, Globe, TrendingUp, Zap, Target, Brain, Download, LogOut, Upload, Monitor, LayoutDashboard } from 'lucide-react';
import AuthPage from './components/AuthPage';
import { supabase } from './lib/supabase';
import { getUserAnalyses, getAnalysisById } from './services/youtubeDataService';
import YouTubeIcon from './components/icons/YouTubeIcon';
import InstagramIcon from './components/icons/InstagramIcon';

type SocialNetwork = 'youtube' | 'instagram';

function App() {
  const [activeSocialNetwork, setActiveSocialNetwork] = useState<SocialNetwork>('youtube');
  
  // Estados de dados
  const [youtubeData, setYoutubeData] = useState<ProcessedData | null>(null);
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  
  // Abas ativas
  const [activeYoutubeTab, setActiveYoutubeTab] = useState<string>('overview');
  const [activeInstagramTab, setActiveInstagramTab] = useState<string>('overview');

  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Helper para pegar os dados ativos para exportação
  const currentData = activeSocialNetwork === 'youtube' ? youtubeData : instagramData;

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
      const analyses = await getUserAnalyses();
      if (analyses.length > 0) {
        const latestAnalysis = analyses[0];
        const analysisData = await getAnalysisById(latestAnalysis.id);
        if (analysisData) setYoutubeData(analysisData);
      }
    } catch (error) {
      console.error('Erro ao carregar analise:', error);
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
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleDataProcessed = (processedData: any) => {
    if (activeSocialNetwork === 'youtube') {
      setYoutubeData(processedData);
    } else {
      setInstagramData(processedData);
    }
    setShowImportModal(false);
  };

  // Definição das Abas do YouTube
  const youtubeTabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3, color: 'blue' },
    { id: 'videos', name: 'Análise de Vídeos', icon: Target, color: 'purple' },
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
    { id: 'audience', name: 'Público', icon: Users, color: 'purple' },
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
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
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
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 shadow-md'
                }`}>
                  <span className="text-sm">{userEmail}</span>
                </div>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {darkMode ? '☀️ Claro' : '🌙 Escuro'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-all shadow-lg ${
                   activeSocialNetwork === 'youtube' 
                     ? 'bg-red-600 hover:bg-red-700' 
                     : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Importar {activeSocialNetwork === 'youtube' ? 'YouTube' : 'Instagram'}
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

        {/* Seletor de Rede Social */}
        <div className={`rounded-xl overflow-hidden mb-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSocialNetwork('youtube')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeSocialNetwork === 'youtube'
                  ? `border-b-4 border-red-600 ${darkMode ? 'text-white bg-gray-700' : 'text-red-600 bg-red-50'}`
                  : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <YouTubeIcon className="w-6 h-6" />
              YouTube
            </button>
            <button
              onClick={() => setActiveSocialNetwork('instagram')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeSocialNetwork === 'instagram'
                  ? `border-b-4 border-pink-600 ${darkMode ? 'text-white bg-gray-700' : 'text-pink-600 bg-pink-50'}`
                  : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <InstagramIcon className="w-6 h-6" />
              Instagram
            </button>
          </div>
        </div>

        {/* CONTEÚDO YOUTUBE */}
        {activeSocialNetwork === 'youtube' && youtubeData && (
          <>
            <div className={`rounded-xl overflow-hidden mb-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex overflow-x-auto hide-scrollbar">
                {youtubeTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveYoutubeTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                        activeYoutubeTab === tab.id
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

            <div className="space-y-6">
              {activeYoutubeTab === 'overview' && <Overview data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'videos' && <VideoAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'audience' && <AudienceAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'geographic' && <GeographicAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'traffic' && <TrafficAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'devices' && <DeviceTypeAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'comparison' && <PerformanceComparison data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'trends' && <TrendAnalysis data={youtubeData} darkMode={darkMode} />}
              {activeYoutubeTab === 'insights' && <AIInsights data={youtubeData} darkMode={darkMode} />}
            </div>
          </>
        )}

        {/* CONTEÚDO INSTAGRAM */}
        {activeSocialNetwork === 'instagram' && instagramData && (
          <>
             {/* Nova Barra de Abas para Instagram */}
             <div className={`rounded-xl overflow-hidden mb-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex overflow-x-auto hide-scrollbar">
                {instagramTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveInstagramTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                        activeInstagramTab === tab.id
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

            <div className="space-y-6">
               {activeInstagramTab === 'overview' && <InstagramOverview data={instagramData} darkMode={darkMode} />}
               {activeInstagramTab === 'audience' && <InstagramAudience data={instagramData} darkMode={darkMode} />}
            </div>
          </>
        )}

        {/* Estado Vazio (Sem dados) */}
        {((activeSocialNetwork === 'youtube' && !youtubeData) || (activeSocialNetwork === 'instagram' && !instagramData)) && (
          <div className={`text-center py-20 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-6xl mb-4">{activeSocialNetwork === 'youtube' ? '📊' : '📸'}</div>
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeSocialNetwork === 'youtube' ? 'YouTube Analytics' : 'Instagram Analytics'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Faça upload do arquivo ZIP exportado do {activeSocialNetwork === 'youtube' ? 'YouTube Studio' : 'Meta Business Suite/Instagram'}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowImportModal(true)}
                className={`px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                  activeSocialNetwork === 'youtube' ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'
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
              socialNetwork={activeSocialNetwork}
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
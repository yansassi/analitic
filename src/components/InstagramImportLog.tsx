import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, RefreshCw, Trash2 } from 'lucide-react';

interface AudienceLog {
    timestamp: string;
    fileName: string;
    sectionsFound: {
        age: boolean;
        cities: boolean;
        countries: boolean;
        pages: boolean;
    };
    itemCounts: {
        age: number;
        cities: number;
        countries: number;
        pages: number;
    };
    errors: string[];
    filePreview: string;
}

interface FullImportLog {
    timestamp: string;
    processedFiles: string[];
    audienceDetails: AudienceLog;
}

interface InstagramImportLogProps {
    darkMode: boolean;
}

const InstagramImportLog = ({ darkMode }: InstagramImportLogProps) => {
    const [log, setLog] = useState<FullImportLog | null>(null);
    const [showRaw, setShowRaw] = useState(false);

    const loadLog = () => {
        try {
            const savedLog = localStorage.getItem('instagram_import_log');
            if (savedLog) {
                const parsed = JSON.parse(savedLog);
                // Migração simples se for formato antigo
                if (!parsed.processedFiles && parsed.sectionsFound) {
                    setLog({
                        timestamp: parsed.timestamp,
                        processedFiles: ['Público (Legacy)'],
                        audienceDetails: parsed
                    });
                } else {
                    setLog(parsed);
                }
            }
        } catch (e) {
            console.error("Erro ao ler log", e);
        }
    };

    useEffect(() => {
        loadLog();
        window.addEventListener('instagram_import_complete', loadLog);
        return () => window.removeEventListener('instagram_import_complete', loadLog);
    }, []);

    const clearLog = () => {
        localStorage.removeItem('instagram_import_log');
        setLog(null);
    };

    if (!log) return null;

    const details = log.audienceDetails;

    const StatusItem = ({ label, found, count }: { label: string, found: boolean, count: number }) => (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-3">
                {found ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${found ? 'text-green-600' : 'text-gray-400'}`}>
                    {count} itens
                </span>
            </div>
        </div>
    );

    return (
        <div className={`mt-8 p-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FileText className="w-5 h-5 text-blue-500" />
                    Relatório de Importação
                </h3>
                <div className="flex gap-2">
                    <button onClick={loadLog} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Atualizar">
                        <RefreshCw className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={clearLog} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Limpar Log">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>

            {/* Seção 1: Arquivos Processados */}
            <div className="mb-6">
                <h4 className={`text-sm font-bold uppercase mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Arquivos Identificados</h4>
                <div className="flex flex-wrap gap-2">
                    {log.processedFiles.map((file, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1
                            ${darkMode ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            <CheckCircle className="w-3 h-3" /> {file}
                        </span>
                    ))}
                    {log.processedFiles.length === 0 && (
                        <span className="text-sm text-gray-500 italic">Nenhum arquivo reconhecido.</span>
                    )}
                </div>
            </div>

            {/* Seção 2: Detalhes do Público */}
            <div className="mb-4">
                <h4 className={`text-sm font-bold uppercase mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detalhes de Público (Audience)</h4>
                <div className="space-y-2">
                    <StatusItem label="Faixa Etária e Gênero" found={details.sectionsFound.age} count={details.itemCounts.age} />
                    <StatusItem label="Principais Cidades" found={details.sectionsFound.cities} count={details.itemCounts.cities} />
                    <StatusItem label="Principais Países" found={details.sectionsFound.countries} count={details.itemCounts.countries} />
                    <StatusItem label="Páginas (Interesses)" found={details.sectionsFound.pages} count={details.itemCounts.pages} />
                </div>
            </div>

            {details.errors.length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Erros Detectados
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
                        {details.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 underline"
                >
                    {showRaw ? 'Ocultar Detalhes do Arquivo' : 'Ver Detalhes do Arquivo (Debug)'}
                </button>

                {showRaw && (
                    <div className="mt-3">
                        <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Primeiros 500 caracteres do arquivo de público:</p>
                        <pre className={`p-3 rounded-lg text-xs overflow-x-auto font-mono ${darkMode ? 'bg-black text-green-400' : 'bg-gray-900 text-green-400'}`}>
                            {details.filePreview || "Sem preview disponível"}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstagramImportLog;

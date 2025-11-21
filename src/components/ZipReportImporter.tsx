import { useState } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { ProcessedData, InstagramData, InstagramMetric, InstagramPost, InstagramDemographic, InstagramPage } from '../types';
import { Upload, CheckCircle, AlertCircle, FileSearch } from 'lucide-react';

interface ZipReportImporterProps {
  onDataProcessed: (data: ProcessedData | InstagramData) => void;
  darkMode: boolean;
  socialNetwork: 'youtube' | 'instagram';
}

const ZipReportImporter = ({ onDataProcessed, darkMode, socialNetwork }: ZipReportImporterProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- FUNÇÕES UTILITÁRIAS ---

  const cleanInstagramCSV = (csvText: string): string => {
    const lines = csvText.split(/\r?\n/);
    // Remove linha "sep=," se existir na primeira linha
    if (lines.length > 0 && lines[0].trim().startsWith('sep=')) {
      lines.shift();
    }
    return lines.join('\n');
  };

  const parseCSV = (csvText: string) => {
    const textToParse = cleanInstagramCSV(csvText);
    const result = Papa.parse(textToParse, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim().replace(/^"|"$/g, '')
    });
    return result.data;
  };

  const parseLine = (line: string) => {
    const res = Papa.parse(line, { 
      header: false, 
      skipEmptyLines: true, 
      delimiter: ',', // Força vírgula pois sabemos que é o padrão do arquivo
      dynamicTyping: true 
    });
    return res.data[0] as any[];
  };

  const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  // --- PROCESSADORES INSTAGRAM ---
  
  const processInstagramMetric = (data: any[]): InstagramMetric[] => {
    return data
      .filter((row: any) => row['Data'] && (row['Primary'] !== undefined || row['Valor'] !== undefined))
      .map((row: any) => ({
        data: row['Data'],
        valor: parseInt(row['Primary'] || row['Valor'] || '0'),
      }));
  };

  const processInstagramPosts = (data: any[]): InstagramPost[] => {
    return data
      .filter((row: any) => row['Identificação do post'] || row['Link permanente'])
      .map((row: any) => ({
        id: row['Identificação do post'] || '',
        data: row['Horário de publicação'] || row['Data'] || '',
        descricao: row['Descrição'] || '',
        tipo: row['Tipo de post'] || 'Desconhecido',
        link: row['Link permanente'] || '',
        visualizacoes: parseInt(row['Visualizações'] || '0'),
        alcance: parseInt(row['Alcance'] || '0'),
        curtidas: parseInt(row['Curtidas'] || '0'),
        comentarios: parseInt(row['Comentários'] || '0'),
        compartilhamentos: parseInt(row['Compartilhamentos'] || '0'),
        salvamentos: parseInt(row['Salvamentos'] || '0'),
      }));
  };

  const processInstagramAudience = (csvText: string) => {
    console.log("Iniciando processamento de público (Modo Robusto)...");
    
    const result = {
      idadeGenero: [] as InstagramDemographic[],
      cidades: [] as InstagramDemographic[],
      paises: [] as InstagramDemographic[],
      paginas: [] as InstagramPage[]
    };

    try {
      // Limpeza básica
      const cleanText = csvText.replace(/sep=,(\r?\n|\r)/g, '').trim();
      const lines = cleanText.split(/\r?\n/);
      
      // Estados da leitura
      let currentSection: 'NONE' | 'AGE' | 'CITIES' | 'COUNTRIES' | 'PAGES' = 'NONE';
      let bufferHeader: string[] | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Normaliza para minúsculo para facilitar comparação
        const lowerLine = line.toLowerCase();

        if (!line) continue; // Pula linhas vazias

        // 1. Detecção de Seção (Usando includes simples para evitar problemas de acentuação)
        // "Faixa etária e gênero" -> detecta "faixa"
        if (lowerLine.includes('faixa') || lowerLine.includes('age range')) {
          console.log("Seção detectada: Faixa Etária");
          currentSection = 'AGE';
          continue; 
        } 
        // "Principais cidades" -> detecta "cidades"
        else if (lowerLine.includes('cidades') || lowerLine.includes('cities')) {
           console.log("Seção detectada: Cidades");
           currentSection = 'CITIES';
           bufferHeader = null;
           continue;
        } 
        // "Principais países" -> detecta "países" ou "paises" ou "countries"
        else if (lowerLine.includes('pais') || lowerLine.includes('país') || lowerLine.includes('countries')) {
           console.log("Seção detectada: Países");
           currentSection = 'COUNTRIES';
           bufferHeader = null;
           continue;
        } 
        // "Principais Páginas" -> detecta "paginas" ou "páginas" ou "pages"
        else if (lowerLine.includes('paginas') || lowerLine.includes('páginas') || lowerLine.includes('pages')) {
           console.log("Seção detectada: Páginas");
           currentSection = 'PAGES';
           bufferHeader = null;
           continue;
        }

        // 2. Processamento baseado na seção atual
        if (currentSection === 'AGE') {
           // Ignora cabeçalho interno "Mulheres, Homens"
           if (lowerLine.includes('mulheres') || lowerLine.includes('homens') || lowerLine.includes('women')) continue;
           
           const cols = parseLine(line);
           if (cols && cols.length >= 3) {
             const cat = String(cols[0]);
             // Verifica se a primeira coluna parece uma faixa etária (tem número e traço ou mais)
             if (cat && (cat.match(/\d/) || cat.includes('+'))) {
                const fem = typeof cols[1] === 'string' ? parseFloat(cols[1].replace(',', '.')) : (cols[1] || 0);
                const masc = typeof cols[2] === 'string' ? parseFloat(cols[2].replace(',', '.')) : (cols[2] || 0);
                result.idadeGenero.push({
                  categoria: cat,
                  valorMulheres: fem,
                  valorHomens: masc,
                  porcentagem: fem + masc
                });
             }
           }
        } 
        
        // Lógica genérica para blocos Horizontais (Cidades, Países, Páginas)
        else if (['CITIES', 'COUNTRIES', 'PAGES'].includes(currentSection)) {
           const cols = parseLine(line);
           
           if (!bufferHeader) {
             // Se não temos header, assumimos que esta linha contém os NOMES (ex: São Paulo, Rio...)
             // Filtramos para garantir que tem strings válidas
             if (cols && cols.length > 0 && cols.some(c => typeof c === 'string')) {
               bufferHeader = cols.map(String);
             }
           } else {
             // Se já temos header, esta linha contém os VALORES (ex: 8.1, 4.47...)
             if (cols && cols.length > 0) {
                cols.forEach((val, idx) => {
                  const name = bufferHeader?.[idx];
                  if (name) {
                    const numVal = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : (val || 0);
                    
                    if (currentSection === 'CITIES') {
                      result.cidades.push({ categoria: name, porcentagem: numVal });
                    } else if (currentSection === 'COUNTRIES') {
                      result.paises.push({ categoria: name, porcentagem: numVal });
                    } else if (currentSection === 'PAGES') {
                      result.paginas.push({ nome: name, porcentagem: numVal });
                    }
                  }
                });
                // Reseta após ler a linha de valores
                bufferHeader = null; 
             }
           }
        }
      }

    } catch (e) {
      console.error("Erro fatal no parser de público:", e);
    }
    
    console.log("Resultado final do parser:", result);
    return result;
  };

  // --- PROCESSADORES YOUTUBE (MANTIDO) ---
  const parseYT = (text: string) => Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true }).data;

  const processVideoData = (data: any[]): any[] => {
    return data.slice(1).map((row: any) => ({
      id: row['ID do conteúdo'] || row['Vídeo'] || '',
      titulo: row['Título do vídeo'] || '',
      horario_publicacao: row['Horário de publicação'] || '',
      duracao_segundos: parseInt(row['Duração do vídeo (segundos)']) || 0,
      visualizacoes_intencionais: parseInt(row['Visualizações intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      continuaram_assistindo: parseFloat(row['Continuaram assistindo (%)']) || 0,
      espectadores_unicos: parseInt(row['Espectadores únicos']) || 0,
      media_visualizacoes_por_espectador: parseFloat(row['Média de visualizações por espectador']) || 0,
      novos_espectadores: parseInt(row['Novos espectadores']) || 0,
      espectadores_recorrentes: parseInt(row['Espectadores recorrentes']) || 0,
      espectadores_casuais: parseInt(row['Espectadores casuais']) || 0,
      hypes: parseInt(row['Hypes']) || 0,
      inscricoes_obtidas: parseInt(row['Inscrições obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['Inscrições perdidas']) || 0,
      pontos_hype: parseInt(row['Pontos de hype']) || 0,
      marcacoes_gostei: parseInt(row['Marcações "Gostei"'] || row['Marcações Gostei'] || row['Marcações ""Gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['Marcações "Não gostei"'] || row['Marcações Não gostei'] || row['Marcações ""Não gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"Gostei" (vs. "Não gostei") (%)'] || row['Marcações Gostei vs. Marcações Não gostei (%)'] || row['"""Gostei"" (vs. ""Não gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['Compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['Comentários adicionados']) || 0,
      visualizacoes: parseInt(row['Visualizações']) || 0,
      tempo_exibicao_horas: parseFloat(row['Tempo de exibição (horas)']) || 0,
      inscritos: parseInt(row['Inscritos']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
      impressoes: parseInt(row['Impressões']) || 0,
      taxa_cliques_impressoes: parseFloat(row['Taxa de cliques de impressões (%)']) || 0,
    }));
  };

  const processCountryData = (data: any[]): any[] => {
    return data.slice(1).filter((row: any) => row['País'] && row['País'] !== 'Total').map((row: any) => ({
      pais_codigo: row['País'] || row['Código do país'] || '',
      pais_nome: row['País'] || '',
      visualizacoes_intencionais: parseInt(row['Visualizações intencionais']) || 0,
      inscritos: parseInt(row['Inscritos']) || 0,
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      continuaram_assistindo: parseFloat(row['Continuaram assistindo (%)']) || 0,
      inscricoes_obtidas: parseInt(row['Inscrições obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['Inscrições perdidas']) || 0,
      marcacoes_gostei: parseInt(row['Marcações "Gostei"'] || row['Marcações Gostei'] || row['Marcações ""Gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['Marcações "Não gostei"'] || row['Marcações Não gostei'] || row['Marcações ""Não gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"Gostei" (vs. "Não gostei") (%)'] || row['Marcações Gostei vs. Marcações Não gostei (%)'] || row['"""Gostei"" (vs. ""Não gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['Compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['Comentários adicionados']) || 0,
      visualizacoes: parseInt(row['Visualizações']) || 0,
      tempo_exibicao_horas: parseFloat(row['Tempo de exibição (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
    }));
  };

  const processCityData = (data: any[]): any[] => {
    return data.slice(1).filter((row: any) => row['Cidades'] || row['Nome da cidade'] || row['Cidade']).map((row: any) => ({
      cidade_id: row['Cidades'] || row['Cidade'] || '',
      nome_cidade: row['Nome da cidade'] || row['Cidade'] || 'Desconhecido',
      visualizacoes_intencionais: parseInt(row['Visualizações intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      continuaram_assistindo: parseFloat(row['Continuaram assistindo (%)']) || 0,
      visualizacoes: parseInt(row['Visualizações']) || 0,
      tempo_exibicao_horas: parseFloat(row['Tempo de exibição (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
    }));
  };

  const processTrafficData = (data: any[]): any[] => {
    return data.slice(1).map((row: any) => ({
      origem: row['Origem do tráfego'] || '',
      visualizacoes_intencionais: parseInt(row['Visualizações intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      hypes: parseInt(row['Hypes']) || 0,
      pontos_hype: parseInt(row['Pontos de hype']) || 0,
      visualizacoes: parseInt(row['Visualizações']) || 0,
      tempo_exibicao_horas: parseFloat(row['Tempo de exibição (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
      impressoes: parseInt(row['Impressões']) || 0,
      taxa_cliques_impressoes: parseFloat(row['Taxa de cliques de impressões (%)']) || 0,
    }));
  };

  const processDemographicData = (data: any[], tipo: string): any[] => {
    return data.map((row: any) => ({
      tipo: tipo,
      categoria: row['Gênero do espectador'] || row['Idade do espectador'] || '',
      visualizacoes_pct: parseFloat(row['Visualizações (%)']) || 0,
      tempo_exibicao_horas_pct: parseFloat(row['Tempo de exibição (horas) (%)']) || 0,
      visualizacoes_intencionais_pct: parseFloat(row['Visualizações intencionais (%)']) || 0,
      continuaram_assistindo_pct: parseFloat(row['Continuaram assistindo (%)']) || 0,
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
    }));
  };

  const processContentTypeData = (data: any[]): any[] => {
    return data.filter((row: any) => row['Tipo de conteúdo'] && row['Tipo de conteúdo'] !== 'Total').map((row: any) => ({
      tipo_conteudo: row['Tipo de conteúdo'] || '',
      visualizacoes: parseInt(row['Visualizações']) || 0,
      visualizacoes_intencionais: parseInt(row['Visualizações intencionais']) || 0,
      videos_publicados: parseInt(row['Vídeos publicados']) || 0,
      tempo_exibicao_horas: parseFloat(row['Tempo de exibição (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['Duração média da visualização']),
      porcentagem_visualizada_media: parseFloat(row['Porcentagem visualizada média (%)']) || 0,
      continuaram_assistindo: parseFloat(row['Continuaram assistindo (%)']) || 0,
      impressoes: parseInt(row['Impressões']) || 0,
      taxa_cliques_impressoes: parseFloat(row['Taxa de cliques de impressões (%)']) || 0,
      inscricoes_obtidas: parseInt(row['Inscrições obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['Inscrições perdidas']) || 0,
      marcacoes_gostei: parseInt(row['Marcações "Gostei"'] || row['Marcações Gostei'] || row['Marcações ""Gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['Marcações "Não gostei"'] || row['Marcações Não gostei'] || row['Marcações ""Não gostei""']) || 0,
      compartilhamentos: parseInt(row['Compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['Comentários adicionados']) || 0,
      hypes: parseInt(row['Hypes']) || 0,
      pontos_hype: parseInt(row['Pontos de hype']) || 0,
    }));
  };

  // --- HANDLER PRINCIPAL ---

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setStatusMessage('Lendo arquivo ZIP...');

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // --- LÓGICA INSTAGRAM ---
      if (socialNetwork === 'instagram') {
        setStatusMessage('Processando dados do Instagram...');
        const instagramData: InstagramData = {
          visualizacoes: [], visitasPerfil: [], seguidores: [], alcance: [], impressoes: [], interacoes: [], cliquesLink: [],
          publicoIdadeGenero: [], publicoCidades: [], publicoPaises: [], publicoPaginas: [], posts: [],
          resumo: { totalVisualizacoes: 0, totalVisitas: 0, totalSeguidoresGanhos: 0, totalAlcance: 0, totalInteracoes: 0, totalCliquesLink: 0, totalSalvamentos: 0 }
        };

        let foundFiles = 0;

        for (const [fileName, fileData] of Object.entries(zipContent.files)) {
          if (fileData.dir || !fileName.endsWith('.csv')) continue;
          
          // Normalização do nome do arquivo para ignorar acentos e case
          const cleanName = fileName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const csvText = await fileData.async('text');

          console.log(`Processando arquivo: ${fileName} -> ${cleanName}`);

          if (cleanName.includes('visualizacoes')) { 
             instagramData.visualizacoes = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('visitas')) { 
             instagramData.visitasPerfil = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('seguidores')) { 
             instagramData.seguidores = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('alcance')) { 
             instagramData.alcance = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('interacoes')) { 
             instagramData.interacoes = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('cliques')) { 
             instagramData.cliquesLink = processInstagramMetric(parseCSV(csvText)); 
             foundFiles++; 
          }
          else if (cleanName.includes('publico')) {
             const audienceData = processInstagramAudience(csvText);
             
             // Lógica de merge: só atualiza se tiver dados novos
             if (audienceData.idadeGenero.length > 0) instagramData.publicoIdadeGenero = audienceData.idadeGenero;
             if (audienceData.cidades.length > 0) instagramData.publicoCidades = audienceData.cidades;
             if (audienceData.paises.length > 0) instagramData.publicoPaises = audienceData.paises;
             if (audienceData.paginas.length > 0) instagramData.publicoPaginas = audienceData.paginas;
             
             if (audienceData.idadeGenero.length > 0 || audienceData.cidades.length > 0) foundFiles++;
          } else {
             if (csvText.includes('Identificação do post') || csvText.includes('Link permanente')) {
                const posts = processInstagramPosts(parseCSV(csvText));
                if (posts.length > 0) { instagramData.posts = posts; foundFiles++; }
             }
          }
        }

        if (foundFiles === 0) throw new Error('Nenhum arquivo CSV válido do Instagram encontrado no ZIP.');

        // Recalcular Resumo
        const sum = (arr: InstagramMetric[]) => arr.reduce((acc, curr) => acc + curr.valor, 0);
        instagramData.resumo.totalVisualizacoes = sum(instagramData.visualizacoes);
        instagramData.resumo.totalVisitas = sum(instagramData.visitasPerfil);
        instagramData.resumo.totalSeguidoresGanhos = sum(instagramData.seguidores);
        instagramData.resumo.totalAlcance = sum(instagramData.alcance);
        instagramData.resumo.totalInteracoes = sum(instagramData.interacoes);
        instagramData.resumo.totalCliquesLink = sum(instagramData.cliquesLink);
        if (instagramData.posts.length > 0) instagramData.resumo.totalSalvamentos = instagramData.posts.reduce((acc, curr) => acc + curr.salvamentos, 0);

        console.log("Dados finais processados:", instagramData);
        onDataProcessed(instagramData);
        setSuccess(true);
        setStatusMessage('Sucesso! Dados carregados.');
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        return;
      }

      // --- LÓGICA YOUTUBE ---
      setStatusMessage('Processando dados do YouTube...');
      const processedData: ProcessedData = {
        videos: [], countries: [], cities: [], trafficSources: [], demographics: [], newRecurrent: [], subscriptionOrigin: [],
        subscriptionStatus: [], contentType: [], deviceType: [], deviceTypeTimeSeries: [], operatingSystem: [], audienceBehavior: [],
      };

      for (const [fileName, fileData] of Object.entries(zipContent.files)) {
        if (fileData.dir || !fileName.includes('.csv')) continue;
        const csvText = await fileData.async('text');
        const parsedData = parseYT(csvText);

        // Mapeamento de arquivos do YouTube
        if (fileName.includes('Conteúdo') || fileName.includes('Conte')) {
          if (fileName.includes('Dados da tabela')) processedData.videos = processVideoData(parsedData);
        } else if (fileName.includes('País') || fileName.includes('Pa')) {
          if (fileName.includes('Dados da tabela')) processedData.countries = processCountryData(parsedData);
        } else if (fileName.includes('Cidades')) {
          if (fileName.includes('Dados da tabela')) processedData.cities = processCityData(parsedData);
        } else if (fileName.includes('Origem do tráfego') || fileName.includes('Origem do tr')) {
          if (fileName.includes('Dados da tabela')) processedData.trafficSources = processTrafficData(parsedData);
        } else if (fileName.includes('Gênero') || fileName.includes('G')) {
          if (fileName.includes('Dados da tabela')) processedData.demographics.push(...processDemographicData(parsedData, 'Gênero'));
        } else if (fileName.includes('Idade')) {
          if (fileName.includes('Dados da tabela')) processedData.demographics.push(...processDemographicData(parsedData, 'Idade'));
        } else if (fileName.includes('Tipo de conte')) {
          if (fileName.includes('Dados da tabela')) processedData.contentType = processContentTypeData(parsedData);
        }
      }

      onDataProcessed(processedData);
      setSuccess(true);
      setStatusMessage('Sucesso! Dados carregados.');
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('Erro ao processar arquivo:', err);
      setError(err.message || `Erro ao processar o arquivo ZIP.`);
    } finally {
      setLoading(false);
    }
  };

  const getNetworkColor = () => {
    if (darkMode) return 'text-gray-400';
    return socialNetwork === 'youtube' ? 'text-red-600' : 'text-pink-600';
  };

  const getBorderColor = () => {
    if (darkMode) return 'border-gray-600 hover:border-gray-500';
    return socialNetwork === 'youtube' ? 'border-gray-300 hover:border-red-500' : 'border-gray-300 hover:border-pink-500';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Importar Relatório do {socialNetwork === 'youtube' ? 'YouTube' : 'Instagram'}
          </h3>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Faça upload do arquivo ZIP exportado do {socialNetwork === 'youtube' ? 'YouTube Studio' : 'Instagram Insights'}
          </p>
        </div>
        <Upload className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>

      <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${getBorderColor()} ${
        darkMode ? 'bg-gray-700/30' : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {loading ? (
            <div className="flex flex-col items-center">
               <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${socialNetwork === 'youtube' ? 'border-red-600' : 'border-pink-600'} mb-2`}></div>
               <span className="text-sm text-gray-500">{statusMessage}</span>
            </div>
          ) : success ? (
            <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
          ) : error ? (
             <div className="text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-600 mb-2 mx-auto" />
                <p className="text-red-600 text-sm">{error}</p>
             </div>
          ) : (
            <>
              <Upload className={`w-10 h-10 mb-2 ${getNetworkColor()}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
              </p>
              <p className={`text-xs mt-1 flex items-center justify-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <FileSearch className="w-3 h-3" /> ZIP com CSVs
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".zip"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm text-center font-medium">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ZipReportImporter;
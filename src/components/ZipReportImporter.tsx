import { useState } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';
import {
  ProcessedData,
  OperatingSystemData, DeviceTypeData, SubscriptionStatusData, SubscriptionOriginData,
  NewRecurrentData, AudienceBehaviorData, ContentTypeData,
  DeviceTypeTimeSeriesData, OperatingSystemTimeSeriesData, TrafficSourceTimeSeriesData,
  CountryTimeSeriesData, CityTimeSeriesData,
  InstagramData, TikTokData, InstagramMetric, InstagramPost, InstagramDemographic, InstagramPage, TikTokPost, TikTokDemographic
} from '../types';
import { Upload, CheckCircle, AlertCircle, FileSearch } from 'lucide-react';

interface ZipReportImporterProps {
  onDataProcessed: (data: ProcessedData | InstagramData | TikTokData) => void;
  darkMode: boolean;
  socialNetwork: 'youtube' | 'instagram' | 'tiktok';
}

const ZipReportImporter = ({ onDataProcessed, darkMode, socialNetwork }: ZipReportImporterProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- FUNÇÕES UTILITÁRIAS ---



  const parseCSV = (csvText: string) => {
    // Encontra onde começam os dados reais (pula metadados do topo)
    const lines = csvText.split(/\r?\n/);
    let startIndex = 0;

    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      // Procura por cabeçalhos comuns (data, date, identificação...)
      if ((line.includes('data') || line.includes('date')) && (line.includes(',') || line.includes(';'))) {
        startIndex = i;
        break;
      }
      if (line.includes('identificacao do post') || line.includes('link permanente')) {
        startIndex = i;
        break;
      }
    }

    // Reconstrói o texto a partir do cabeçalho encontrado
    const textToParse = lines.slice(startIndex).join('\n');

    const result = Papa.parse(textToParse, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      // Normaliza headers: trim, remove aspas, minúsculo, remove acentos
      transformHeader: (h) => h.trim().replace(/^"|"$/g, '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    });
    return result.data;
  };

  const parseLine = (line: string) => {
    const res = Papa.parse(line, {
      header: false,
      skipEmptyLines: true,
      // delimiter: ',', // Removido para permitir detecção automática (vírgula ou ponto e vírgula)
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
      .filter((row: any) => row['data'] && (row['primary'] !== undefined || row['valor'] !== undefined))
      .map((row: any) => ({
        data: row['data'],
        valor: parseInt(row['primary'] || row['valor'] || '0'),
      }));
  };

  const processInstagramPosts = (data: any[]): InstagramPost[] => {
    return data
      .filter((row: any) => row['identificacao do post'] || row['link permanente'])
      .map((row: any) => ({
        id: row['identificacao do post'] || '',
        data: row['horario de publicacao'] || row['data'] || '',
        descricao: row['descricao'] || '',
        tipo: row['tipo de post'] || 'Desconhecido',
        link: row['link permanente'] || '',
        visualizacoes: parseInt(row['visualizacoes'] || '0'),
        alcance: parseInt(row['alcance'] || '0'),
        curtidas: parseInt(row['curtidas'] || '0'),
        comentarios: parseInt(row['comentarios'] || '0'),
        compartilhamentos: parseInt(row['compartilhamentos'] || '0'),
        salvamentos: parseInt(row['salvamentos'] || '0'),
        duracao: parseInt(row['duracao (s)'] || '0'),
        seguimentos: parseInt(row['seguimentos'] || '0'),
        nomeConta: row['nome da conta'] || '',
        nomeUsuario: row['nome de usuario da conta'] || '',
      }));
  };

  const processInstagramAudience = (csvText: string) => {
    console.log("Iniciando processamento de público (Modo Robusto)...");
    console.log("Tamanho do arquivo:", csvText.length, "caracteres");
    console.log("Primeiras 500 caracteres:", csvText.substring(0, 500));

    const result = {
      idadeGenero: [] as InstagramDemographic[],
      cidades: [] as InstagramDemographic[],
      paises: [] as InstagramDemographic[],
      paginas: [] as InstagramPage[]
    };

    const errors: string[] = [];
    const sectionsFound = {
      age: false,
      cities: false,
      countries: false,
      pages: false
    };

    try {
      // Limpeza básica
      const cleanText = csvText.replace(/sep=,(\r?\n|\r)/g, '').trim();
      const lines = cleanText.split(/\r?\n/);

      console.log("Total de linhas após limpeza:", lines.length);
      console.log("Primeiras 5 linhas:", lines.slice(0, 5));

      // Estados da leitura
      let currentSection: 'NONE' | 'AGE' | 'CITIES' | 'COUNTRIES' | 'PAGES' = 'NONE';
      let bufferHeader: string[] | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Normaliza para minúsculo e remove acentos para facilitar comparação
        const lowerLine = line.toLowerCase();
        const normalizedLine = lowerLine.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (!line) continue; // Pula linhas vazias

        // 1. Detecção de Seção (Usando normalizedLine para evitar problemas de acentuação)
        // "Faixa etária e gênero" -> detecta "faixa" ou "etaria"
        // "Principais Páginas" -> detecta "paginas" ou "pages"
        // IMPORTANTE: Verificar antes de "Países" pois "Principais" contém "pais"
        if (normalizedLine.includes('paginas') || normalizedLine.includes('pages')) {
          console.log("Seção detectada: Páginas");
          currentSection = 'PAGES';
          sectionsFound.pages = true;
          bufferHeader = null;
          continue;
        }
        // "Faixa etária e gênero" -> detecta "faixa" ou "etaria"
        else if (normalizedLine.includes('faixa') || normalizedLine.includes('etaria') || normalizedLine.includes('age range')) {
          console.log("Seção detectada: Faixa Etária");
          currentSection = 'AGE';
          sectionsFound.age = true;
          continue;
        }
        // "Principais cidades" -> detecta "cidades" ou "cities"
        else if (normalizedLine.includes('cidades') || normalizedLine.includes('cities')) {
          console.log("Seção detectada: Cidades");
          currentSection = 'CITIES';
          sectionsFound.cities = true;
          bufferHeader = null;
          continue;
        }
        // "Principais países" -> detecta "pais" ou "countries"
        else if (normalizedLine.includes('pais') || normalizedLine.includes('countries')) {
          console.log("Seção detectada: Países");
          currentSection = 'COUNTRIES';
          sectionsFound.countries = true;
          bufferHeader = null;
          continue;
        }

        // 2. Processamento baseado na seção atual
        if (currentSection === 'AGE') {
          // Ignora cabeçalho interno "Mulheres, Homens"
          if (normalizedLine.includes('mulheres') || normalizedLine.includes('homens') || normalizedLine.includes('women')) {
            console.log('   Pulando linha de cabeçalho interno');
            continue;
          }

          const cols = parseLine(line);
          console.log(`   Processando linha AGE: `, cols);

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
              console.log(`      ✓ Faixa: ${cat} - Mulheres: ${fem}%, Homens: ${masc}% `);
            }
          }
        }

        // Lógica genérica para blocos Horizontais (Cidades, Países, Páginas)
        else if (['CITIES', 'COUNTRIES', 'PAGES'].includes(currentSection)) {
          const cols = parseLine(line);

          if (!bufferHeader) {
            // Se não temos header, assumimos que esta linha contém os NOMES (ex: São Paulo, Rio...)
            // Filtramos para garantir que tem valores válidos (strings ou números que serão convertidos)
            if (cols && cols.length > 0 && cols.some(c => c !== null && c !== undefined && String(c).trim().length > 0)) {
              bufferHeader = cols.map(c => String(c).trim()).filter(s => s.length > 0);
              console.log(`   Header capturado(${currentSection}): `, bufferHeader);
            }
          } else {
            // Se já temos header, esta linha contém os VALORES (ex: 8.1, 4.47...)
            if (cols && cols.length > 0) {
              console.log(`   Valores capturados(${currentSection}): `, cols);
              console.log(`   Matching com ${bufferHeader.length} headers`);

              cols.forEach((val, idx) => {
                const name = bufferHeader?.[idx];
                if (name && name.trim().length > 0) {
                  const numVal = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : (val || 0);

                  if (currentSection === 'CITIES') {
                    result.cidades.push({ categoria: name, porcentagem: numVal });
                    console.log(`      ✓ Cidade: ${name} = ${numVal}% `);
                  } else if (currentSection === 'COUNTRIES') {
                    result.paises.push({ categoria: name, porcentagem: numVal });
                    console.log(`      ✓ País: ${name} = ${numVal}% `);
                  } else if (currentSection === 'PAGES') {
                    result.paginas.push({ nome: name, porcentagem: numVal });
                    console.log(`      ✓ Página: ${name} = ${numVal}% `);
                  }
                }
              });
              // Reseta após ler a linha de valores
              bufferHeader = null;
            }
          }
        }
      }

    } catch (e: any) {
      console.error("Erro fatal no parser de público:", e);
      errors.push(`Erro fatal no parser de público: ${e.message} `);
    }

    if (!sectionsFound.age && !sectionsFound.cities && !sectionsFound.countries && !sectionsFound.pages) {
      errors.push("Nenhuma seção de público foi detectada. Verifique o formato do arquivo.");
    }

    // Retorna dados e log para ser salvo pelo orquestrador
    return {
      data: result,
      log: {
        timestamp: new Date().toISOString(),
        fileName: 'Público (Audience)',
        sectionsFound: sectionsFound,
        itemCounts: {
          idadeGenero: result.idadeGenero.length,
          cidades: result.cidades.length,
          paises: result.paises.length,
          paginas: result.paginas.length
        },
        errors: errors,
        filePreview: csvText.substring(0, 500)
      }
    };
  };

  // --- PROCESSADORES TIKTOK ---

  // --- PROCESSADORES TIKTOK ---

  const processTikTokOverview = (data: any[]): any => {
    const metrics: any = {
      videoViews: [], profileViews: [], likes: [], comments: [], shares: [], followers: []
    };

    data.forEach((row: any) => {
      if (!row['date']) return;
      const date = row['date'];

      if (row['video views'] !== undefined) metrics.videoViews.push({ date, value: parseInt(row['video views']) || 0 });
      if (row['profile views'] !== undefined) metrics.profileViews.push({ date, value: parseInt(row['profile views']) || 0 });
      if (row['likes'] !== undefined) metrics.likes.push({ date, value: parseInt(row['likes']) || 0 });
      if (row['comments'] !== undefined) metrics.comments.push({ date, value: parseInt(row['comments']) || 0 });
      if (row['shares'] !== undefined) metrics.shares.push({ date, value: parseInt(row['shares']) || 0 });
    });

    return metrics;
  };

  const processTikTokPosts = (data: any[]): TikTokPost[] => {
    // Debug TikTok Data
    if (data.length > 0) {
      console.log('TikTok Post Data Sample (Keys):', Object.keys(data[0]));
      console.log('TikTok Post Data Sample (Row):', data[0]);
    }
    // Headers reais: Time, Video title, Video link, Post time, Total likes, Total comments, Total shares, Total views
    // Usamos 'Time' para filtro (data de coleta), não 'Post time' (data de publicação)
    return data
      .filter((row: any) => row['video title'])
      .map((row: any) => ({
        id: row['video link'] || '',
        title: row['video title'] || '',
        link: row['video link'] || '',
        date: row['time'] || row['date'] || '',  // Usa 'Time' (data de coleta) para filtros funcionarem
        views: parseInt(row['total views'] || '0'),
        likes: parseInt(row['total likes'] || '0'),
        comments: parseInt(row['total comments'] || '0'),
        shares: parseInt(row['total shares'] || '0'),
      }));
  };

  const processTikTokAudience = (data: any[], type: 'gender' | 'territory'): TikTokDemographic[] => {
    // Gender Headers: Gender, Distribution
    // Territory Headers: Top territories, Distribution
    return data
      .filter((row: any) => {
        const cat = type === 'gender' ? row['gender'] : (row['top territories'] || row['country'] || row['territory']);
        return cat && row['distribution'];
      })
      .map((row: any) => ({
        category: type === 'gender' ? row['gender'] : (row['top territories'] || row['country'] || row['territory']),
        percentage: parseFloat(row['distribution'] || '0') * 100, // Converter 0.88 para 88
      }));
  };

  // --- PROCESSADORES YOUTUBE (MANTIDO) ---

  const processVideoData = (data: any[]): any[] => {
    // Debug YouTube Data
    if (data.length > 0) {
      console.log('YouTube Video Data Sample (Keys):', Object.keys(data[0]));
      console.log('YouTube Video Data Sample (Row):', data[0]);
    }
    return data.slice(1).map((row: any) => ({
      id: row['id do conteudo'] || row['video'] || row['conteudo'] || '',
      titulo: row['titulo do video'] || '',
      horario_publicacao: row['horario de publicacao'] || row['horario de publicacao do video'] || '',
      duracao_segundos: parseInt(row['duracao do video (segundos)']) || 0,
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      espectadores_unicos: parseInt(row['espectadores unicos']) || 0,
      media_visualizacoes_por_espectador: parseFloat(row['media de visualizacoes por espectador']) || 0,
      novos_espectadores: parseInt(row['novos espectadores']) || 0,
      espectadores_recorrentes: parseInt(row['espectadores recorrentes']) || 0,
      espectadores_casuais: parseInt(row['espectadores casuais']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      inscricoes_obtidas: parseInt(row['inscricoes obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['inscricoes perdidas']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes "gostei"'] || row['marcacoes gostei'] || row['marcacoes ""gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes "nao gostei"'] || row['marcacoes nao gostei'] || row['marcacoes ""nao gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"gostei" (vs. "nao gostei") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['"""gostei"" (vs. ""nao gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['comentarios adicionados']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      inscritos: parseInt(row['inscritos']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
    }));
  };

  const processCountryData = (data: any[]): any[] => {
    return data.slice(1).filter((row: any) => row['pais'] && row['pais'] !== 'total').map((row: any) => ({
      pais_codigo: row['pais'] || row['codigo do pais'] || '',
      pais_nome: row['pais'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      inscritos: parseInt(row['inscritos']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      inscricoes_obtidas: parseInt(row['inscricoes obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['inscricoes perdidas']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes "gostei"'] || row['marcacoes gostei'] || row['marcacoes ""gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes "nao gostei"'] || row['marcacoes nao gostei'] || row['marcacoes ""nao gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"gostei" (vs. "nao gostei") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['"""gostei"" (vs. ""nao gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['comentarios adicionados']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
    }));
  };

  const processCityData = (data: any[]): any[] => {
    return data.slice(1).filter((row: any) => row['cidades'] || row['nome da cidade'] || row['cidade']).map((row: any) => ({
      cidade_id: row['cidades'] || row['cidade'] || '',
      nome_cidade: row['nome da cidade'] || row['cidade'] || 'Desconhecido',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
    }));
  };

  const processTrafficData = (data: any[]): any[] => {
    return data.slice(1).map((row: any) => ({
      origem: row['origem do trafego'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
    }));
  };

  const processDemographicData = (data: any[], tipo: string): any[] => {
    return data.map((row: any) => ({
      tipo: tipo,
      categoria: row['genero do espectador'] || row['idade do espectador'] || '',
      visualizacoes_pct: parseFloat(row['visualizacoes (%)']) || 0,
      tempo_exibicao_horas_pct: parseFloat(row['tempo de exibicao (horas) (%)']) || 0,
      visualizacoes_intencionais_pct: parseFloat(row['visualizacoes intencionais (%)']) || 0,
      continuaram_assistindo_pct: parseFloat(row['continuaram assistindo (%)']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
    }));
  };

  // --- HANDLER PRINCIPAL ---

  const processOperatingSystemData = (data: any[]): OperatingSystemData[] => {
    return data.slice(1).map((row: any) => ({
      sistema_operacional: row['sistema operacional'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
      espectadores_unicos: parseInt(row['espectadores unicos']) || 0,
      media_visualizacoes_por_espectador: parseFloat(row['media de visualizacoes por espectador']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes "gostei"'] || row['marcacoes gostei'] || row['marcacoes ""gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes "nao gostei"'] || row['marcacoes nao gostei'] || row['marcacoes ""nao gostei""']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"gostei" (vs. "nao gostei") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['"""gostei"" (vs. ""nao gostei"") (%)"']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0
    }));
  };

  const processDeviceTypeData = (data: any[]): DeviceTypeData[] => {
    return data.slice(1).map((row: any) => ({
      tipo_dispositivo: row['tipo de dispositivo'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao']),
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      espectadores_unicos: parseInt(row['espectadores unicos']) || 0,
      media_visualizacoes_por_espectador: parseFloat(row['media de visualizacoes por espectador']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes "gostei"'] || row['marcacoes gostei'] || row['marcacoes ""gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes "nao gostei"'] || row['marcacoes nao gostei'] || row['marcacoes ""nao gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"gostei" (vs. "nao gostei") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['"""gostei"" (vs. ""nao gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0
    }));
  };

  const processSubscriptionStatusData = (data: any[]): SubscriptionStatusData[] => {
    return data.slice(1).map((row: any) => ({
      status_inscricao: row['status da inscricao'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      inscritos: parseInt(row['inscritos']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      inscricoes_obtidas: parseInt(row['inscricoes obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['inscricoes perdidas']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes "gostei"'] || row['marcacoes gostei'] || row['marcacoes ""gostei""']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes "nao gostei"'] || row['marcacoes nao gostei'] || row['marcacoes ""nao gostei""']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['"gostei" (vs. "nao gostei") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['"""gostei"" (vs. ""nao gostei"") (%)"']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao'])
    }));
  };

  const processSubscriptionOriginData = (data: any[]): SubscriptionOriginData[] => {
    return data.slice(1).map((row: any) => ({
      origem_inscricao: row['origem da inscricao'] || '',
      inscritos: parseInt(row['inscritos']) || 0,
      inscricoes_obtidas: parseInt(row['inscricoes obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['inscricoes perdidas']) || 0
    }));
  };

  const processNewRecurrentData = (data: any[]): NewRecurrentData[] => {
    return data.slice(1).map((row: any) => ({
      tipo_espectador: row['espectadores novos e recorrentes'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao'])
    }));
  };

  const processAudienceBehaviorData = (data: any[]): AudienceBehaviorData[] => {
    return data.slice(1).map((row: any) => ({
      tipo_publico: row['publico por comportamento de visualizacao'] || '', // Mapped to tipo_publico
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      comentarios_adicionados: parseInt(row['comentarios adicionados']) || 0,
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao'])
    }));
  };

  const processContentTypeData = (data: any[]): ContentTypeData[] => {
    return data.slice(1).map((row: any) => ({
      tipo_conteudo: row['tipo de conteudo'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0,
      inscritos: parseInt(row['inscritos']) || 0,
      porcentagem_visualizada_media: parseFloat(row['porcentagem visualizada media (%)']) || 0,
      videos_publicados: parseInt(row['videos publicados']) || 0,
      impressoes: parseInt(row['impressoes']) || 0,
      taxa_cliques_impressoes: parseFloat(row['taxa de cliques de impressoes (%)']) || 0,
      continuaram_assistindo: parseFloat(row['continuaram assistindo (%)']) || 0,
      espectadores_unicos: parseInt(row['espectadores unicos']) || 0,
      novos_espectadores: parseInt(row['novos espectadores']) || 0,
      espectadores_recorrentes_total: parseInt(row['espectadores recorrentes']) || 0,
      espectadores_casuais: parseInt(row['espectadores casuais']) || 0,
      espectadores_recorrentes: parseInt(row['espectadores recorrentes']) || 0,
      hypes: parseInt(row['hypes']) || 0,
      pontos_hype: parseInt(row['pontos de hype']) || 0,
      inscricoes_obtidas: parseInt(row['inscricoes obtidas']) || 0,
      inscricoes_perdidas: parseInt(row['inscricoes perdidas']) || 0,
      marcacoes_gostei: parseInt(row['marcacoes \"gostei\"'] || row['marcacoes gostei'] || row['marcacoes \"\"gostei\"\"']) || 0,
      marcacoes_nao_gostei: parseInt(row['marcacoes \"nao gostei\"'] || row['marcacoes nao gostei'] || row['marcacoes \"\"nao gostei\"\"']) || 0,
      gostei_vs_nao_gostei_pct: parseFloat(row['\"gostei\" (vs. \"nao gostei\") (%)'] || row['marcacoes gostei vs. marcacoes nao gostei (%)'] || row['\"\"\"gostei\"\" (vs. \"\"nao gostei\"\") (%)\"']) || 0,
      compartilhamentos: parseInt(row['compartilhamentos']) || 0,
      comentarios_adicionados: parseInt(row['comentarios adicionados']) || 0,
      visualizacoes: parseInt(row['visualizacoes']) || 0,
      tempo_exibicao_horas: parseFloat(row['tempo de exibicao (horas)']) || 0,
      duracao_media_visualizacao_segundos: parseDuration(row['duracao media da visualizacao'])
    }));
  };

  // --- TIME SERIES PROCESSORS ---

  const processDeviceTypeTimeSeries = (data: any[]): DeviceTypeTimeSeriesData[] => {
    return data.slice(1).map((row: any) => ({
      data: row['data'] || '',
      tipo_dispositivo: row['tipo de dispositivo'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0
    }));
  };

  const processOperatingSystemTimeSeries = (data: any[]): OperatingSystemTimeSeriesData[] => {
    return data.slice(1).map((row: any) => ({
      data: row['data'] || '',
      sistema_operacional: row['sistema operacional'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0
    }));
  };

  const processTrafficSourceTimeSeries = (data: any[]): TrafficSourceTimeSeriesData[] => {
    return data.slice(1).map((row: any) => ({
      data: row['data'] || '',
      origem_trafego: row['origem do trafego'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0
    }));
  };

  const processCountryTimeSeries = (data: any[]): CountryTimeSeriesData[] => {
    return data.slice(1).map((row: any) => ({
      data: row['data'] || '',
      pais_codigo: row['pais'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0
    }));
  };

  const processCityTimeSeries = (data: any[]): CityTimeSeriesData[] => {
    return data.slice(1).map((row: any) => ({
      data: row['data'] || '',
      cidade_id: row['cidades'] || row['cidade'] || '',
      visualizacoes_intencionais: parseInt(row['visualizacoes intencionais']) || 0
    }));
  };

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
        const processedFilesList: string[] = [];
        let audienceLog: any = null;

        for (const [fileName, fileData] of Object.entries(zipContent.files)) {
          if (fileData.dir || !fileName.endsWith('.csv')) continue;

          // Normalização do nome do arquivo para ignorar acentos e case
          const cleanName = fileName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          // LER COMO BINÁRIO PARA TRATAR ENCODING
          let csvText = '';
          const fileBytes = await fileData.async('uint8array');

          // Tenta detectar encoding
          try {
            // Verifica BOM para UTF-16LE (FF FE) ou UTF-16BE (FE FF)
            if (fileBytes.length >= 2) {
              if (fileBytes[0] === 0xFF && fileBytes[1] === 0xFE) {
                csvText = new TextDecoder('utf-16le').decode(fileBytes);
                console.log(`Arquivo ${fileName} detectado como UTF - 16LE`);
              } else if (fileBytes[0] === 0xFE && fileBytes[1] === 0xFF) {
                csvText = new TextDecoder('utf-16be').decode(fileBytes);
                console.log(`Arquivo ${fileName} detectado como UTF - 16BE`);
              }
            }

            // Se não detectou BOM, tenta UTF-8 primeiro
            if (!csvText) {
              const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
              try {
                csvText = utf8Decoder.decode(fileBytes);
              } catch (e) {
                // Se falhar UTF-8, tenta Windows-1252 (comum no Brasil/Excel)
                console.log(`Falha ao ler ${fileName} como UTF - 8, tentando Windows - 1252...`);
                const winDecoder = new TextDecoder('windows-1252');
                csvText = winDecoder.decode(fileBytes);
              }
            }

            // Verificação extra: Se UTF-8 gerou muitos caracteres de substituição (), tenta Windows-1252 ou UTF-16LE
            if (csvText.includes('') && csvText.length < 5000) { // Checa apenas se arquivo for pequeno ou no início
              console.log(`Detectados caracteres inválidos em ${fileName}, tentando forçar UTF - 16LE...`);
              const altText = new TextDecoder('utf-16le').decode(fileBytes);
              // Se UTF-16LE parecer mais legível (menos  ou caracteres nulos), usa ele
              if (!altText.includes('') && !altText.includes('\u0000')) {
                csvText = altText;
                console.log('Mudado para UTF-16LE com sucesso.');
              }
            }
          } catch (err) {
            console.error(`Erro ao decodificar ${fileName}: `, err);
            csvText = await fileData.async('text'); // Fallback para padrão
          }

          console.log(`Processando arquivo: ${fileName} -> ${cleanName} `);

          if (cleanName.includes('visualizacoes')) {
            instagramData.visualizacoes = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Visualizações');
            foundFiles++;
          } else if (cleanName.includes('visitas')) {
            instagramData.visitasPerfil = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Visitas ao Perfil');
            foundFiles++;
          } else if (cleanName.includes('seguidores')) {
            instagramData.seguidores = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Seguidores');
            foundFiles++;
          } else if (cleanName.includes('alcance')) {
            instagramData.alcance = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Alcance');
            foundFiles++;
          } else if (cleanName.includes('interacoes')) {
            instagramData.interacoes = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Interações');
            foundFiles++;
          } else if (cleanName.includes('cliques')) {
            instagramData.cliquesLink = processInstagramMetric(parseCSV(csvText));
            processedFilesList.push('Cliques no Link');
            foundFiles++;
          } else if (cleanName.includes('publico') || cleanName.includes('audience')) {
            const { data, log } = processInstagramAudience(csvText);
            instagramData.publicoIdadeGenero = data.idadeGenero;
            instagramData.publicoCidades = data.cidades;
            instagramData.publicoPaises = data.paises;
            instagramData.publicoPaginas = data.paginas;
            audienceLog = log; // Guarda o log detalhado
            processedFilesList.push('Público (Audience)');
            foundFiles++;
          } else {
            if (csvText.includes('Identificação do post') || csvText.includes('Link permanente') || csvText.includes('identificacao do post')) {
              const posts = processInstagramPosts(parseCSV(csvText));
              if (posts.length > 0) {
                instagramData.posts = posts;
                processedFilesList.push('Posts (Feed/Stories)');
                foundFiles++;
              }
            }
          }
        }

        // Salva o log unificado no final
        const finalLog = {
          timestamp: new Date().toISOString(),
          processedFiles: processedFilesList,
          audienceDetails: audienceLog || {
            // Fallback se não tiver público
            sectionsFound: {},
            itemCounts: {},
            errors: ["Arquivo de público não encontrado"],
            filePreview: ""
          }
        };
        localStorage.setItem('instagram_import_log', JSON.stringify(finalLog));

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
        return;
      }

      // --- LÓGICA TIKTOK ---
      if (socialNetwork === 'tiktok') {
        setStatusMessage('Processando dados do TikTok...');
        const tiktokData: TikTokData = {
          overview: {
            videoViews: [], profileViews: [], likes: [], comments: [], shares: [], followers: []
          },
          posts: [],
          audience: { gender: [], territories: [], activity: [] },
          summary: { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalFollowers: 0, totalPosts: 0 }
        };

        for (const [fileName, fileData] of Object.entries(zipContent.files)) {
          if (fileData.dir || !fileName.endsWith('.csv')) continue;

          const csvText = await fileData.async('text');
          const parsedData = parseCSV(csvText);
          const cleanName = fileName.toLowerCase();

          if (cleanName.includes('overview')) {
            console.log('Processando TikTok Overview:', fileName);
            const overviewMetrics = processTikTokOverview(parsedData);
            tiktokData.overview = { ...tiktokData.overview, ...overviewMetrics };
          } else if (cleanName.includes('content') || cleanName.includes('video')) {
            console.log('Processando TikTok Content:', fileName);
            tiktokData.posts = processTikTokPosts(parsedData);
          } else if (cleanName.includes('follower') && cleanName.includes('gender')) {
            console.log('Processando TikTok Gender:', fileName);
            tiktokData.audience.gender = processTikTokAudience(parsedData, 'gender');
          } else if (cleanName.includes('follower') && (cleanName.includes('territor') || cleanName.includes('top'))) {
            console.log('Processando TikTok Territories:', fileName);
            tiktokData.audience.territories = processTikTokAudience(parsedData, 'territory');
          }

          // Tentar extrair métricas de Overview se estiverem em formato de série temporal
          // Isso depende muito de como o TikTok exporta. 
          // Se for um arquivo 'Overview.csv' com várias colunas de data e métricas, precisaria pivotar.
          // Assumindo que o usuário pode ter arquivos separados ou um formato específico.
          // Vou adicionar uma leitura genérica para métricas se o nome bater
        }

        // Calcular resumo
        tiktokData.summary.totalPosts = tiktokData.posts.length;
        tiktokData.summary.totalViews = tiktokData.posts.reduce((acc, curr) => acc + curr.views, 0);
        tiktokData.summary.totalLikes = tiktokData.posts.reduce((acc, curr) => acc + curr.likes, 0);
        tiktokData.summary.totalComments = tiktokData.posts.reduce((acc, curr) => acc + curr.comments, 0);
        tiktokData.summary.totalShares = tiktokData.posts.reduce((acc, curr) => acc + curr.shares, 0);

        // Se não tivermos dados de série temporal, podemos tentar criar fakes baseados nos posts para visualização
        // Ou deixar vazio.

        onDataProcessed(tiktokData);
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
        subscriptionStatus: [], contentType: [], deviceType: [], deviceTypeTimeSeries: [], operatingSystem: [], audienceBehavior: [], operatingSystemTimeSeries: [], trafficSourceTimeSeries: [], countriesTimeSeries: [], citiesTimeSeries: [],
      };

      for (const [fileName, fileData] of Object.entries(zipContent.files)) {
        if (fileData.dir || !fileName.includes('.csv')) continue;

        const csvText = await fileData.async('text');
        const parsedData = parseCSV(csvText);

        // Identificar tipo de arquivo pelo caminho ou conteúdo
        const path = fileName.toLowerCase();
        const isTableData = path.includes('dados da tabela');
        const isGraphData = path.includes('dados do grafico') || path.includes('dados do gráfico');

        if (isTableData) {
          if (path.includes('conteudo') || path.includes('conteúdo')) {
            processedData.videos = processVideoData(parsedData);
          } else if (path.includes('cidades')) {
            processedData.cities = processCityData(parsedData);
          } else if (path.includes('pais') || path.includes('país')) {
            processedData.countries = processCountryData(parsedData);
          } else if (path.includes('origem do trafego') || path.includes('origem do tráfego')) {
            processedData.trafficSources = processTrafficData(parsedData);
          } else if (path.includes('idade do espectador')) {
            processedData.demographics.push(...processDemographicData(parsedData, 'Idade'));
          } else if (path.includes('genero') || path.includes('gênero')) {
            processedData.demographics.push(...processDemographicData(parsedData, 'Gênero'));
          } else if (path.includes('sistema operacional')) {
            processedData.operatingSystem = processOperatingSystemData(parsedData);
          } else if (path.includes('tipo de dispositivo')) {
            processedData.deviceType = processDeviceTypeData(parsedData);
          } else if (path.includes('status da inscricao') || path.includes('status da inscrição')) {
            processedData.subscriptionStatus = processSubscriptionStatusData(parsedData);
          } else if (path.includes('origem da inscricao') || path.includes('origem da inscrição')) {
            processedData.subscriptionOrigin = processSubscriptionOriginData(parsedData);
          } else if (path.includes('espectadores novos e recorrentes')) {
            processedData.newRecurrent = processNewRecurrentData(parsedData);
          } else if (path.includes('comportamento de visualizacao') || path.includes('comportamento de visualização')) {
            processedData.audienceBehavior = processAudienceBehaviorData(parsedData);
          } else if (path.includes('tipo de conteudo') || path.includes('tipo de conteúdo')) {
            processedData.contentType = processContentTypeData(parsedData);
          }
        } else if (isGraphData) {
          // Process Time Series Data
          if (path.includes('tipo de dispositivo')) {
            processedData.deviceTypeTimeSeries = processDeviceTypeTimeSeries(parsedData);
          } else if (path.includes('sistema operacional')) {
            processedData.operatingSystemTimeSeries = processOperatingSystemTimeSeries(parsedData);
          } else if (path.includes('origem do trafego') || path.includes('origem do tráfego')) {
            processedData.trafficSourceTimeSeries = processTrafficSourceTimeSeries(parsedData);
          } else if (path.includes('pais') || path.includes('país')) {
            processedData.countriesTimeSeries = processCountryTimeSeries(parsedData);
          } else if (path.includes('cidades')) {
            processedData.citiesTimeSeries = processCityTimeSeries(parsedData);
          }
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
    if (socialNetwork === 'tiktok') return 'text-black dark:text-white'; // TikTok é preto/branco
    return socialNetwork === 'youtube' ? 'text-red-600' : 'text-pink-600';
  };

  const getBorderColor = () => {
    if (darkMode) return 'border-gray-600 hover:border-gray-500';
    if (socialNetwork === 'tiktok') return 'border-gray-300 hover:border-black';
    return socialNetwork === 'youtube' ? 'border-gray-300 hover:border-red-500' : 'border-gray-300 hover:border-pink-500';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text - 2xl font - bold ${darkMode ? 'text-white' : 'text-gray-900'} `}>
            Importar Relatório do {socialNetwork === 'youtube' ? 'YouTube' : socialNetwork === 'instagram' ? 'Instagram' : 'TikTok'}
          </h3>
          <p className={`text - sm mt - 2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} `}>
            Faça upload do arquivo ZIP exportado do {socialNetwork === 'youtube' ? 'YouTube Studio' : socialNetwork === 'instagram' ? 'Instagram Insights' : 'TikTok Analytics'}
          </p>
        </div>
        <Upload className={`w - 8 h - 8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} `} />
      </div>

      <label className={`flex flex - col items - center justify - center w - full h - 48 border - 2 border - dashed rounded - xl cursor - pointer transition - all ${getBorderColor()} ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50 hover:bg-gray-100'
        } `}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className={`animate - spin rounded - full h - 8 w - 8 border - b - 2 ${socialNetwork === 'youtube' ? 'border-red-600' : socialNetwork === 'instagram' ? 'border-pink-600' : 'border-black dark:border-white'} mb - 2`}></div>
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
              <Upload className={`w - 10 h - 10 mb - 2 ${getNetworkColor()} `} />
              <p className={`text - sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} `}>
                <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
              </p>
              <p className={`text - xs mt - 1 flex items - center justify - center gap - 1 ${darkMode ? 'text-gray-500' : 'text-gray-500'} `}>
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
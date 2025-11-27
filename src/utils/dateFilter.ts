import { ProcessedData, InstagramData, TikTokData, InstagramMetric, TikTokMetric } from '../types';

export type DateRange = '7d' | '14d' | '30d' | '60d' | '90d' | 'all' | { start: Date; end: Date };

const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);

    // Tenta formato ISO ou padrão do JS
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Tenta formato PT-BR (DD/MM/YYYY)
    const ptBrMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ptBrMatch) {
        const day = parseInt(ptBrMatch[1]);
        const month = parseInt(ptBrMatch[2]) - 1;
        const year = parseInt(ptBrMatch[3]);
        date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
    }

    // Tenta formato com meses por extenso (ex: 24 de nov. de 2024 ou "8 de outubro")
    // Isso é comum em exports do YouTube e TikTok em PT-BR
    try {
        const months: { [key: string]: number } = {
            'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11,
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };

        const parts = dateStr.toLowerCase().replace(/de/g, '').replace(/\./g, '').split(/\s+/).filter(p => p);

        // Formato: [dia, mês, ano] ou [dia, mês] (TikTok sem ano)
        if (parts.length >= 2) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            let year = parts.length >= 3 ? parseInt(parts[2]) : new Date().getFullYear();

            if (months[monthStr] !== undefined && !isNaN(day) && !isNaN(year)) {
                // Cria a data
                let parsedDate = new Date(year, months[monthStr], day);

                // Se a data está no futuro e não tínhamos ano explícito, usa ano anterior
                // Isso resolve o problema do TikTok onde dados de 2024 eram parseados como 2025
                if (parts.length < 3 && parsedDate > new Date()) {
                    parsedDate = new Date(year - 1, months[monthStr], day);
                }

                return parsedDate;
            }
        }
    } catch (e) {
        // Ignora erro e retorna data 0
    }

    return new Date(0);
};

const getLatestDate = (dates: Date[]): Date => {
    if (dates.length === 0) return new Date();
    return new Date(Math.max(...dates.map(d => d.getTime())));
};

const filterByDateRange = <T extends { [key: string]: any }>(
    items: T[],
    dateField: keyof T,
    range: DateRange,
    latestDate: Date
): T[] => {
    if (range === 'all') return items;

    let startDate: Date;
    let endDate: Date;

    if (typeof range === 'string') {
        const daysToSubtract = parseInt(range.replace('d', ''));
        startDate = new Date(latestDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        endDate = latestDate;
    } else {
        startDate = range.start;
        endDate = range.end;
    }

    // Normalizar para início do dia para comparação justa
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return items.filter(item => {
        const itemDate = parseDate(item[dateField]);
        return itemDate >= startDate && itemDate <= endDate;
    });
};

export const filterInstagramData = (data: InstagramData, range: DateRange): InstagramData => {
    console.log('[Instagram Filter] Range:', range);
    console.log('[Instagram Filter] Posts count:', data.posts.length);
    if (range === 'all') return data;

    // Encontrar a data mais recente entre todas as métricas temporais
    const allDates: Date[] = [];

    const collectDates = (metrics: InstagramMetric[]) => {
        metrics.forEach(m => allDates.push(parseDate(m.data)));
    };

    collectDates(data.visualizacoes);
    collectDates(data.visitasPerfil);
    collectDates(data.seguidores);
    collectDates(data.alcance);
    collectDates(data.impressoes);
    collectDates(data.interacoes);
    collectDates(data.cliquesLink);
    data.posts.forEach(p => allDates.push(parseDate(p.data)));

    const latestDate = getLatestDate(allDates);
    console.log('[Instagram Filter] Latest date:', latestDate);
    console.log('[Instagram Filter] Sample dates:', data.posts.slice(0, 3).map(p => p.data));

    // Filtrar métricas
    const filterMetrics = (metrics: InstagramMetric[]) => filterByDateRange(metrics, 'data', range, latestDate);

    const filteredVisualizacoes = filterMetrics(data.visualizacoes);
    const filteredVisitas = filterMetrics(data.visitasPerfil);
    const filteredSeguidores = filterMetrics(data.seguidores);
    const filteredAlcance = filterMetrics(data.alcance);
    const filteredImpressoes = filterMetrics(data.impressoes);
    const filteredInteracoes = filterMetrics(data.interacoes);
    const filteredCliques = filterMetrics(data.cliquesLink);

    // Filtrar posts
    const filteredPosts = filterByDateRange(data.posts, 'data', range, latestDate);
    console.log('[Instagram Filter] Filtered posts count:', filteredPosts.length);

    // Recalcular resumo
    const sum = (arr: InstagramMetric[]) => arr.reduce((acc, curr) => acc + curr.valor, 0);

    const totalSalvamentos = filteredPosts.reduce((acc, curr) => acc + curr.salvamentos, 0);

    return {
        ...data,
        visualizacoes: filteredVisualizacoes,
        visitasPerfil: filteredVisitas,
        seguidores: filteredSeguidores,
        alcance: filteredAlcance,
        impressoes: filteredImpressoes,
        interacoes: filteredInteracoes,
        cliquesLink: filteredCliques,
        posts: filteredPosts,
        resumo: {
            totalVisualizacoes: sum(filteredVisualizacoes),
            totalVisitas: sum(filteredVisitas),
            totalSeguidoresGanhos: sum(filteredSeguidores),
            totalAlcance: sum(filteredAlcance),
            totalInteracoes: sum(filteredInteracoes),
            totalCliquesLink: sum(filteredCliques),
            totalSalvamentos: totalSalvamentos
        }
    };
};

export const filterTikTokData = (data: TikTokData, range: DateRange): TikTokData => {
    console.log('[TikTok Filter] Range:', range);
    console.log('[TikTok Filter] Posts count:', data.posts.length);
    if (range === 'all') return data;

    const allDates: Date[] = [];
    const collectDates = (metrics: TikTokMetric[]) => {
        metrics.forEach(m => allDates.push(parseDate(m.date)));
    };

    collectDates(data.overview.videoViews);
    collectDates(data.overview.profileViews);
    collectDates(data.overview.likes);
    collectDates(data.overview.comments);
    collectDates(data.overview.shares);
    collectDates(data.overview.followers);
    data.posts.forEach(p => allDates.push(parseDate(p.date)));

    const latestDate = getLatestDate(allDates);
    console.log('[TikTok Filter] Latest date:', latestDate);
    console.log('[TikTok Filter] Sample post dates:', data.posts.slice(0, 3).map(p => ({ raw: p.date, parsed: parseDate(p.date) })));

    const filterMetrics = (metrics: TikTokMetric[]) => filterByDateRange(metrics, 'date', range, latestDate);

    const filteredOverview = {
        videoViews: filterMetrics(data.overview.videoViews),
        profileViews: filterMetrics(data.overview.profileViews),
        likes: filterMetrics(data.overview.likes),
        comments: filterMetrics(data.overview.comments),
        shares: filterMetrics(data.overview.shares),
        followers: filterMetrics(data.overview.followers),
    };

    const filteredPosts = filterByDateRange(data.posts, 'date', range, latestDate);
    console.log('[TikTok Filter] Filtered posts count:', filteredPosts.length);

    // Recalcular summary
    const totalViews = filteredPosts.reduce((acc, curr) => acc + curr.views, 0);
    const totalLikes = filteredPosts.reduce((acc, curr) => acc + curr.likes, 0);
    const totalComments = filteredPosts.reduce((acc, curr) => acc + curr.comments, 0);
    const totalShares = filteredPosts.reduce((acc, curr) => acc + curr.shares, 0);

    return {
        ...data,
        overview: filteredOverview,
        posts: filteredPosts,
        summary: {
            totalViews,
            totalLikes,
            totalComments,
            totalShares,
            totalPosts: filteredPosts.length,
            totalFollowers: data.summary.totalFollowers
        }
    };
};

export const filterYoutubeData = (data: ProcessedData, range: DateRange): ProcessedData => {
    console.log('[YouTube Filter] Range:', range);
    console.log('[YouTube Filter] Videos count:', data.videos.length);
    if (range === 'all') return data;

    const allDates: Date[] = [];
    data.videos.forEach(v => allDates.push(parseDate(v.horario_publicacao)));

    // Coletar datas das séries temporais também para garantir o latestDate correto
    data.deviceTypeTimeSeries?.forEach(d => allDates.push(parseDate(d.data)));
    data.operatingSystemTimeSeries?.forEach(d => allDates.push(parseDate(d.data)));
    data.trafficSourceTimeSeries?.forEach(d => allDates.push(parseDate(d.data)));
    data.countriesTimeSeries?.forEach(d => allDates.push(parseDate(d.data)));
    data.citiesTimeSeries?.forEach(d => allDates.push(parseDate(d.data)));

    const latestDate = getLatestDate(allDates);
    console.log('[YouTube Filter] Latest date:', latestDate);

    const filteredVideos = filterByDateRange(data.videos, 'horario_publicacao', range, latestDate);
    console.log('[YouTube Filter] Filtered videos count:', filteredVideos.length);

    // Helper para agregar dados de série temporal
    const aggregateTimeSeries = <T extends { data: string; visualizacoes_intencionais: number;[key: string]: any }, U>(
        timeSeriesData: T[] | undefined,
        groupKey: keyof T,
        outputMapper: (key: string, totalViews: number) => U
    ): U[] => {
        if (!timeSeriesData || timeSeriesData.length === 0) return [];

        const filtered = filterByDateRange(timeSeriesData, 'data', range, latestDate);
        const grouped: { [key: string]: number } = {};

        filtered.forEach(item => {
            const key = String(item[groupKey]);
            grouped[key] = (grouped[key] || 0) + item.visualizacoes_intencionais;
        });

        return Object.entries(grouped).map(([key, totalViews]) => outputMapper(key, totalViews));
    };

    // Agregar dados de série temporal para recalcular arrays estáticos
    const deviceType = aggregateTimeSeries(
        data.deviceTypeTimeSeries,
        'tipo_dispositivo',
        (tipo_dispositivo, visualizacoes_intencionais) => ({
            tipo_dispositivo,
            visualizacoes_intencionais,
            porcentagem_visualizada_media: 0,
            impressoes: 0,
            taxa_cliques_impressoes: 0,
            continuaram_assistindo: 0,
            espectadores_unicos: 0,
            media_visualizacoes_por_espectador: 0,
            hypes: 0,
            pontos_hype: 0,
            marcacoes_gostei: 0,
            marcacoes_nao_gostei: 0,
            gostei_vs_nao_gostei_pct: 0,
            compartilhamentos: 0,
            visualizacoes: 0,
            tempo_exibicao_horas: 0,
            duracao_media_visualizacao_segundos: 0
        })
    );

    const operatingSystem = aggregateTimeSeries(
        data.operatingSystemTimeSeries,
        'sistema_operacional',
        (sistema_operacional, visualizacoes_intencionais) => ({
            sistema_operacional,
            visualizacoes_intencionais,
            porcentagem_visualizada_media: 0,
            impressoes: 0,
            taxa_cliques_impressoes: 0,
            continuaram_assistindo: 0,
            espectadores_unicos: 0,
            media_visualizacoes_por_espectador: 0,
            hypes: 0,
            pontos_hype: 0,
            marcacoes_gostei: 0,
            marcacoes_nao_gostei: 0,
            gostei_vs_nao_gostei_pct: 0,
            compartilhamentos: 0,
            visualizacoes: 0,
            tempo_exibicao_horas: 0,
            duracao_media_visualizacao_segundos: 0
        })
    );

    const trafficSources = aggregateTimeSeries(
        data.trafficSourceTimeSeries,
        'origem_trafego',
        (origem, visualizacoes_intencionais) => ({
            origem,
            visualizacoes_intencionais,
            porcentagem_visualizada_media: 0,
            hypes: 0,
            pontos_hype: 0,
            visualizacoes: 0,
            tempo_exibicao_horas: 0,
            duracao_media_visualizacao_segundos: 0,
            impressoes: 0,
            taxa_cliques_impressoes: 0
        })
    );

    const countries = aggregateTimeSeries(
        data.countriesTimeSeries,
        'pais_codigo',
        (pais_codigo, visualizacoes_intencionais) => ({
            pais_codigo,
            pais_nome: pais_codigo,
            visualizacoes_intencionais,
            inscritos: 0,
            porcentagem_visualizada_media: 0,
            continuaram_assistindo: 0,
            inscricoes_obtidas: 0,
            inscricoes_perdidas: 0,
            marcacoes_gostei: 0,
            marcacoes_nao_gostei: 0,
            gostei_vs_nao_gostei_pct: 0,
            compartilhamentos: 0,
            comentarios_adicionados: 0,
            visualizacoes: 0,
            tempo_exibicao_horas: 0,
            duracao_media_visualizacao_segundos: 0
        })
    );

    const cities = aggregateTimeSeries(
        data.citiesTimeSeries,
        'cidade_id',
        (cidade_id, visualizacoes_intencionais) => ({
            cidade_id,
            nome_cidade: cidade_id,
            visualizacoes_intencionais,
            porcentagem_visualizada_media: 0,
            continuaram_assistindo: 0,
            visualizacoes: 0,
            tempo_exibicao_horas: 0,
            duracao_media_visualizacao_segundos: 0,
            impressoes: 0,
            taxa_cliques_impressoes: 0
        })
    );

    return {
        ...data,
        videos: filteredVideos,
        deviceType: deviceType.length > 0 ? deviceType : data.deviceType,
        operatingSystem: operatingSystem.length > 0 ? operatingSystem : data.operatingSystem,
        trafficSources: trafficSources.length > 0 ? trafficSources : data.trafficSources,
        countries: countries.length > 0 ? countries : data.countries,
        cities: cities.length > 0 ? cities : data.cities
    };
};

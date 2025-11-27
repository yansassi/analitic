// src/utils/comparisonUtils.ts
import { ProcessedData, InstagramData, TikTokData, PlatformComparison } from '../types';

/**
 * Extrai e normaliza métricas do YouTube para comparação
 */
export function extractYouTubeMetrics(data: ProcessedData): PlatformComparison {
    const totalViews = data.videos.reduce((sum, video) => sum + (video.visualizacoes || 0), 0);
    const totalLikes = data.videos.reduce((sum, video) => sum + (video.marcacoes_gostei || 0), 0);
    const totalComments = data.videos.reduce((sum, video) => sum + (video.comentarios_adicionados || 0), 0);
    const totalShares = data.videos.reduce((sum, video) => sum + (video.compartilhamentos || 0), 0);
    const totalSubscribers = data.videos.reduce((sum, video) => sum + (video.inscricoes_obtidas || 0), 0);

    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    const totalPosts = data.videos.length;
    const avgViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0;

    return {
        platform: 'youtube',
        platformName: 'YouTube',
        color: '#FF0000',
        totalViews,
        totalReach: totalViews, // YouTube não tem métrica de alcance separada, usa views
        totalEngagement,
        engagementRate,
        followersGrowth: totalSubscribers,
        totalPosts,
        avgViewsPerPost,
        saves: totalSubscribers, // Inscrições obtidas
    };
}

/**
 * Extrai e normaliza métricas do Instagram para comparação
 */
export function extractInstagramMetrics(data: InstagramData): PlatformComparison {
    const totalViews = data.posts.reduce((sum, post) => sum + (post.visualizacoes || 0), 0);
    const totalReach = data.resumo.totalAlcance || 0;
    const totalLikes = data.posts.reduce((sum, post) => sum + (post.curtidas || 0), 0);
    const totalComments = data.posts.reduce((sum, post) => sum + (post.comentarios || 0), 0);
    const totalShares = data.posts.reduce((sum, post) => sum + (post.compartilhamentos || 0), 0);
    const totalSaves = data.resumo.totalSalvamentos || 0;
    const followersGrowth = data.resumo.totalSeguidoresGanhos || 0;

    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    const totalPosts = data.posts.length;
    const avgViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0;

    return {
        platform: 'instagram',
        platformName: 'Instagram',
        color: '#E4405F',
        totalViews,
        totalReach,
        totalEngagement,
        engagementRate,
        followersGrowth,
        totalPosts,
        avgViewsPerPost,
        saves: totalSaves,
    };
}

/**
 * Extrai e normaliza métricas do TikTok para comparação
 */
export function extractTikTokMetrics(data: TikTokData): PlatformComparison {
    const totalViews = data.summary.totalViews || 0;
    const totalLikes = data.summary.totalLikes || 0;
    const totalComments = data.summary.totalComments || 0;
    const totalShares = data.summary.totalShares || 0;
    const followersGrowth = data.summary.totalFollowers || 0;

    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    const totalPosts = data.summary.totalPosts || 0;
    const avgViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0;

    return {
        platform: 'tiktok',
        platformName: 'TikTok',
        color: '#000000',
        totalViews,
        totalReach: totalViews, // TikTok não tem métrica de alcance separada, usa views
        totalEngagement,
        engagementRate,
        followersGrowth,
        totalPosts,
        avgViewsPerPost,
        saves: 0, // TikTok não exporta salvamentos
    };
}

/**
 * Determina qual plataforma tem o melhor desempenho em uma métrica específica
 */
export function getBestPerformer(
    platforms: PlatformComparison[],
    metric: keyof Omit<PlatformComparison, 'platform' | 'platformName' | 'color'>
): string {
    if (platforms.length === 0) return '';

    const best = platforms.reduce((prev, current) => {
        return (current[metric] as number) > (prev[metric] as number) ? current : prev;
    });

    return best.platformName;
}

/**
 * Formata número grande de forma abreviada (1K, 1M, etc)
 */
export function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toFixed(0);
}

/**
 * Formata porcentagem com 2 casas decimais
 */
export function formatPercentage(num: number): string {
    return `${num.toFixed(2)}%`;
}

/**
 * Calcula a diferença percentual entre duas métricas
 */
export function calculateDifference(value1: number, value2: number): number {
    if (value2 === 0) return 0;
    return ((value1 - value2) / value2) * 100;
}

/**
 * Retorna cor da plataforma
 */
export function getPlatformColor(platform: 'youtube' | 'instagram' | 'tiktok'): string {
    const colors = {
        youtube: '#FF0000',
        instagram: '#E4405F',
        tiktok: '#000000',
    };
    return colors[platform];
}

/**
 * Retorna cor Tailwind da plataforma
 */
export function getPlatformTailwindColor(platform: 'youtube' | 'instagram' | 'tiktok'): string {
    const colors = {
        youtube: 'red',
        instagram: 'pink',
        tiktok: 'gray',
    };
    return colors[platform];
}

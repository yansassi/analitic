// src/types.ts

// --- TIPOS DO YOUTUBE (MANTIDOS - Não apague) ---
export interface VideoData {
  id: string;
  titulo: string;
  horario_publicacao: string;
  duracao_segundos: number;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  continuaram_assistindo: number;
  espectadores_unicos: number;
  media_visualizacoes_por_espectador: number;
  novos_espectadores: number;
  espectadores_recorrentes: number;
  espectadores_casuais: number;
  hypes: number;
  inscricoes_obtidas: number;
  inscricoes_perdidas: number;
  pontos_hype: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  gostei_vs_nao_gostei_pct: number;
  compartilhamentos: number;
  comentarios_adicionados: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  inscritos: number;
  duracao_media_visualizacao_segundos: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
}

export interface CountryData {
  pais_codigo: string;
  pais_nome: string;
  visualizacoes_intencionais: number;
  inscritos: number;
  porcentagem_visualizada_media: number;
  continuaram_assistindo: number;
  inscricoes_obtidas: number;
  inscricoes_perdidas: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  gostei_vs_nao_gostei_pct: number;
  compartilhamentos: number;
  comentarios_adicionados: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface CityData {
  cidade_id: string;
  nome_cidade: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  continuaram_assistindo: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface TrafficSourceData {
  origem: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  hypes: number;
  pontos_hype: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
}

export interface DemographicData {
  tipo: string;
  categoria: string;
  visualizacoes_pct: number;
  tempo_exibicao_horas_pct: number;
  visualizacoes_intencionais_pct: number;
  continuaram_assistindo_pct: number;
  porcentagem_visualizada_media: number;
  duracao_media_visualizacao_segundos: number;
}

export interface NewRecurrentData {
  tipo_espectador: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  hypes: number;
  pontos_hype: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface SubscriptionOriginData {
  origem_inscricao: string;
  inscritos: number;
  inscricoes_obtidas: number;
  inscricoes_perdidas: number;
}

export interface SubscriptionStatusData {
  status_inscricao: string;
  visualizacoes_intencionais: number;
  inscritos: number;
  porcentagem_visualizada_media: number;
  continuaram_assistindo: number;
  hypes: number;
  pontos_hype: number;
  inscricoes_obtidas: number;
  inscricoes_perdidas: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  gostei_vs_nao_gostei_pct: number;
  compartilhamentos: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface ContentTypeData {
  tipo_conteudo: string;
  visualizacoes_intencionais: number;
  inscritos: number;
  porcentagem_visualizada_media: number;
  videos_publicados: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
  continuaram_assistindo: number;
  espectadores_unicos: number;
  novos_espectadores: number;
  espectadores_recorrentes: number;
  espectadores_casuais: number;
  hypes: number;
  pontos_hype: number;
  inscricoes_obtidas: number;
  inscricoes_perdidas: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  gostei_vs_nao_gostei_pct: number;
  compartilhamentos: number;
  comentarios_adicionados: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface DeviceTypeData {
  tipo_dispositivo: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
  continuaram_assistindo: number;
  espectadores_unicos: number;
  media_visualizacoes_por_espectador: number;
  hypes: number;
  pontos_hype: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  gostei_vs_nao_gostei_pct: number;
  compartilhamentos: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface OperatingSystemData {
  sistema_operacional: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
  espectadores_unicos: number;
  media_visualizacoes_por_espectador: number;
  continuaram_assistindo: number;
  hypes: number;
  pontos_hype: number;
  marcacoes_gostei: number;
  marcacoes_nao_gostei: number;
  compartilhamentos: number;
  gostei_vs_nao_gostei_pct: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface AudienceBehaviorData {
  tipo_publico: string;
  visualizacoes_intencionais: number;
  porcentagem_visualizada_media: number;
  hypes: number;
  pontos_hype: number;
  comentarios_adicionados: number;
  impressoes: number;
  taxa_cliques_impressoes: number;
  visualizacoes: number;
  tempo_exibicao_horas: number;
  duracao_media_visualizacao_segundos: number;
}

export interface TimeSeriesData {
  data: string;
  visualizacoes_intencionais: number;
  visualizacoes?: number;
  tempo_exibicao_horas?: number;
  [key: string]: any;
}

export interface DeviceTypeTimeSeriesData {
  data: string;
  tipo_dispositivo: string;
  visualizacoes_intencionais: number;
}

export interface ProcessedData {
  videos: VideoData[];
  countries: CountryData[];
  cities: CityData[];
  trafficSources: TrafficSourceData[];
  demographics: DemographicData[];
  newRecurrent: NewRecurrentData[];
  subscriptionOrigin: SubscriptionOriginData[];
  subscriptionStatus: SubscriptionStatusData[];
  contentType: ContentTypeData[];
  deviceType: DeviceTypeData[];
  deviceTypeTimeSeries?: DeviceTypeTimeSeriesData[];
  operatingSystem: OperatingSystemData[];
  audienceBehavior: AudienceBehaviorData[];
  timeSeries?: TimeSeriesData[];
}

// --- NOVOS TIPOS DO INSTAGRAM ---

export interface InstagramMetric {
  data: string;
  valor: number;
}

export interface InstagramDemographic {
  categoria: string;
  valorMulheres?: number;
  valorHomens?: number;
  valorTotal?: number;
  porcentagem?: number;
}

export interface InstagramPage {
  nome: string;
  porcentagem: number;
}

export interface InstagramPost {
  id: string;
  data: string;
  descricao: string;
  tipo: string;
  link: string;
  visualizacoes: number;
  alcance: number;
  curtidas: number;
  comentarios: number;
  compartilhamentos: number;
  salvamentos: number;
}

export interface InstagramData {
  visualizacoes: InstagramMetric[];
  visitasPerfil: InstagramMetric[];
  seguidores: InstagramMetric[];
  alcance: InstagramMetric[];
  impressoes: InstagramMetric[];
  interacoes: InstagramMetric[];
  cliquesLink: InstagramMetric[];

  publicoIdadeGenero: InstagramDemographic[];
  publicoCidades: InstagramDemographic[];
  publicoPaises: InstagramDemographic[];
  publicoPaginas: InstagramPage[];

  posts: InstagramPost[];

  resumo: {
    totalVisualizacoes: number;
    totalVisitas: number;
    totalSeguidoresGanhos: number;
    totalAlcance: number;
    totalInteracoes: number;
    totalCliquesLink: number;
    totalSalvamentos: number;
  };
}
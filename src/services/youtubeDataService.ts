import { supabase } from '../lib/supabase';
import { ProcessedData } from '../types';

export const saveYoutubeAnalysis = async (data: ProcessedData, analysisName: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario nao autenticado');
    }

    const totalViews = data.videos.reduce((sum, v) => sum + v.visualizacoes, 0);
    const totalWatchTime = data.videos.reduce((sum, v) => sum + v.tempo_exibicao_horas, 0);

    const { data: analysis, error: analysisError } = await supabase
      .from('youtube_analyses')
      .insert({
        user_id: user.id,
        name: analysisName,
        upload_date: new Date().toISOString(),
        total_videos: data.videos.length,
        total_views: totalViews,
        total_watch_time: totalWatchTime,
      })
      .select()
      .maybeSingle();

    if (analysisError) throw analysisError;
    if (!analysis) throw new Error('Falha ao criar analise');

    const analysisId = analysis.id;

    const videoInserts = data.videos
      .filter(video => video.id && video.id.trim() !== '')
      .map(video => ({
        analysis_id: analysisId,
        video_id: video.id.trim(),
        title: video.titulo && video.titulo.trim() !== '' ? video.titulo.trim() : 'Sem titulo',
        published_at: video.horario_publicacao && video.horario_publicacao.trim() !== ''
          ? video.horario_publicacao.trim()
          : null,
        duration_seconds: video.duracao_segundos || 0,
        views: video.visualizacoes || 0,
        watch_time_hours: video.tempo_exibicao_horas || 0,
        subscribers_gained: video.inscricoes_obtidas || 0,
        likes: video.marcacoes_gostei || 0,
        comments: video.comentarios_adicionados || 0,
        shares: video.compartilhamentos || 0,
        ctr: video.taxa_cliques_impressoes || 0,
        retention_rate: video.porcentagem_visualizada_media || 0,
        all_data: video,
      }));

    if (videoInserts.length > 0) {
      const { error: videosError } = await supabase
        .from('youtube_videos')
        .insert(videoInserts);

      if (videosError) throw videosError;
    }

    if (data.countries.length > 0) {
      const countryInserts = data.countries.map(country => ({
        analysis_id: analysisId,
        country_code: country.pais_codigo || 'XX',
        country_name: country.pais_nome || 'Desconhecido',
        views: country.visualizacoes || 0,
        watch_time_hours: country.tempo_exibicao_horas || 0,
        subscribers_gained: country.inscricoes_obtidas || 0,
        all_data: country,
      }));

      await supabase.from('youtube_pais').insert(countryInserts);
    }

    if (data.cities.length > 0) {
      const cityInserts = data.cities.map(city => ({
        analysis_id: analysisId,
        city_id: city.cidade_id || 'unknown',
        city_name: city.nome_cidade || 'Desconhecido',
        views: city.visualizacoes || 0,
        watch_time_hours: city.tempo_exibicao_horas || 0,
        all_data: city,
      }));

      await supabase.from('youtube_cidades').insert(cityInserts);
    }

    if (data.trafficSources.length > 0) {
      const trafficInserts = data.trafficSources.map(traffic => ({
        analysis_id: analysisId,
        source: traffic.origem || 'Desconhecido',
        views: traffic.visualizacoes || 0,
        watch_time_hours: traffic.tempo_exibicao_horas || 0,
        ctr: traffic.taxa_cliques_impressoes || 0,
        all_data: traffic,
      }));

      await supabase.from('youtube_origem_trafego').insert(trafficInserts);
    }

    if (data.contentType.length > 0) {
      const contentTypeInserts = data.contentType.map(content => ({
        analysis_id: analysisId,
        content_type: content.tipo_conteudo || 'Desconhecido',
        views: content.visualizacoes || 0,
        watch_time_hours: content.tempo_exibicao_horas || 0,
        videos_published: content.videos_publicados || 0,
        subscribers_gained: content.inscricoes_obtidas || 0,
        all_data: content,
      }));

      await supabase.from('youtube_tipo_conteudo').insert(contentTypeInserts);
    }

    if (data.deviceType.length > 0) {
      const deviceInserts = data.deviceType.map(device => ({
        analysis_id: analysisId,
        device_type: device.tipo_dispositivo || 'Desconhecido',
        views: device.visualizacoes || 0,
        watch_time_hours: device.tempo_exibicao_horas || 0,
        all_data: device,
      }));

      await supabase.from('youtube_tipo_dispositivo').insert(deviceInserts);
    }

    if (data.newRecurrent.length > 0) {
      const newRecurrentInserts = data.newRecurrent.map(nr => ({
        analysis_id: analysisId,
        viewer_type: nr.tipo_espectador || 'Desconhecido',
        views: nr.visualizacoes || 0,
        watch_time_hours: nr.tempo_exibicao_horas || 0,
        all_data: nr,
      }));

      await supabase.from('youtube_espectadores_tipo').insert(newRecurrentInserts);
    }

    if (data.subscriptionStatus.length > 0) {
      const subscriptionInserts = data.subscriptionStatus.map(sub => ({
        analysis_id: analysisId,
        subscription_status: sub.status_inscricao || 'Desconhecido',
        views: sub.visualizacoes || 0,
        watch_time_hours: sub.tempo_exibicao_horas || 0,
        subscribers_gained: sub.inscricoes_obtidas || 0,
        all_data: sub,
      }));

      await supabase.from('youtube_status_inscricao').insert(subscriptionInserts);
    }

    if (data.demographics.length > 0) {
      const genderData = data.demographics.filter(d => d.tipo === 'Genero');
      const ageData = data.demographics.filter(d => d.tipo === 'Idade');

      if (genderData.length > 0) {
        const genderInserts = genderData.map(gender => ({
          analysis_id: analysisId,
          gender: gender.categoria || 'Desconhecido',
          views_percentage: gender.visualizacoes_pct || 0,
          watch_time_percentage: gender.tempo_exibicao_horas_pct || 0,
          all_data: gender,
        }));

        await supabase.from('youtube_genero').insert(genderInserts);
      }

      if (ageData.length > 0) {
        const ageInserts = ageData.map(age => ({
          analysis_id: analysisId,
          age_range: age.categoria || 'Desconhecido',
          views_percentage: age.visualizacoes_pct || 0,
          watch_time_percentage: age.tempo_exibicao_horas_pct || 0,
          all_data: age,
        }));

        await supabase.from('youtube_idade').insert(ageInserts);
      }
    }

    if (data.audienceBehavior.length > 0) {
      const behaviorInserts = data.audienceBehavior.map(behavior => ({
        analysis_id: analysisId,
        audience_type: behavior.tipo_publico || 'Desconhecido',
        views: behavior.visualizacoes || 0,
        watch_time_hours: behavior.tempo_exibicao_horas || 0,
        all_data: behavior,
      }));

      await supabase.from('youtube_comportamento_visualizacao').insert(behaviorInserts);
    }

    const { error: fullAnalysisError } = await supabase
      .from('youtube_analysis_data')
      .insert({
        analysis_id: analysisId,
        data_type: 'full_analysis',
        data: data,
      })
      .select()
      .maybeSingle();

    if (fullAnalysisError) {
      console.warn('Erro ao salvar dados completos:', fullAnalysisError);
    }

    return { success: true, analysisId };
  } catch (error) {
    console.error('Erro ao salvar analise:', error);
    throw error;
  }
};

export const getUserAnalyses = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('youtube_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar analises:', error);
    return [];
  }
};

export const getAnalysisById = async (analysisId: string) => {
  try {
    const { data: analysisData, error: analysisError } = await supabase
      .from('youtube_analysis_data')
      .select('data')
      .eq('analysis_id', analysisId)
      .maybeSingle();

    if (analysisError) throw analysisError;

    return analysisData?.data || null;
  } catch (error) {
    console.error('Erro ao buscar analise:', error);
    return null;
  }
};

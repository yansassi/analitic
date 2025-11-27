import { supabase } from '../lib/supabase';
import { InstagramData } from '../types';

export const saveInstagramAnalysis = async (data: InstagramData, analysisName: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Usuario nao autenticado');
        }

        // Cria a entrada na tabela principal de análises
        const { data: analysis, error: analysisError } = await supabase
            .from('instagram_analyses')
            .insert({
                user_id: user.id,
                name: analysisName,
                upload_date: new Date().toISOString(),
            })
            .select()
            .maybeSingle();

        if (analysisError) throw analysisError;
        if (!analysis) throw new Error('Falha ao criar analise do Instagram');

        const analysisId = analysis.id;

        // Salva o JSON completo dos dados
        const { error: dataError } = await supabase
            .from('instagram_analysis_data')
            .insert({
                analysis_id: analysisId,
                data_type: 'full_analysis',
                data: data,
            });

        if (dataError) throw dataError;

        return { success: true, analysisId };
    } catch (error) {
        console.error('Erro ao salvar analise do Instagram:', error);
        throw error;
    }
};

export const getUserInstagramAnalyses = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('instagram_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Erro ao buscar analises do Instagram:', error);
        return [];
    }
};

export const getInstagramAnalysisById = async (analysisId: string) => {
    try {
        const { data: analysisData, error: analysisError } = await supabase
            .from('instagram_analysis_data')
            .select('data')
            .eq('analysis_id', analysisId)
            .maybeSingle();

        if (analysisError) throw analysisError;

        return analysisData?.data as InstagramData || null;
    } catch (error) {
        console.error('Erro ao buscar dados da analise do Instagram:', error);
        return null;
    }
};

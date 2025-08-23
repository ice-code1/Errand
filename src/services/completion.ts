import { supabase } from './supabase';

export const completionService = {
  async generateCompletionCode(taskId: string) {
    const { data, error } = await supabase.rpc('create_task_completion_code', {
      p_task_id: taskId
    });

    if (error) throw error;
    return data;
  },

  async useCompletionCode(code: string, taskId: string) {
    const { data, error } = await supabase.rpc('use_completion_code', {
      p_code: code,
      p_task_id: taskId
    });

    if (error) throw error;
    return data;
  },

  async getTaskCompletionCode(taskId: string) {
    const { data, error } = await supabase
      .from('task_completion_codes')
      .select('code, expires_at, is_used')
      .eq('task_id', taskId)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
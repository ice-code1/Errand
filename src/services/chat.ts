import { supabase } from './supabase';
import type { Database } from '../types/database';

type Message = Database['public']['Tables']['messages']['Row'];

export const chatService = {
  async sendMessage(taskId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: user.id,
        content,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(taskId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  subscribeToMessages(taskId: string, callback: (message: Message & { sender: any }) => void) {
    return supabase
      .channel(`messages:${taskId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `task_id=eq.${taskId}` },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          callback({ ...payload.new as Message, sender });
        }
      )
      .subscribe();
  },
};
import { supabase } from './supabase';
import type { Database } from '../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type Bid = Database['public']['Tables']['bids']['Row'];

export const taskService = {
  async createTask(task: Omit<TaskInsert, 'creator_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, creator_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTasks(filters?: { 
    category?: string; 
    status?: string; 
    isCommuter?: boolean;
    userId?: string;
  }) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        creator:profiles!tasks_creator_id_fkey(full_name, avatar_url),
        runner:profiles!tasks_runner_id_fkey(full_name, avatar_url),
        bids(id, amount, status, runner:profiles!bids_runner_id_fkey(full_name, avatar_url))
      `)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.isCommuter !== undefined) {
      query = query.eq('is_commuter_pickup', filters.isCommuter);
    }

    if (filters?.userId) {
      query = query.or(`creator_id.eq.${filters.userId},runner_id.eq.${filters.userId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        creator:profiles!tasks_creator_id_fkey(full_name, avatar_url, phone),
        runner:profiles!tasks_runner_id_fkey(full_name, avatar_url, phone),
        bids(
          id, amount, message, status, created_at,
          runner:profiles!bids_runner_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createBid(taskId: string, amount: number, message?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bids')
      .insert({
        task_id: taskId,
        runner_id: user.id,
        amount,
        message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acceptBid(bidId: string, taskId: string, runnerId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update bid status
    const { error: bidError } = await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', bidId);

    if (bidError) throw bidError;

    // Reject other bids
    const { error: rejectError } = await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('task_id', taskId)
      .neq('id', bidId);

    if (rejectError) throw rejectError;

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'accepted',
        runner_id: runnerId 
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToTasks(callback: (task: Task) => void) {
    return supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
      .subscribe();
  },

  subscribeToBids(taskId: string, callback: (bid: Bid) => void) {
    return supabase
      .channel(`bids:${taskId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bids', filter: `task_id=eq.${taskId}` }, 
        callback
      )
      .subscribe();
  },
};
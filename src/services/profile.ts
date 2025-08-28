import { supabase } from './supabase';
import type { Database } from '../types/database';

//type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  async updateProfile(updates: Omit<ProfileUpdate, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProfile(userId?: string) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) throw new Error('No user ID provided');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`; // keep it simple, no extra "profile-images" folder

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    await this.updateProfile({ avatar_url: data.publicUrl });

    return data.publicUrl;
  },


  async getUserStats(userId?: string) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) throw new Error('No user ID provided');

    // Get tasks created by user
    const { data: createdTasks } = await supabase
      .from('tasks')
      .select('id, status, budget')
      .eq('creator_id', targetUserId);

    // Get tasks completed as runner
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('id, budget')
      .eq('runner_id', targetUserId)
      .eq('status', 'completed');

    // Get user reviews
    const { data: reviews } = await supabase
      .from('task_reviews')
      .select('rating')
      .eq('reviewee_id', targetUserId);

    const totalEarnings = completedTasks?.reduce((sum, task) => sum + task.budget, 0) || 0;
    const averageRating = reviews?.length 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return {
      tasksCreated: createdTasks?.length || 0,
      tasksCompleted: completedTasks?.length || 0,
      totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews?.length || 0,
    };
  },

  async getRecentActivity(userId?: string, limit: number = 5) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) throw new Error('No user ID provided');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id, title, description, category, budget, status, created_at, updated_at,
        creator:profiles!tasks_creator_id_fkey(full_name),
        runner:profiles!tasks_runner_id_fkey(full_name)
      `)
      .or(`creator_id.eq.${targetUserId},runner_id.eq.${targetUserId}`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async updateNotificationSettings(settings: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    task_updates?: boolean;
    bid_notifications?: boolean;
    message_notifications?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // This would typically be stored in a separate user_settings table
    // For now, we'll store it in the profiles table as a JSON field
    const { data, error } = await supabase
      .from('profiles')
      .update({
        // Assuming we add a notification_settings jsonb column to profiles
        // notification_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
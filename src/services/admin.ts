import { supabase } from './supabase';

export interface AdminStats {
  overview: {
    total_users: number;
    total_runners: number;
    new_users_this_month: number;
  };
  tasks: {
    total_tasks: number;
    completed_tasks: number;
    active_tasks: number;
    completion_rate: number;
  };
  revenue: {
    total_revenue: number;
    average_task_value: number;
    revenue_this_month: number;
  };
  activity: {
    total_bids: number;
    total_messages: number;
    daily_active_users: number;
  };
}

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  total_tasks: number;
  new_tasks_today: number;
  completed_tasks: number;
  active_tasks: number;
  total_bids: number;
  messages_today: number;
  avg_task_value: number;
  total_runners: number;
}

export interface UserActivity {
  id: string;
  full_name: string;
  email: string;
  is_runner: boolean;
  joined_date: string;
  tasks_created: number;
  tasks_completed: number;
  bids_placed: number;
  avg_rating: number;
  messages_sent: number;
  last_activity: string;
}

export interface TaskMetrics {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  created_at: string;
  updated_at: string;
  creator_name: string;
  runner_name: string;
  bid_count: number;
  lowest_bid: number;
  highest_bid: number;
  message_count: number;
  completion_time: string;
}

export interface SystemLog {
  id: string;
  event_type: string;
  event_data: any;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AnalyticsData {
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  total_tasks: number;
  new_tasks: number;
  completed_tasks: number;
  cancelled_tasks: number;
  total_bids: number;
  accepted_bids: number;
  total_messages: number;
  total_revenue: number;
  average_task_value: number;
  average_completion_time: string;
  top_categories: Array<{ category: string; count: number }>;
}

export const adminService = {
  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

      if (error) {
      console.error("Error fetching admin status:", error);
      return false;
    } 

    return !!data;
  },

  // Get admin role
  async getAdminRole(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return data?.role || null;
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats | null> {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get comprehensive admin statistics
  async getAdminStatistics(): Promise<AdminStats> {
    const { data, error } = await supabase.rpc('get_admin_statistics');
    if (error) throw error;
    return data;
  },

  // Get user activity summary
  async getUserActivity(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity_summary')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Get task performance metrics
  async getTaskMetrics(limit: number = 50, offset: number = 0): Promise<TaskMetrics[]> {
    const { data, error } = await supabase
      .from('task_performance_metrics')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Get system logs
  async getSystemLogs(
    eventType?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<SystemLog[]> {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get analytics data
  async getAnalytics(days: number = 30): Promise<AnalyticsData[]> {
    const { data, error } = await supabase
      .from('app_analytics')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Calculate daily analytics
  async calculateDailyAnalytics(date?: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_daily_analytics', {
      target_date: date || new Date().toISOString().split('T')[0]
    });

    if (error) throw error;
  },

  // Log system event
  async logSystemEvent(
    eventType: string,
    eventData: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.rpc('log_system_event', {
      p_event_type: eventType,
      p_event_data: eventData,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null
    });

    if (error) throw error;
  },

  // Get admin settings
  async getSettings(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('key, value');

    if (error) throw error;

    const settings: Record<string, any> = {};
    data?.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return settings;
  },

  // Update admin setting
  async updateSetting(key: string, value: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Add admin user
  async addAdminUser(userId: string, role: string = 'admin'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role,
        created_by: user?.id
      });

    if (error) throw error;
  },

  // Remove admin user
  async removeAdminUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get all admin users
  async getAdminUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        profile:profiles!admin_users_user_id_fkey(full_name, email),
        created_by_profile:profiles!admin_users_created_by_fkey(full_name)
      `);

    if (error) throw error;
    return data || [];
  },

  // Search users
  async searchUsers(query: string, limit: number = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_runner, created_at')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get task categories analytics
  async getCategoryAnalytics(): Promise<Array<{ category: string; count: number; revenue: number }>> {
    const { data, error } = await supabase
      .from('tasks')
      .select('category, budget, status')
      .eq('status', 'completed');

    if (error) throw error;

    const categoryStats: Record<string, { count: number; revenue: number }> = {};
    
    data?.forEach(task => {
      if (!categoryStats[task.category]) {
        categoryStats[task.category] = { count: 0, revenue: 0 };
      }
      categoryStats[task.category].count++;
      categoryStats[task.category].revenue += task.budget;
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      revenue: stats.revenue
    }));
  },

  // Get user growth data
  async getUserGrowthData(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const growthData: Record<string, number> = {};
    
    data?.forEach(profile => {
      const date = profile.created_at.split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    return Object.entries(growthData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
};
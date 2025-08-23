import { supabase } from './supabase';
import type { Database } from '../types/database';

type LocationTracking = Database['public']['Tables']['location_tracking']['Row'];
type ProximityAlert = Database['public']['Tables']['proximity_alerts']['Row'];

export const locationService = {
  async startLocationTracking(taskId: string) {
    const { data, error } = await supabase.rpc('start_location_tracking', {
      p_task_id: taskId
    });

    if (error) throw error;
    return data;
  },

  async updateRunnerLocation(
    taskId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    heading?: number,
    speed?: number
  ) {
    const { data, error } = await supabase.rpc('update_runner_location', {
      p_task_id: taskId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_accuracy: accuracy,
      p_heading: heading,
      p_speed: speed
    });

    if (error) throw error;
    return data;
  },

  async getLocationHistory(taskId: string) {
    const { data, error } = await supabase
      .from('location_tracking')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  },

  async getLatestLocation(taskId: string) {
    const { data, error } = await supabase
      .from('location_tracking')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getProximityAlerts(taskId: string) {
    const { data, error } = await supabase
      .from('proximity_alerts')
      .select('*')
      .eq('task_id', taskId)
      .order('alert_sent_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async acknowledgeProximityAlert(alertId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('proximity_alerts')
      .update({
        acknowledged_by_runner: true,
        acknowledged_by_creator: true
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToLocationUpdates(taskId: string, callback: (location: LocationTracking) => void) {
    return supabase
      .channel(`location:${taskId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'location_tracking', filter: `task_id=eq.${taskId}` },
        (payload) => callback(payload.new as LocationTracking)
      )
      .subscribe();
  },

  subscribeToProximityAlerts(taskId: string, callback: (alert: ProximityAlert) => void) {
    return supabase
      .channel(`proximity:${taskId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'proximity_alerts', filter: `task_id=eq.${taskId}` },
        (payload) => callback(payload.new as ProximityAlert)
      )
      .subscribe();
  },

  // Get user's current location
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Watch user's location
  watchLocation(callback: (position: GeolocationPosition) => void): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(
      callback,
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  },

  clearLocationWatch(watchId: number) {
    navigator.geolocation.clearWatch(watchId);
  }
};
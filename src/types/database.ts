export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_runner: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_runner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_runner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          budget: number;
          location_pickup: string | null;
          location_delivery: string | null;
          latitude_pickup: number | null;
          longitude_pickup: number | null;
          latitude_delivery: number | null;
          longitude_delivery: number | null;
          status: 'posted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          creator_id: string;
          runner_id: string | null;
          image_urls: string[] | null;
          is_commuter_pickup: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          budget: number;
          location_pickup?: string | null;
          location_delivery?: string | null;
          latitude_pickup?: number | null;
          longitude_pickup?: number | null;
          latitude_delivery?: number | null;
          longitude_delivery?: number | null;
          status?: 'posted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          creator_id: string;
          runner_id?: string | null;
          image_urls?: string[] | null;
          is_commuter_pickup?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          budget?: number;
          location_pickup?: string | null;
          location_delivery?: string | null;
          latitude_pickup?: number | null;
          longitude_pickup?: number | null;
          latitude_delivery?: number | null;
          longitude_delivery?: number | null;
          status?: 'posted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          creator_id?: string;
          runner_id?: string | null;
          image_urls?: string[] | null;
          is_commuter_pickup?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bids: {
        Row: {
          id: string;
          task_id: string;
          runner_id: string;
          amount: number;
          message: string | null;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          runner_id: string;
          amount: number;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          runner_id?: string;
          amount?: number;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          task_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
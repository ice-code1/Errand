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
          kyc_verified: boolean;
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
          kyc_verified?: boolean;
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
          kyc_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      kyc_verifications: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          phone_number: string;
          address: string;
          city: string;
          state: string;
          id_type: 'national_id' | 'drivers_license' | 'passport' | 'voters_card';
          id_number: string;
          id_document_url: string | null;
          selfie_url: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'under_review';
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          phone_number: string;
          address: string;
          city: string;
          state: string;
          id_type: 'national_id' | 'drivers_license' | 'passport' | 'voters_card';
          id_number: string;
          id_document_url?: string | null;
          selfie_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          phone_number?: string;
          address?: string;
          city?: string;
          state?: string;
          id_type?: 'national_id' | 'drivers_license' | 'passport' | 'voters_card';
          id_number?: string;
          id_document_url?: string | null;
          selfie_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'under_review';
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_completion_codes: {
        Row: {
          id: string;
          task_id: string;
          code: string;
          generated_at: string;
          expires_at: string;
          used_at: string | null;
          is_used: boolean;
        };
        Insert: {
          id?: string;
          task_id: string;
          code: string;
          generated_at?: string;
          expires_at: string;
          used_at?: string | null;
          is_used?: boolean;
        };
        Update: {
          id?: string;
          task_id?: string;
          code?: string;
          generated_at?: string;
          expires_at?: string;
          used_at?: string | null;
          is_used?: boolean;
        };
      };
      proximity_alerts: {
        Row: {
          id: string;
          task_id: string;
          runner_id: string;
          creator_id: string;
          distance: number;
          alert_sent_at: string;
          acknowledged_by_runner: boolean;
          acknowledged_by_creator: boolean;
        };
        Insert: {
          id?: string;
          task_id: string;
          runner_id: string;
          creator_id: string;
          distance: number;
          alert_sent_at?: string;
          acknowledged_by_runner?: boolean;
          acknowledged_by_creator?: boolean;
        };
        Update: {
          id?: string;
          task_id?: string;
          runner_id?: string;
          creator_id?: string;
          distance?: number;
          alert_sent_at?: string;
          acknowledged_by_runner?: boolean;
          acknowledged_by_creator?: boolean;
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
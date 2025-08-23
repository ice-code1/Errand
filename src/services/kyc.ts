import { supabase } from './supabase';
import type { Database } from '../types/database';

type KYCVerification = Database['public']['Tables']['kyc_verifications']['Row'];
type KYCInsert = Database['public']['Tables']['kyc_verifications']['Insert'];
type KYCUpdate = Database['public']['Tables']['kyc_verifications']['Update'];

export const kycService = {
  async getKYCStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async submitKYC(kycData: Omit<KYCInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        ...kycData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateKYC(updates: Omit<KYCUpdate, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadDocument(file: File, type: 'id_document' | 'selfie') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('id_documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async checkKYCVerified() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('kyc_verified')
      .eq('id', user.id)
      .single();

    return data?.kyc_verified || false;
  },
};
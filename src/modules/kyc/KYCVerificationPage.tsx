import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycService } from '../../services/kyc';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { 
  Shield, Upload, CheckCircle, Clock, XCircle, 
  AlertTriangle, Camera, FileText 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ID_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'voters_card', label: "Voter's Card" },
];

export const KYCVerificationPage: React.FC = () => {
  const [kycData, setKycData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    idType: '',
    idNumber: '',
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const status = await kycService.getKYCStatus();
      setKycStatus(status);
      
      if (status) {
        setKycData({
          firstName: status.first_name,
          lastName: status.last_name,
          dateOfBirth: status.date_of_birth,
          phoneNumber: status.phone_number,
          address: status.address,
          city: status.city,
          state: status.state,
          idType: status.id_type,
          idNumber: status.id_number,
        });
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (type: 'id' | 'selfie', file: File | null) => {
    if (type === 'id') {
      setIdDocument(file);
    } else {
      setSelfie(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!kycData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!kycData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!kycData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!kycData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!kycData.address.trim()) newErrors.address = 'Address is required';
    if (!kycData.city.trim()) newErrors.city = 'City is required';
    if (!kycData.state.trim()) newErrors.state = 'State is required';
    if (!kycData.idType) newErrors.idType = 'ID type is required';
    if (!kycData.idNumber.trim()) newErrors.idNumber = 'ID number is required';

    if (!kycStatus && !idDocument) newErrors.idDocument = 'ID document is required';
    if (!kycStatus && !selfie) newErrors.selfie = 'Selfie is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let idDocumentUrl = kycStatus?.id_document_url;
      let selfieUrl = kycStatus?.selfie_url;

      // Upload documents if new ones are provided
      if (idDocument) {
        setUploading(true);
        idDocumentUrl = await kycService.uploadDocument(idDocument, 'id_document');
      }

      if (selfie) {
        setUploading(true);
        selfieUrl = await kycService.uploadDocument(selfie, 'selfie');
      }

      setUploading(false);

      const kycPayload = {
        first_name: kycData.firstName,
        last_name: kycData.lastName,
        date_of_birth: kycData.dateOfBirth,
        phone_number: kycData.phoneNumber,
        address: kycData.address,
        city: kycData.city,
        state: kycData.state,
        id_type: kycData.idType as any,
        id_number: kycData.idNumber,
        id_document_url: idDocumentUrl,
        selfie_url: selfieUrl,
      };

      if (kycStatus) {
        await kycService.updateKYC(kycPayload);
        toast.success('KYC information updated successfully!');
      } else {
        await kycService.submitKYC(kycPayload);
        toast.success('KYC verification submitted successfully!');
      }

      fetchKYCStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC verification');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'under_review': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = !kycStatus || kycStatus.status === 'pending' || kycStatus.status === 'rejected';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
                <p className="text-gray-600">Verify your identity to start bidding on tasks</p>
              </div>
            </div>
            {kycStatus && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(kycStatus.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycStatus.status)}`}>
                  {kycStatus.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Status Message */}
          {kycStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              kycStatus.status === 'approved' ? 'bg-green-50 border border-green-200' :
              kycStatus.status === 'under_review' ? 'bg-orange-50 border border-orange-200' :
              kycStatus.status === 'rejected' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start space-x-3">
                {kycStatus.status === 'approved' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : kycStatus.status === 'rejected' ? (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    kycStatus.status === 'approved' ? 'text-green-800' :
                    kycStatus.status === 'rejected' ? 'text-red-800' :
                    'text-orange-800'
                  }`}>
                    {kycStatus.status === 'approved' && 'Verification Approved'}
                    {kycStatus.status === 'under_review' && 'Under Review'}
                    {kycStatus.status === 'rejected' && 'Verification Rejected'}
                    {kycStatus.status === 'pending' && 'Pending Review'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    kycStatus.status === 'approved' ? 'text-green-700' :
                    kycStatus.status === 'rejected' ? 'text-red-700' :
                    'text-orange-700'
                  }`}>
                    {kycStatus.status === 'approved' && 'You can now bid on tasks and accept runner assignments.'}
                    {kycStatus.status === 'under_review' && 'Your documents are being reviewed. This usually takes 1-2 business days.'}
                    {kycStatus.status === 'rejected' && 'Please update your information and resubmit for verification.'}
                    {kycStatus.status === 'pending' && 'Your verification is pending review.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={kycData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                  disabled={!canEdit}
                  required
                />
                <Input
                  label="Last Name"
                  value={kycData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  disabled={!canEdit}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                  disabled={!canEdit}
                  required
                />
                <Input
                  label="Phone Number"
                  value={kycData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                  disabled={!canEdit}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="space-y-4">
                <Input
                  label="Address"
                  value={kycData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                  disabled={!canEdit}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={kycData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    error={errors.city}
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    label="State"
                    value={kycData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    error={errors.state}
                    disabled={!canEdit}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ID Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">ID Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="ID Type"
                  value={kycData.idType}
                  onChange={(e) => handleInputChange('idType', e.target.value)}
                  options={ID_TYPES}
                  error={errors.idType}
                  disabled={!canEdit}
                  required
                />
                <Input
                  label="ID Number"
                  value={kycData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  error={errors.idNumber}
                  disabled={!canEdit}
                  required
                />
              </div>
            </div>

            {/* Document Upload */}
            {canEdit && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Upload</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a clear photo of your ID
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('id', e.target.files?.[0] || null)}
                        className="hidden"
                        id="id-upload"
                      />
                      <label
                        htmlFor="id-upload"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                      {idDocument && (
                        <p className="text-sm text-green-600 mt-2">{idDocument.name}</p>
                      )}
                    </div>
                    {errors.idDocument && (
                      <p className="mt-1 text-sm text-red-500">{errors.idDocument}</p>
                    )}
                  </div>

                  {/* Selfie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selfie
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Take a clear selfie
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <label
                        htmlFor="selfie-upload"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </label>
                      {selfie && (
                        <p className="text-sm text-green-600 mt-2">{selfie.name}</p>
                      )}
                    </div>
                    {errors.selfie && (
                      <p className="mt-1 text-sm text-red-500">{errors.selfie}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {canEdit && (
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading || uploading}
                  disabled={loading || uploading}
                >
                  {uploading ? 'Uploading...' : loading ? 'Submitting...' : 
                   kycStatus ? 'Update Verification' : 'Submit for Verification'}
                </Button>
              </div>
            )}

            {!canEdit && kycStatus?.status === 'approved' && (
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={() => navigate('/tasks')}>
                  Browse Tasks
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};
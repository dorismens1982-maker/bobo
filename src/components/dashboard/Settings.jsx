import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../config/supabase'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { User, Building, Phone, Mail, Upload, Trash2, Image } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, profile, updateProfile, loading } = useAuth()
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    phone: profile?.phone || ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [profileUpdating, setProfileUpdating] = useState(false)

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />
  }

  const validateGhanaPhone = (phone) => {
    const ghanaPhoneRegex = /^(\+233|0)(20|23|24|25|26|27|28|50|54|55|59)\d{7}$/
    return ghanaPhoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    if (!validateGhanaPhone(formData.phone)) {
      toast.error('Please enter a valid Ghana phone number')
      return
    }

    setProfileUpdating(true)
    try {
      await updateProfile(formData)
    } finally {
      setProfileUpdating(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    setLogoUploading(true)
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/logo.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          upsert: true // Replace existing file
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Update user profile with logo URL
      await updateProfile({ logo_url: urlData.publicUrl })
      
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo. Please try again.')
    } finally {
      setLogoUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleLogoDelete = async () => {
    if (!profile?.logo_url) return

    try {
      // Extract filename from URL
      const urlParts = profile.logo_url.split('/')
      const fileName = `${user.id}/${urlParts[urlParts.length - 1]}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('logos')
        .remove([fileName])

      if (deleteError) {
        console.error('Error deleting from storage:', deleteError)
      }

      // Update profile to remove logo URL
      await updateProfile({ logo_url: null })
      
      toast.success('Logo removed successfully!')
    } catch (error) {
      console.error('Error deleting logo:', error)
      toast.error('Failed to remove logo. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business profile and preferences</p>
      </div>

      {/* Business Logo Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h2>
        <p className="text-gray-600 mb-4">Upload your business logo to appear on invoices and receipts</p>
        
        <div className="space-y-4">
          {/* Current Logo Display */}
          {profile?.logo_url ? (
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={profile.logo_url}
                  alt="Business Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Current Logo</p>
                <p className="text-sm text-gray-500">This logo will appear on your invoices</p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogoDelete}
                  className="mt-2"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove Logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Upload Section */}
          <div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={logoUploading}
              />
              <Button
                variant="outline"
                loading={logoUploading}
                disabled={logoUploading}
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {profile?.logo_url ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PNG, JPG, GIF. Max size: 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
        
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your Business Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0244123456 or +233244123456"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={profileUpdating}
              disabled={profileUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Account Created</p>
              <p className="text-sm text-gray-500">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Last Updated</p>
              <p className="text-sm text-gray-500">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
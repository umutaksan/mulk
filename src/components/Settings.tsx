import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Settings as SettingsIcon, Upload, Lock, Users, Bell, Home, Plus, Trash2 } from 'lucide-react';
import FileUploader from './FileUploader';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onFileLoaded: (data: string) => void;
}

interface Property {
  name: string;
  type: 'L&D Guest' | 'L&D Guest Commission';
}

const Settings: React.FC<SettingsProps> = ({ onFileLoaded }) => {
  const { t } = useLanguage();
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<'L&D Guest' | 'L&D Guest Commission'>('L&D Guest');
  const [properties, setProperties] = useState<Property[]>([
    { name: 'Marbella Old Town', type: 'L&D Guest' },
    { name: 'Jardines Tropicales-Puerto Banús', type: 'L&D Guest' },
    { name: 'Playa de la Fontanilla Marbella', type: 'L&D Guest' },
    { name: 'ALOHA • Garden + Rooftop View Marbella Stay', type: 'L&D Guest Commission' }
  ]);
  const [csvData, setCsvData] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleAddProperty = async () => {
    if (!newPropertyName.trim()) return;
    
    if (properties.some(p => p.name.toLowerCase() === newPropertyName.toLowerCase())) {
      alert('A property with this name already exists!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          name: newPropertyName,
          type: newPropertyType
        })
        .select()
        .single();

      if (error) throw error;

      setProperties([...properties, { name: newPropertyName, type: newPropertyType }]);
      setNewPropertyName('');
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property');
    }
  };

  const handleDeleteProperty = async (propertyName: string) => {
    if (window.confirm(`Are you sure you want to delete ${propertyName}?`)) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('name', propertyName);

        if (error) throw error;

        setProperties(properties.filter(p => p.name !== propertyName));
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property');
      }
    }
  };

  const handleFileLoaded = (data: string) => {
    setCsvData(data);
    onFileLoaded(data);
  };

  const handleConfirm = async () => {
    if (!csvData) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('csv', new Blob([csvData], { type: 'text/csv' }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lodgify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to import data');
      }

      setUploadStatus(result.message);
      
      if (result.warnings?.length > 0) {
        setUploadStatus(prev => 
          `${prev}\n\nWarnings:\n${result.warnings.join('\n')}`
        );
      }

      setCsvData('');
    } catch (error: any) {
      console.error('Error uploading to database:', error);
      setUploadError(`Failed to upload data: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const settingsSections = [
    {
      id: 'properties',
      icon: Home,
      title: 'Property Management',
      description: 'Manage your properties and their settings'
    },
    {
      id: 'data',
      icon: Upload,
      title: 'Data Management',
      description: 'Upload and manage your booking data'
    },
    {
      id: 'access',
      icon: Lock,
      title: 'Access Control',
      description: 'Manage user roles and permissions',
      disabled: true
    },
    {
      id: 'users',
      icon: Users,
      title: 'User Management',
      description: 'Manage system users and their access levels',
      disabled: true
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Configure system notifications and alerts',
      disabled: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Management Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Property Management</h3>
          </div>

          {uploadStatus && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg whitespace-pre-wrap">
              {uploadStatus}
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg whitespace-pre-wrap">
              {uploadError}
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Property</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Property name"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <select
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value as 'L&D Guest' | 'L&D Guest Commission')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="L&D Guest">L&D Guest Property</option>
                <option value="L&D Guest Commission">L&D Guest Commission Property</option>
              </select>
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-blue-600">L&D Guest Properties</h4>
            </div>
            {properties
              .filter(p => p.type === 'L&D Guest')
              .map(property => (
                <div
                  key={property.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span>{property.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteProperty(property.name)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

            <div className="border-b pb-2 mt-6">
              <h4 className="text-sm font-medium text-purple-600">L&D Guest Commission Properties</h4>
            </div>
            {properties
              .filter(p => p.type === 'L&D Guest Commission')
              .map(property => (
                <div
                  key={property.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <span>{property.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteProperty(property.name)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Other Settings Sections */}
        {settingsSections.filter(section => section.id !== 'properties').map((section) => (
          <div
            key={section.id}
            className={`bg-white rounded-lg shadow p-6 ${
              section.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <section.icon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">{section.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{section.description}</p>
            
            {section.id === 'data' ? (
              <div className="space-y-4">
                <FileUploader 
                  onFileLoaded={handleFileLoaded} 
                  onConfirm={handleConfirm}
                  isUploading={isUploading}
                />
              </div>
            ) : (
              <button
                disabled={section.disabled}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:hover:bg-gray-100"
              >
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">
          Note: Some settings sections are currently disabled as they will be available in future updates.
        </p>
      </div>
    </div>
  );
};

export default Settings;
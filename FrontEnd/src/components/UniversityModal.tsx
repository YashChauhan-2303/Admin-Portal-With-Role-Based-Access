import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { University, CreateUniversityData } from '@/types/university';

interface UniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUniversityData) => Promise<void>;
  university?: University | null;
  mode: 'create' | 'edit';
}

const UniversityModal: React.FC<UniversityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  university,
  mode
}) => {
  const [formData, setFormData] = useState<CreateUniversityData>({
    name: '',
    location: {
      city: '',
      state: '',
      country: '',
      coordinates: [0, 0]
    },
    founded: new Date().getFullYear(),
    type: 'public',
    enrollment: {
      undergraduate: 0,
      graduate: 0,
      total: 0
    },
    website: '',
    description: '',
    contact: {
      email: '',
      phone: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (university && mode === 'edit') {
      setFormData({
        name: university.name,
        location: university.location,
        founded: university.founded || university.established || new Date().getFullYear(),
        type: university.type,
        enrollment: university.enrollment,
        website: university.contact?.website || university.website || '',
        description: university.description || '',
        contact: {
          email: university.contact?.email || '',
          phone: university.contact?.phone || ''
        }
      });
    } else {
      setFormData({
        name: '',
        location: {
          city: '',
          state: '',
          country: '',
          coordinates: [0, 0]
        },
        founded: new Date().getFullYear(),
        type: 'public',
        enrollment: {
          undergraduate: 0,
          graduate: 0,
          total: 0
        },
        website: '',
        description: '',
        contact: {
          email: '',
          phone: ''
        }
      });
    }
  }, [university, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a copy without id fields (they're in the URL)
      const { id, _id, ...dataWithoutIds } = formData;
      
      // Helper function to remove empty strings and undefined values
      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.filter(item => item !== '' && item !== null && item !== undefined);
        }
        if (obj && typeof obj === 'object') {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value === '' || value === null || value === undefined) {
              return; // Skip empty values
            }
            if (typeof value === 'object') {
              const cleanedValue = cleanObject(value);
              if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
                cleaned[key] = cleanedValue;
              }
            } else {
              cleaned[key] = value;
            }
          });
          return cleaned;
        }
        return obj;
      };
      
      // Transform data to match backend schema
      const submitData: any = {
        ...dataWithoutIds,
        contact: {
          ...formData.contact,
          website: formData.website // Move website under contact
        }
      };
      
      // Remove website from top level if it exists
      delete submitData.website;
      
      // Clean the data to remove empty strings
      const cleanedData = cleanObject(submitData);
      
      console.log('Submitting data:', JSON.stringify(cleanedData, null, 2));
      
      await onSubmit(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else if (name.startsWith('enrollment.')) {
      const field = name.split('.')[1];
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        enrollment: {
          ...prev.enrollment,
          [field]: numValue,
          ...(field === 'undergraduate' || field === 'graduate' ? {
            total: (field === 'undergraduate' ? numValue : prev.enrollment.undergraduate) + 
                   (field === 'graduate' ? numValue : prev.enrollment.graduate)
          } : {})
        }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    } else if (name === 'founded') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || new Date().getFullYear()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (field: keyof CreateUniversityData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Add New University' : 'Edit University'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">University Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter university name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location.city">City</Label>
              <Input
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location.state">State</Label>
              <Input
                id="location.state"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location.country">Country</Label>
            <Input
              id="location.country"
              name="location.country"
              value={formData.location.country}
              onChange={handleInputChange}
              placeholder="Enter country"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founded">Founded Year</Label>
              <Input
                id="founded"
                name="founded"
                type="number"
                value={formData.founded}
                onChange={handleInputChange}
                placeholder="Enter year"
                min="1000"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value as 'public' | 'private' | 'community')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enrollment.undergraduate">Undergraduate Students</Label>
              <Input
                id="enrollment.undergraduate"
                name="enrollment.undergraduate"
                type="number"
                value={formData.enrollment.undergraduate}
                onChange={handleInputChange}
                placeholder="Enter count"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment.graduate">Graduate Students</Label>
              <Input
                id="enrollment.graduate"
                name="enrollment.graduate"
                type="number"
                value={formData.enrollment.graduate}
                onChange={handleInputChange}
                placeholder="Enter count"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Enter website URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact.email">Contact Email</Label>
            <Input
              id="contact.email"
              name="contact.email"
              type="email"
              value={formData.contact?.email || ''}
              onChange={handleInputChange}
              placeholder="Enter contact email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-admin-gradient hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create University' : 'Update University'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UniversityModal;
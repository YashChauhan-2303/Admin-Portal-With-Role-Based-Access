import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { University } from '@/types/university';
import {
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  Globe,
  Building2,
  GraduationCap
} from 'lucide-react';

interface UniversityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: University | null;
}

const UniversityDetailsModal: React.FC<UniversityDetailsModalProps> = ({
  isOpen,
  onClose,
  university
}) => {
  if (!university) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            University Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{university.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    <Building2 className="w-3 h-3 mr-1" />
                    {university.type}
                  </Badge>
                  <Badge
                    variant={university.status === 'active' ? 'default' : 'secondary'}
                    className={university.status === 'active' ? 'bg-success' : university.status === 'pending' ? 'bg-yellow-500' : ''}
                  >
                    {university.status ? university.status.charAt(0).toUpperCase() + university.status.slice(1) : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {university.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Description</h3>
              <p className="text-sm text-foreground">{university.description}</p>
            </div>
          )}

          {/* Location Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm font-medium">{university.location.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="text-sm font-medium">{university.location.state}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="text-sm font-medium">{university.location.country}</p>
                </div>
                {university.location.zipCode && (
                  <div>
                    <p className="text-xs text-muted-foreground">ZIP Code</p>
                    <p className="text-sm font-medium">{university.location.zipCode}</p>
                  </div>
                )}
              </div>
              {university.location.address && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{university.location.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Basic Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {university.founded && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Founded Year</p>
                  <p className="text-sm font-medium">{university.founded}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium capitalize">{university.type}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium capitalize">
                  {university.status ? university.status.charAt(0).toUpperCase() + university.status.slice(1) : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Enrollment Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Users className="w-4 h-4" />
              Enrollment
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Undergraduate Students</p>
                <p className="text-sm font-medium">{university.enrollment.undergraduate.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Graduate Students</p>
                <p className="text-sm font-medium">{university.enrollment.graduate.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-muted-foreground font-semibold">Total Students</p>
                <p className="text-sm font-bold">{university.enrollment.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {university.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${university.contact.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {university.contact.email}
                  </a>
                </div>
              )}
              {university.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`tel:${university.contact.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {university.contact.phone}
                  </a>
                </div>
              )}
              {(university.contact?.website || university.website) && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={university.contact?.website || university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {university.contact?.website || university.website}
                  </a>
                </div>
              )}
              {!university.contact?.email && !university.contact?.phone && !university.contact?.website && !university.website && (
                <p className="text-sm text-muted-foreground italic">No contact information available</p>
              )}
            </div>
          </div>

          {/* Programs (if available) */}
          {university.programs && (university.programs.undergraduate || university.programs.graduate || university.programs.doctoral) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Programs Offered
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {university.programs.undergraduate && university.programs.undergraduate.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Undergraduate</p>
                    <div className="flex flex-wrap gap-1">
                      {university.programs.undergraduate.map((program, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {university.programs.graduate && university.programs.graduate.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Graduate</p>
                    <div className="flex flex-wrap gap-1">
                      {university.programs.graduate.map((program, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created</span>
              <span>{new Date(university.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last Updated</span>
              <span>{new Date(university.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversityDetailsModal;

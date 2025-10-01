import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { University, CreateUniversityData, UpdateUniversityData } from '@/types/university';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import UniversityModal from '@/components/UniversityModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  LogOut,
  Shield,
  Eye,
  University as UniversityIcon,
  MapPin,
  Mail,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Public' | 'Private' | 'Community'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'location' | 'type' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load universities
  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getUniversities();
      setUniversities(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load universities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort universities
  const filteredAndSortedUniversities = useMemo(() => {
    let filtered = universities.filter(university => {
      const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           university.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           university.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || university.status === statusFilter;
      const matchesType = typeFilter === 'all' || university.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy];
      let bValue: string | number = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [universities, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // CRUD operations
  const handleCreateUniversity = async (data: CreateUniversityData) => {
    try {
      const newUniversity = await mockApi.createUniversity(data);
      setUniversities(prev => [newUniversity, ...prev]);
      toast({
        title: 'Success',
        description: 'University created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create university',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateUniversity = async (data: CreateUniversityData) => {
    if (!selectedUniversity) return;
    
    try {
      const updateData: UpdateUniversityData = { ...data, id: selectedUniversity.id };
      const updatedUniversity = await mockApi.updateUniversity(updateData);
      setUniversities(prev => prev.map(u => u.id === updatedUniversity.id ? updatedUniversity : u));
      toast({
        title: 'Success',
        description: 'University updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update university',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteUniversity = async () => {
    if (!universityToDelete) return;
    
    try {
      setIsDeleting(true);
      await mockApi.deleteUniversity(universityToDelete.id);
      setUniversities(prev => prev.filter(u => u.id !== universityToDelete.id));
      toast({
        title: 'Success',
        description: 'University deleted successfully',
      });
      setDeleteDialogOpen(false);
      setUniversityToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete university',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (university: University) => {
    try {
      const updatedUniversity = await mockApi.toggleUniversityStatus(university.id);
      setUniversities(prev => prev.map(u => u.id === updatedUniversity.id ? updatedUniversity : u));
      toast({
        title: 'Success',
        description: `University ${updatedUniversity.status.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUniversity(null);
    setModalOpen(true);
  };

  const openEditModal = (university: University) => {
    setModalMode('edit');
    setSelectedUniversity(university);
    setModalOpen(true);
  };

  const openDeleteDialog = (university: University) => {
    setUniversityToDelete(university);
    setDeleteDialogOpen(true);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-admin-gradient rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">University Portal</h1>
                <p className="text-sm text-muted-foreground">Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  {isAdmin ? <Shield className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  <span className="font-medium">{user?.username}</span>
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {user?.role}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters and Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <UniversityIcon className="w-5 h-5" />
                    <span>Universities</span>
                    <Badge variant="secondary">{filteredAndSortedUniversities.length}</Badge>
                  </CardTitle>
                </div>
                {isAdmin && (
                  <Button onClick={openCreateModal} className="bg-admin-gradient hover:opacity-90 shadow-soft">
                    <Plus className="w-4 h-4 mr-2" />
                    Add University
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search universities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Universities Table */}
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('name')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Name
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('location')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Location
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('type')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Type
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-4">Contact</th>
                      <th className="text-left p-4">Status</th>
                      {isAdmin && <th className="text-left p-4">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUniversities.map((university) => (
                      <tr key={university.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{university.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{university.location}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{university.type}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{university.contact}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {isAdmin ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={university.status === 'Active'}
                                onCheckedChange={() => handleToggleStatus(university)}
                              />
                              <Badge
                                variant={university.status === 'Active' ? 'default' : 'secondary'}
                                className={university.status === 'Active' ? 'bg-success' : ''}
                              >
                                {university.status}
                              </Badge>
                            </div>
                          ) : (
                            <Badge
                              variant={university.status === 'Active' ? 'default' : 'secondary'}
                              className={university.status === 'Active' ? 'bg-success' : ''}
                            >
                              {university.status}
                            </Badge>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(university)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(university)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAndSortedUniversities.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <UniversityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No universities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      {isAdmin && (
        <>
          <UniversityModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={modalMode === 'create' ? handleCreateUniversity : handleUpdateUniversity}
            university={selectedUniversity}
            mode={modalMode}
          />
          
          <DeleteConfirmDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteUniversity}
            title="Delete University"
            description={`Are you sure you want to delete "${universityToDelete?.name}"? This action cannot be undone.`}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
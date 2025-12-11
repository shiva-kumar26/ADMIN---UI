import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DirectoryUser } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/services/api';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalUsers } from '@/contexts/GlobalUsersContext';

interface ValidationErrors {
  firstname?: string;
  lastname?: string;
  user_id?: string;
  password?: string;
  hostname?: string;
  extension?: string;
  queue?: string;
  role?: string;
  type?: string;
  level?: string;
  position?: string;
  wrap_up_time?: string;
  max_no_answer?: string;
  reject_delay_time?: string;
  busy_delay_time?: string;
  supervisor_reference?: string;
}

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { users, loading: contextLoading, refreshUsers } = useGlobalUsers(); // Use context

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [queues, setQueues] = useState<string[]>([]);
  // const [supervisors, setSupervisors] = useState<DirectoryUser[]>([]); // Derived from context
  // const [existingUsers, setExistingUsers] = useState<DirectoryUser[]>([]); // Derived from context
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Derived state
  const supervisors = users.filter(u => u.role && (Array.isArray(u.role) ? u.role.includes('Supervisor') : u.role === 'Supervisor'));
  const existingUsers = users;

  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    setIsEditing(editMode);
    fetchQueues();
  }, [searchParams]);

  // Load user from context
  useEffect(() => {
    if (!contextLoading && users.length >= 0) {
      if (!id) return;

      const foundUser = users.find(u => u.directory_id === Number(id));

      if (foundUser) {
        setUser(foundUser);
        const roleArray = Array.isArray(foundUser.role) ? foundUser.role : foundUser.role ? [foundUser.role] : [];
        setEditedUser({
          firstname: foundUser.firstname || '',
          lastname: foundUser.lastname || '',
          user_id: foundUser.user_id || '',
          extension: foundUser.extension || '',
          password: foundUser.password || '',
          role: roleArray,
          hostname: foundUser.hostname || '',
          queue: foundUser.queue || [],
          state: foundUser.state || '',
          status: foundUser.status || '',
          type: foundUser.type || '',
          supervisor_reference: foundUser.supervisor_reference || [],
          level: foundUser.level || 0,
          position: foundUser.position || 0,
          wrap_up_time: foundUser.wrap_up_time || 0,
          max_no_answer: foundUser.max_no_answer || 0,
          reject_delay_time: foundUser.reject_delay_time || 0,
          busy_delay_time: foundUser.busy_delay_time || 0,
        });
        setLoading(false);
      } else if (!contextLoading && users.length > 0) {
        // Only redirect if we have users loaded but didn't find this one
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
        navigate('/user-management');
      }
    }
  }, [id, users, contextLoading, navigate, toast]);


  // Removed fetchUser, fetchSupervisors, fetchExistingUsers



  const fetchQueues = async () => {
    try {
      const response = await fetch('https://10.16.7.96/api/api/queue');
      const data = await response.json();
      setQueues(data.map((queue: { name: string }) => queue.name));
    } catch (error) {
      console.error('Failed to fetch queues:', error);
    }
  };

  const [editedUser, setEditedUser] = useState({
    firstname: '',
    lastname: '',
    user_id: '',
    extension: '',
    password: '',
    role: [] as string[],
    hostname: '',
    queue: [] as string[],
    state: '',
    status: '',
    type: '',
    supervisor_reference: [] as string[],
    level: 0,
    position: 0,
    wrap_up_time: 0,
    max_no_answer: 0,
    reject_delay_time: 0,
    busy_delay_time: 0,
  });

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-Z\s-]{1,50}$/;
    if (!name.trim()) return 'Name is required';
    if (!nameRegex.test(name)) return 'Name can only contain letters, spaces, and hyphens (max 50 characters)';
    return null;
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!password.trim()) return 'Password is required';
    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    if (!hasNumber) return 'Password must contain at least one number';
    return null;
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return 'Username is required';
    const isUnique = !existingUsers.some(user => user.user_id === username && user.user_id !== user?.user_id);
    if (!isUnique) return 'Username already exists. Please choose a different username';
    return null;
  };

  const validateRequiredFields = () => {
    const newErrors: ValidationErrors = {};

    // Required fields for all roles
    if (!editedUser.firstname.trim()) newErrors.firstname = validateName(editedUser.firstname) || 'First name is required';
    if (!editedUser.lastname.trim()) newErrors.lastname = validateName(editedUser.lastname) || 'Last name is required';
    if (!editedUser.user_id.trim()) newErrors.user_id = validateUsername(editedUser.user_id) || 'Username is required';
    if (!editedUser.password.trim()) newErrors.password = validatePassword(editedUser.password) || 'Password is required';
    if (!editedUser.hostname.trim()) newErrors.hostname = 'Hostname is required';
    if (editedUser.role.length === 0) newErrors.role = 'At least one role must be selected';

    // Agent-specific required fields
    if (editedUser.role.includes('Agent')) {
      if (!editedUser.extension.trim()) newErrors.extension = 'Extension number is required';
      if (editedUser.queue.length === 0) newErrors.queue = 'At least one queue must be selected';
      if (!editedUser.level) newErrors.level = 'Level is required';
      if (!editedUser.position) newErrors.position = 'Position is required';
      if (!editedUser.wrap_up_time) newErrors.wrap_up_time = 'Wrap up time is required';
      if (!editedUser.max_no_answer) newErrors.max_no_answer = 'Max no answer is required';
      if (!editedUser.reject_delay_time) newErrors.reject_delay_time = 'Reject delay time is required';
      if (!editedUser.busy_delay_time) newErrors.busy_delay_time = 'Busy delay time is required';
      // if (editedUser.supervisor_reference.length === 0) newErrors.supervisor_reference = 'Supervisor is required';
    }

    return newErrors;
  };

  const handleSave = async () => {
    setIsValidating(true);

    const validationErrors = validateRequiredFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsValidating(false);
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !id) return;

    try {
      const contact = `[leg_timeout=10]user/${editedUser.extension}@${editedUser.hostname}`;
      const updateData = {
        firstname: editedUser.firstname,
        lastname: editedUser.lastname,
        hostname: editedUser.hostname,
        extension: editedUser.extension,
        password: editedUser.password,
        supervisor_reference: editedUser.role.includes('Agent') ? editedUser.supervisor_reference : [],
        role: editedUser.role.length > 0 ? editedUser.role : [],
        user_id: editedUser.user_id,
        name: `${editedUser.firstname} ${editedUser.lastname}`,
        instance_id: 'single_box',
        uuid: '',
        type: editedUser.type || '',
        contact: contact,
        status: editedUser.status || 'Logged Out',
        state: editedUser.state || 'Waiting',
        max_no_answer: editedUser.max_no_answer,
        wrap_up_time: editedUser.wrap_up_time,
        reject_delay_time: editedUser.reject_delay_time,
        busy_delay_time: editedUser.busy_delay_time,
        no_answer_delay_time: 0,
        last_bridge_start: 0,
        last_bridge_end: 0,
        last_offered_call: 0,
        last_status_change: 0,
        no_answer_count: 0,
        calls_answered: 0,
        talk_time: 0,
        ready_time: 0,
        external_calls_count: 0,
        agent: '',
        queue: editedUser.queue,
        tier_state: '',
        level: editedUser.level,
        position: editedUser.position,
      };

      const updatedUser = await ApiService.updateUser(Number(id), updateData);
      if (updatedUser) {
        // Refresh context to get new data immediately
        await refreshUsers();

        // We can just set the user from response for immediate UI update, 
        // but context update will eventually propagate too.
        setUser(updatedUser);

        setIsEditing(false);
        setErrors({});
        toast({
          title: 'User Updated',
          description: 'User details have been successfully updated.',
        });
        navigate('/user-management');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
      console.error('Save error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        firstname: user.firstname,
        lastname: user.lastname,
        user_id: user.user_id,
        extension: user.extension,
        password: user.password,
        role: user.role,
        hostname: user.hostname,
        type: user.type,
        state: user.state,
        status: user.status,
        supervisor_reference: user.supervisor_reference,
        queue: user.queues || [],
        level: user.level,
        position: user.position,
        wrap_up_time: user.wrap_up_time,
        max_no_answer: user.max_no_answer,
        reject_delay_time: user.reject_delay_time,
        busy_delay_time: user.busy_delay_time,
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleRoleChange = (selectedRoles: string[]) => {
    let updatedRoles = [...selectedRoles];

    if (selectedRoles.includes('Admin')) {
      updatedRoles = ['Admin'];
      toast({
        title: 'Role Restriction',
        description: 'Admin role cannot be combined with other roles.',
        variant: 'default',
      });
    } else if (selectedRoles.includes('Agent') && selectedRoles.includes('Admin')) {
      updatedRoles = selectedRoles.filter((role) => role !== 'Admin');
      toast({
        title: 'Role Restriction',
        description: 'Agent role cannot be combined with Admin role.',
        variant: 'default',
      });
    } else if (selectedRoles.includes('Supervisor') && selectedRoles.includes('Admin')) {
      updatedRoles = selectedRoles.filter((role) => role !== 'Admin');
      toast({
        title: 'Role Restriction',
        description: 'Supervisor role cannot be combined with Admin role.',
        variant: 'default',
      });
    }

    setEditedUser((prev) => ({
      ...prev,
      role: updatedRoles,
    }));
  };

  const handleQueueChange = (selectedQueues: string[]) => {
    setEditedUser((prev) => ({
      ...prev,
      queue: selectedQueues,
    }));
  };

  const handleInputChange = (field: keyof typeof editedUser, value: string | number) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev, [field]: undefined };
        if (field === 'user_id' && typeof value === 'string' && value.trim()) {
          const usernameError = validateUsername(value);
          if (usernameError) newErrors.user_id = usernameError;
        }
        if (field === 'password' && typeof value === 'string' && value.trim()) {
          const passwordError = validatePassword(value);
          if (passwordError) newErrors.password = passwordError;
        }
        return newErrors;
      });
    }
  };

  const handleSupervisorChange = (value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      supervisor_reference: [value],
    }));
  };

  if (contextLoading && loading) { // Use context loading too
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">User not found</div>
      </div>
    );
  }

  const isSupervisor = editedUser.role.includes('Supervisor');
  const isAdmin = editedUser.role.includes('Admin');
  const isAgent = editedUser.role.includes('Agent');

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/user-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to User Management</span>
              </Button>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isValidating}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isValidating ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit User</span>
                </Button>
              )}
            </div>
          </div>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-md">
              {user.firstname.charAt(0)}
              {user.lastname.charAt(0)}
            </div>
            <div>
              <h4 className="text-2xl font-bold">
                {user.firstname} {user.lastname}
              </h4>
              {/* <p className="text-gray-600">@{user.user_id}</p> */}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role (Always visible) */}
            <div className="space-y-2">
              <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
              {isEditing ? (
                <MultiSelectDropdown
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Supervisor', label: 'Supervisor' },
                    { value: 'Agent', label: 'Agent' },
                  ]}
                  selected={editedUser.role}
                  onChange={handleRoleChange}
                  placeholder="Select roles..."
                  searchPlaceholder="Search roles..."
                  className={errors.role ? 'border-red-500' : ''}
                />
              ) : (
                <Input value={user.role.length > 0 ? user.role.join(', ') : 'Supervisor'} disabled />
              )}
              {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
            </div>

            {/* Common fields for all roles */}
            <div className="space-y-2">
              <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                value={isEditing ? editedUser.user_id : user.user_id}
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                disabled={!isEditing}
                className={errors.user_id ? 'border-red-500' : ''}
              />
              {errors.user_id && <p className="text-red-500 text-xs">{errors.user_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                value={isEditing ? editedUser.firstname : user.firstname}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                disabled={!isEditing}
                className={errors.firstname ? 'border-red-500' : ''}
              />
              {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                value={isEditing ? editedUser.lastname : user.lastname}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                disabled={!isEditing}
                className={errors.lastname ? 'border-red-500' : ''}
              />
              {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={isEditing ? editedUser.password : user.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={!isEditing}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname <span className="text-red-500">*</span></Label>
              <Select
                value={isEditing ? editedUser.hostname : user.hostname}
                onValueChange={(value) => handleInputChange('hostname', value)} // Use onValueChange instead of onChange
                disabled={!isEditing}
              >
                <SelectTrigger className={errors.hostname ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select hostname" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10.16.7.91">10.16.7.91</SelectItem>
                  <SelectItem value="10.16.7.96">10.16.7.96</SelectItem>
                </SelectContent>
              </Select>
              {errors.hostname && <p className="text-red-500 text-xs">{errors.hostname}</p>}
            </div>

            {/* Agent-specific fields (including Supervisor field only for Agent) */}
            {isAgent && (

              <>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <Select
                      value={editedUser.supervisor_reference[0] || ''}
                      onValueChange={handleSupervisorChange}
                    >
                      <SelectTrigger error={!!errors.supervisor_reference}>
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map((supervisor) => (
                          <SelectItem
                            key={supervisor.directory_id}
                            value={supervisor.user_id}
                          >
                            {supervisor.firstname} {supervisor.lastname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={user.supervisor_reference.length > 0 ? user.supervisor_reference.join(', ') : '-'}
                      disabled
                    />
                  )}
                  {errors.supervisor_reference && <p className="text-red-500 text-xs">{errors.supervisor_reference}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extension">Extension <span className="text-red-500">*</span></Label>
                  <Input
                    id="extension"
                    value={isEditing ? editedUser.extension : user.extension}
                    onChange={(e) => handleInputChange('extension', e.target.value)}
                    disabled={!isEditing}
                    className={errors.extension ? 'border-red-500' : ''}
                  />
                  {errors.extension && <p className="text-red-500 text-xs">{errors.extension}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                  <Select value={editedUser.type}
                    onValueChange={(value) => handleInputChange('type', value)} // Use handleInputChange
                    disabled={!isEditing}>
                    <SelectTrigger error={!!errors.type}>
                      <SelectValue placeholder="Select callback" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="callback">callback</SelectItem>
                      {/* <SelectItem value="10.16.7.96">10.16.7.96</SelectItem> */}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="queues">Queues <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <MultiSelectDropdown
                      options={queues.map((queue) => ({ value: queue, label: queue }))}
                      selected={editedUser.queue}
                      onChange={handleQueueChange}
                      placeholder="Select queues..."
                      searchPlaceholder="Search queues..."
                      className={errors.queue ? 'border-red-500' : ''}
                    />
                  ) : (
                    <Input value={user.queue.length > 0 ? user.queue.join(', ') : 'None'} disabled />
                  )}
                  {errors.queue && <p className="text-red-500 text-xs">{errors.queue}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level <span className="text-red-500">*</span></Label>
                  <Input
                    id="level"
                    type="number"
                    value={isEditing ? editedUser.level : user.level}
                    onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.level ? 'border-red-500' : ''}
                  />
                  {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
                  <Input
                    id="position"
                    type="number"
                    value={isEditing ? editedUser.position : user.position}
                    onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.position ? 'border-red-500' : ''}
                  />
                  {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wrapUpTime">Wrap Up Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="wrapUpTime"
                    type="number"
                    value={isEditing ? editedUser.wrap_up_time : user.wrap_up_time}
                    onChange={(e) => handleInputChange('wrap_up_time', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.wrap_up_time ? 'border-red-500' : ''}
                  />
                  {errors.wrap_up_time && <p className="text-red-500 text-xs">{errors.wrap_up_time}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxNoAnswer">Max No Answer <span className="text-red-500">*</span></Label>
                  <Input
                    id="maxNoAnswer"
                    type="number"
                    value={isEditing ? editedUser.max_no_answer : user.max_no_answer}
                    onChange={(e) => handleInputChange('max_no_answer', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.max_no_answer ? 'border-red-500' : ''}
                  />
                  {errors.max_no_answer && <p className="text-red-500 text-xs">{errors.max_no_answer}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rejectDelayTime">Reject Delay Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="rejectDelayTime"
                    type="number"
                    value={isEditing ? editedUser.reject_delay_time : user.reject_delay_time}
                    onChange={(e) => handleInputChange('reject_delay_time', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.reject_delay_time ? 'border-red-500' : ''}
                  />
                  {errors.reject_delay_time && <p className="text-red-500 text-xs">{errors.reject_delay_time}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busyDelayTime">Busy Delay Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="busyDelayTime"
                    type="number"
                    value={isEditing ? editedUser.busy_delay_time : user.busy_delay_time}
                    onChange={(e) => handleInputChange('busy_delay_time', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className={errors.busy_delay_time ? 'border-red-500' : ''}
                  />
                  {errors.busy_delay_time && <p className="text-red-500 text-xs">{errors.busy_delay_time}</p>}
                </div>

              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
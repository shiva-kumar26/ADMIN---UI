import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'; // Import updated Select components
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import axios from 'axios';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  hostname?: string;
  extension?: string;
  queues?: string;
  type?:string;
  role?: string;
  level?: string;
  position?: string;
  wrapUpTime?: string;
  busyDelayTime?: string;
  rejectDelayTime?: string;
  maxNoAnswer?: string;
  supervisor?: string;
}

const UserCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    role: [] as string[],
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    hostname: '',
    extension: '',
    port: '',
    stationId: '',
    type:'',
    queues: [] as string[],
    supervisor: '',
    level: '',
    position: '',
    wrapUpTime: '',
    maxNoAnswer: '',
    rejectDelayTime: '',
    busyDelayTime: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [queues, setQueues] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetch('https://10.16.7.96/api/api/queue')
      .then(res => res.json())
      .then(data => setQueues(data))
      .catch(err => console.error("Failed to fetch queues:", err));

    fetchSupervisors();
    fetchExistingUsers();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await fetch('https://10.16.7.96/api/directory_search/');
      const userData = await response.json();
      const supervisorList = userData.filter(user =>
        user.role && user.role.length > 0 && user.role[0].toLowerCase() === 'supervisor'
      );
      setSupervisors(supervisorList);
    } catch (error) {
      console.error("Failed to fetch supervisors:", error);
    }
  };

  const fetchExistingUsers = async () => {
    try {
      const response = await fetch('https://10.16.7.96/api/directory_search/');
      const userData = await response.json();
      setExistingUsers(userData);
    } catch (error) {
      console.error("Failed to fetch existing users:", error);
    }
  };

  const handleRoleChange = (selectedRoles: string[]) => {
    let updatedRoles = [...selectedRoles];

    if (selectedRoles.includes('Admin')) {
      updatedRoles = ['Admin'];
      toast({
        title: "Role Restriction",
        description: "Admin role cannot be combined with other roles.",
        variant: "default",
      });
    } else if (selectedRoles.includes('Agent') && selectedRoles.includes('Admin')) {
      updatedRoles = selectedRoles.filter(role => role !== 'Admin');
      toast({
        title: "Role Restriction",
        description: "Agent role cannot be combined with Admin role.",
        variant: "default",
      });
    } else if (selectedRoles.includes('Supervisor') && selectedRoles.includes('Admin')) {
      updatedRoles = selectedRoles.filter(role => role !== 'Admin');
      toast({
        title: "Role Restriction",
        description: "Supervisor role cannot be combined with Admin role.",
        variant: "default",
      });
    }

    setNewUser(prev => ({
      ...prev,
      role: updatedRoles
    }));

    if (updatedRoles.length > 0 && errors.role) {
      setErrors(prev => ({ ...prev, role: undefined }));
    }
  };
  const validateFirstName = (name: string) => {
    const nameRegex = /^[a-zA-Z\s-]{1,50}$/;
    if (!name.trim()) return 'First name is required';
    if (!nameRegex.test(name)) return 'First name can only contain letters, spaces, and hyphens (max 50 characters)';
    return null;
  };
    const validateLastName = (name: string) => {
    const nameRegex = /^[a-zA-Z\s-]{1,50}$/;
    if (!name.trim()) return 'Last name is required';
    if (!nameRegex.test(name)) return 'Last name can only contain letters, spaces, and hyphens (max 50 characters)';
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
    if (!username.trim()) return 'User name is required';
    const isUnique = !existingUsers.some(user => user.user_id === username);
    if (!isUnique) return 'Username already exists. Please choose a different username';
    return null;
  };

  const validateRequiredFields = () => {
    const newErrors: ValidationErrors = {};

    // Required fields for all roles
    if (!newUser.firstName.trim()) newErrors.firstName = validateFirstName(newUser.firstName) || 'First name is required';
    if (!newUser.lastName.trim()) newErrors.lastName = validateLastName(newUser.lastName) || 'Last name is required';
    if (!newUser.username.trim()) newErrors.username = validateUsername(newUser.username) || 'User name is required';
    if (!newUser.password.trim()) newErrors.password = validatePassword(newUser.password) || 'Password is required';
    if (!newUser.hostname.trim()) newErrors.hostname = 'Host name is required';
    if (newUser.role.length === 0) newErrors.role = 'At least one role must be selected';

    // Agent-specific required fields
    if (newUser.role.includes('Agent')) {
      if (!newUser.extension.trim()) newErrors.extension = 'Extension number is required';
      if (!newUser.type.trim()) newErrors.type = 'Type is required';
      if (newUser.queues.length === 0) newErrors.queues = 'At least one queue must be selected';
      if (!newUser.level.trim()) newErrors.level = 'Level is required';
      if (!newUser.position.trim()) newErrors.position = 'Position is required';
      if (!newUser.wrapUpTime.trim()) newErrors.wrapUpTime = 'Wrap up time is required';
      if (!newUser.busyDelayTime.trim()) newErrors.busyDelayTime = 'Busy delay time is required';
      if (!newUser.maxNoAnswer.trim()) newErrors.maxNoAnswer = 'Max no answer is required';
      // if (!newUser.status.trim()) newErrors.status = 'Status is required';
      if (!newUser.rejectDelayTime.trim()) newErrors.rejectDelayTime = 'Reject delay time is required';
      // if (!newUser.supervisor) newErrors.supervisor = 'Supervisor is required';
    }

    return newErrors;
  };

  const handleQueueChange = (selectedQueues: string[]) => {
    setNewUser(prev => ({
      ...prev,
      queues: selectedQueues
    }));
    if (selectedQueues.length > 0 && errors.queues) {
      setErrors(prev => ({ ...prev, queues: undefined }));
    }
  };

  const handleInputChange = (field: keyof typeof newUser, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev, [field]: undefined };
        if (field === 'username' && value.trim()) {
          const usernameError = validateUsername(value);
          if (usernameError) newErrors.username = usernameError;
        }
        if (field === 'password' && value.trim()) {
          const passwordError = validatePassword(value);
          if (passwordError) newErrors.password = passwordError;
        }
        return newErrors;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    const validationErrors = validateRequiredFields();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('errors', errors)
      setIsValidating(false);
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    const toInt = (val: string) => val && !isNaN(Number(val)) ? parseInt(val, 10) : 0;
    

    const handleUser = {
      
      firstname: newUser.firstName,
      lastname: newUser.lastName,
      hostname: newUser.hostname,
      extension: newUser.extension,
      password: newUser.password,
      supervisor_reference: newUser.role.includes('Agent') && newUser.supervisor ? [newUser.supervisor] : [],
      role: newUser.role,
      user_id: newUser.username,
      name: "",
      instance_id: "single_box",
      uuid: "",
      type: newUser.type,
      contact: newUser.extension ? `[leg_timeout=10]user/${newUser.extension}@${newUser.hostname}` : '',
      status: "Logged Out",
      state: "Waiting",
      max_no_answer: toInt(newUser.maxNoAnswer),
      wrap_up_time: toInt(newUser.wrapUpTime),
      reject_delay_time: toInt(newUser.rejectDelayTime),
      busy_delay_time: toInt(newUser.busyDelayTime),
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
      agent: "",
      queue: newUser.queues || [],
      tier_state: "",
      level: toInt(newUser.level),
      position: toInt(newUser.position)
    };

    try {
      await axios.post('https://10.16.7.96/api/directory_search/', handleUser);
      toast({
        title: "User Created",
        description: "New user has been successfully created.",
      });
      if (newUser.role.includes('Supervisor')) {
        await fetchSupervisors();
      }
      navigate('/user-management');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    // <div className="space-y-6">
    //   <Card>
    //     <CardHeader>
    //       <div className="flex items-center justify-between">
    //         <Button
    //           variant="ghost"
    //           onClick={() => navigate('/user-management')}
    //           className="flex items-center space-x-2"
    //         >
    //           <ArrowLeft className="w-4 h-4" />
    //           <span>Back to User Management</span>
    //         </Button>
    //       </div>
    //       <CardTitle className="text-2xl font-bold">
    //         Create New User
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent className="space-y-6">
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //         <div className="space-y-2">
    //           <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
    //           <MultiSelectDropdown
    //             options={[
    //               { value: 'Admin', label: 'Admin' },
    //               { value: 'Supervisor', label: 'Supervisor' },
    //               { value: 'Agent', label: 'Agent' }
    //             ]}
    //             selected={newUser.role}
    //             onChange={handleRoleChange}
    //             placeholder="Select roles..."
    //             searchPlaceholder="Search roles..."
    //             className={errors.role ? 'border-red-500' : ''}
    //             error={!!errors.role}
    //           />
    //           {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
    //           {newUser.role.length > 0 && (
    //             <p className="text-xs text-gray-600">
    //               Selected roles: {newUser.role.join(', ')}
    //             </p>
    //           )}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
    //           <Input
    //             id="firstName"
    //             value={newUser.firstName}
    //             onChange={(e) => handleInputChange('firstName', e.target.value)}
    //             placeholder="Enter first name"
    //             className={errors.firstName ? 'border-red-500' : ''}
    //           />
    //           {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
    //           <Input
    //             id="lastName"
    //             value={newUser.lastName}
    //             onChange={(e) => handleInputChange('lastName', e.target.value)}
    //             placeholder="Enter last name"
    //             className={errors.lastName ? 'border-red-500' : ''}
    //           />
    //           {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="username">User name <span className="text-red-500">*</span></Label>
    //           <Input
    //             id="username"
    //             value={newUser.username}
    //             onChange={(e) => handleInputChange('username', e.target.value)}
    //             placeholder="Enter username"
    //             className={errors.username ? 'border-red-500' : ''}
    //           />
    //           {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
    //         </div>

    //         <div className="space-y-2 relative">
    //           <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
    //           <Input
    //             id="password"
    //             type={showPassword ? "text" : "password"}
    //             value={newUser.password}
    //             onChange={(e) => handleInputChange('password', e.target.value)}
    //             placeholder="Enter password"
    //             className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
    //           />
    //           <button
    //             type="button"
    //             className="absolute right-3 top-9 text-gray-500"
    //             onClick={() => setShowPassword((prev) => !prev)}
    //             tabIndex={-1}
    //           >
    //             {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    //           </button>
    //           {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="hostname">Host name <span className="text-red-500">*</span></Label>
    //           {/* <Input
    //             id="hostname"
    //             value={newUser.hostname}
    //             onChange={(e) => handleInputChange('hostname', e.target.value)}
    //             placeholder="Enter hostname"
    //             className={errors.hostname ? 'border-red-500' : ''}
    //           /> */}

    //           <Select value={newUser.hostname} onValueChange={(value) => setNewUser({ ...newUser, hostname: value })}>
    //             <SelectTrigger error={!!errors.hostname}> {/* Pass error prop */}
    //               <SelectValue placeholder="Select hostname" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               {/* {supervisors.map((supervisor) => (
    //     <SelectItem key={supervisor.directory_id} value={supervisor.user_id}>
    //       {supervisor.firstname} {supervisor.lastname}
    //     </SelectItem>
    //   ))} */}
    //               <SelectItem value='10.16.7.91'>10.16.7.91</SelectItem>
    //               <SelectItem value='10.16.7.96'>10.16.7.96</SelectItem>
    //             </SelectContent>
    //           </Select>
    //           {errors.hostname && <p className="text-red-500 text-xs">{errors.hostname}</p>}
    //         </div>

    //         {newUser.role.includes('Agent') && (
    //           <>
    //             <div className="space-y-2">
    //               <Label htmlFor="extension">Extension Number <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="extension"
    //                 value={newUser.extension}
    //                 onChange={(e) => handleInputChange('extension', e.target.value)}
    //                 placeholder="Enter extension number"
    //                 className={errors.extension ? 'border-red-500' : ''}
    //               />
    //               {errors.extension && <p className="text-red-500 text-xs">{errors.extension}</p>}
    //             </div>

    //             {newUser.role.includes('Agent') && newUser.role.length === 1 && (
    //               <div className="space-y-2">
    //                 <Label htmlFor="supervisor">Supervisor <span className="text-red-500">*</span></Label>
    //                 <Select value={newUser.supervisor} onValueChange={(value) => setNewUser({ ...newUser, supervisor: value })}>
    //                   <SelectTrigger error={!!errors.supervisor}>
    //                     <SelectValue placeholder="Select supervisor" />
    //                   </SelectTrigger>
    //                   <SelectContent>
    //                     {supervisors.map((supervisor) => (
    //                       <SelectItem key={supervisor.directory_id} value={supervisor.user_id}>
    //                         {supervisor.firstname} {supervisor.lastname}
    //                       </SelectItem>
    //                     ))}
    //                   </SelectContent>
    //                 </Select>
    //                 {errors.supervisor && <p className="text-red-500 text-xs">{errors.supervisor}</p>}
    //               </div>
    //             )}

    //             <div className="space-y-2 col-span-2">
    //               <Label>Queues <span className="text-red-500">*</span></Label>
    //               <MultiSelectDropdown
    //                 options={queues.map(queue => ({
    //                   value: queue.name,
    //                   label: queue.name
    //                 }))}
    //                 selected={newUser.queues}
    //                 onChange={handleQueueChange}
    //                 placeholder="Select queues..."
    //                 searchPlaceholder="Search queues..."
    //                 className={errors.queues ? 'border-red-500' : ''}
    //                 error={!!errors.queues}
    //               />
    //               {errors.queues && <p className="text-red-500 text-xs">{errors.queues}</p>}
    //               {newUser.queues.length > 0 && (
    //                 <p className="text-xs text-gray-600">
    //                   Selected queues: {newUser.queues.join(', ')}
    //                 </p>
    //               )}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="level">Level <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="level"
    //                 type="number"
    //                 value={newUser.level || ''}
    //                 onChange={(e) => handleInputChange('level', e.target.value)}
    //                 placeholder="Enter level"
    //                 className={errors.level ? 'border-red-500' : ''}
    //               />
    //               {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="position"
    //                 type="number"
    //                 value={newUser.position || ''}
    //                 onChange={(e) => handleInputChange('position', e.target.value)}
    //                 placeholder="Enter position"
    //                 className={errors.position ? 'border-red-500' : ''}
    //               />
    //               {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="wrapUpTime">Wrap up time <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="wrapUpTime"
    //                 type="number"
    //                 value={newUser.wrapUpTime || ''}
    //                 onChange={(e) => handleInputChange('wrapUpTime', e.target.value)}
    //                 placeholder="Enter wrap up time"
    //                 className={errors.wrapUpTime ? 'border-red-500' : ''}
    //               />
    //               {errors.wrapUpTime && <p className="text-red-500 text-xs">{errors.wrapUpTime}</p>}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="maxNoAnswer">Max no answer <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="maxNoAnswer"
    //                 type="number"
    //                 value={newUser.maxNoAnswer || ''}
    //                 onChange={(e) => handleInputChange('maxNoAnswer', e.target.value)}
    //                 placeholder="Enter max no answer"
    //                 className={errors.maxNoAnswer ? 'border-red-500' : ''}
    //               />
    //               {errors.maxNoAnswer && <p className="text-red-500 text-xs">{errors.maxNoAnswer}</p>}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="rejectDelayTime">Reject delay time <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="rejectDelayTime"
    //                 type="number"
    //                 value={newUser.rejectDelayTime || ''}
    //                 onChange={(e) => handleInputChange('rejectDelayTime', e.target.value)}
    //                 placeholder="Enter reject delay time"
    //                 className={errors.rejectDelayTime ? 'border-red-500' : ''}
    //               />
    //               {errors.rejectDelayTime && <p className="text-red-500 text-xs">{errors.rejectDelayTime}</p>}
    //             </div>

    //             <div className="space-y-2">
    //               <Label htmlFor="busyDelayTime">Busy delay time <span className="text-red-500">*</span></Label>
    //               <Input
    //                 id="busyDelayTime"
    //                 type="number"
    //                 value={newUser.busyDelayTime || ''}
    //                 onChange={(e) => handleInputChange('busyDelayTime', e.target.value)}
    //                 placeholder="Enter busy delay time"
    //                 className={errors.busyDelayTime ? 'border-red-500' : ''}
    //               />
    //               {errors.busyDelayTime && <p className="text-red-500 text-xs">{errors.busyDelayTime}</p>}
    //             </div>
    //           </>
    //         )}
    //       </div>

    //       <div className="flex justify-end space-x-4 pt-6">
    //         <Button
    //           variant="outline"
    //           onClick={() => navigate('/user-management')}
    //         >
    //           Cancel
    //         </Button>
    //         <Button
    //           onClick={handleSave}
    //           disabled={isValidating}
    //           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center"
    //         >
    //           <Save className="w-4 h-4 mr-2" />
    //           {isValidating ? 'Creating...' : 'Create User'}
    //         </Button>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>


    <div className="space-y-6">
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/user-management')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to User Management</span>
        </Button>
      </div>
      <CardTitle className="text-2xl font-bold">
        Create New User
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
          <MultiSelectDropdown
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Supervisor', label: 'Supervisor' },
              { value: 'Agent', label: 'Agent' }
            ]}
            selected={newUser.role}
            onChange={handleRoleChange}
            placeholder="Select roles..."
            searchPlaceholder="Search roles..."
            className={errors.role ? 'border-red-500' : ''}
            error={!!errors.role}
          />
          {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
          {newUser.role.length > 0 && (
            <p className="text-xs text-gray-600">
              Selected roles: {newUser.role.join(', ')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={newUser.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
          <Input
            id="lastName"
            value={newUser.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">User name <span className="text-red-500">*</span></Label>
          <Input
            id="username"
            value={newUser.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter username"
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={newUser.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter password"
            className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hostname">Host name <span className="text-red-500">*</span></Label>
          <Select value={newUser.hostname} onValueChange={(value) => setNewUser({ ...newUser, hostname: value })}>
            <SelectTrigger error={!!errors.hostname}>
              <SelectValue placeholder="Select hostname" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10.16.7.91">10.16.7.91</SelectItem>
              <SelectItem value="10.16.7.96">10.16.7.96</SelectItem>
            </SelectContent>
          </Select>
          {errors.hostname && <p className="text-red-500 text-xs">{errors.hostname}</p>}
        </div>
       

        {newUser.role.includes('Agent') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="extension">Extension Number <span className="text-red-500">*</span></Label>
              <Input
                id="extension"
                value={newUser.extension}
                onChange={(e) => handleInputChange('extension', e.target.value)}
                placeholder="Enter extension number"
                className={errors.extension ? 'border-red-500' : ''}
              />
              {errors.extension && <p className="text-red-500 text-xs">{errors.extension}</p>}
            </div>
             <div className="space-y-2">
          <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
          <Select value={newUser.type} onValueChange={(value) => setNewUser({ ...newUser, type: value })}>
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
              <Label>Queues <span className="text-red-500">*</span></Label>
              <MultiSelectDropdown
                options={queues.map(queue => ({
                  value: queue.name,
                  label: queue.name
                }))}
                selected={newUser.queues}
                onChange={handleQueueChange}
                placeholder="Select queues..."
                searchPlaceholder="Search queues..."
                className={errors.queues ? 'border-red-500' : ''}
                error={!!errors.queues}
              />
              {errors.queues && <p className="text-red-500 text-xs">{errors.queues}</p>}
              {newUser.queues.length > 0 && (
                <p className="text-xs text-gray-600">
                  Selected queues: {newUser.queues.join(', ')}
                </p>
              )}
            </div>

            {newUser.role.includes('Agent') && newUser.role.length === 1 && (
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor <span className="text-red-500">*</span></Label>
                <Select value={newUser.supervisor} onValueChange={(value) => setNewUser({ ...newUser, supervisor: value })}>
                  <SelectTrigger error={!!errors.supervisor}>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.directory_id} value={supervisor.user_id}>
                        {supervisor.firstname} {supervisor.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisor && <p className="text-red-500 text-xs">{errors.supervisor}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="level">Level <span className="text-red-500">*</span></Label>
              <Input
                id="level"
                type="number"
                value={newUser.level || ''}
                onChange={(e) => handleInputChange('level', e.target.value)}
                placeholder="Enter level"
                className={errors.level ? 'border-red-500' : ''}
              />
              {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
              <Input
                id="position"
                type="number"
                value={newUser.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Enter position"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wrapUpTime">Wrap up time <span className="text-red-500">*</span></Label>
              <Input
                id="wrapUpTime"
                type="number"
                value={newUser.wrapUpTime || ''}
                onChange={(e) => handleInputChange('wrapUpTime', e.target.value)}
                placeholder="Enter wrap up time"
                className={errors.wrapUpTime ? 'border-red-500' : ''}
              />
              {errors.wrapUpTime && <p className="text-red-500 text-xs">{errors.wrapUpTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxNoAnswer">Max no answer <span className="text-red-500">*</span></Label>
              <Input
                id="maxNoAnswer"
                type="number"
                value={newUser.maxNoAnswer || ''}
                onChange={(e) => handleInputChange('maxNoAnswer', e.target.value)}
                placeholder="Enter max no answer"
                className={errors.maxNoAnswer ? 'border-red-500' : ''}
              />
              {errors.maxNoAnswer && <p className="text-red-500 text-xs">{errors.maxNoAnswer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectDelayTime">Reject delay time <span className="text-red-500">*</span></Label>
              <Input
                id="rejectDelayTime"
                type="number"
                value={newUser.rejectDelayTime || ''}
                onChange={(e) => handleInputChange('rejectDelayTime', e.target.value)}
                placeholder="Enter reject delay time"
                className={errors.rejectDelayTime ? 'border-red-500' : ''}
              />
              {errors.rejectDelayTime && <p className="text-red-500 text-xs">{errors.rejectDelayTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="busyDelayTime">Busy delay time <span className="text-red-500">*</span></Label>
              <Input
                id="busyDelayTime"
                type="number"
                value={newUser.busyDelayTime || ''}
                onChange={(e) => handleInputChange('busyDelayTime', e.target.value)}
                placeholder="Enter busy delay time"
                className={errors.busyDelayTime ? 'border-red-500' : ''}
              />
              {errors.busyDelayTime && <p className="text-red-500 text-xs">{errors.busyDelayTime}</p>}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/user-management')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isValidating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isValidating ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
  );
};

export default UserCreation;
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Plus, Edit, Trash2, Phone, Play, Database } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { IVRApiService, IVRFlowData } from '@/services/ivrApi';

// interface IVRFlow {
//   id: string;
//   name: string;
//   prompt: string;
//   options: string[];
//   createdAt: string;
// }

// const IVRFlow = () => {
//   const { toast } = useToast();
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [ivrFlows, setIvrFlows] = useState<IVRFlowData[]>([]);

//   const [newIVRFlow, setNewIVRFlow] = useState({
//     name: '',
//     prompt: '',
//     options: [''],
//     queues: ['']
//   });

//   // Load IVR flows on component mount
//   useEffect(() => {
//     loadIVRFlows();
//   }, []);

//   const loadIVRFlows = async () => {
//     setIsLoading(true);
//     try {
//       const flows = await IVRApiService.getIVRFlows();
//       setIvrFlows(flows);
//     } catch (error) {
//       console.error('Error loading IVR flows:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load IVR flows from database.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateIVRFlow = async () => {
//     if (!newIVRFlow.name || !newIVRFlow.prompt) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const ivrFlowData: IVRFlowData = {
//         id: Date.now().toString(),
//         name: newIVRFlow.name,
//         prompt: newIVRFlow.prompt,
//         options: newIVRFlow.options.filter(option => option.trim() !== ''),
//         menuNodes: [],
//         createdAt: new Date().toISOString()
//       };

//       const success = await IVRApiService.createIVRFlow(ivrFlowData);
      
//       if (success) {
//         await loadIVRFlows(); // Reload flows from database
//         setNewIVRFlow({
//           name: '',
//           prompt: '',
//           options: [''],
//           queues: ['']
//         });
//         setIsCreateDialogOpen(false);
//         toast({
//           title: "IVR Flow Created",
//           description: "New IVR flow has been successfully created and saved to database.",
//         });
//       } else {
//         throw new Error('Failed to create IVR flow');
//       }
//     } catch (error) {
//       console.error('Error creating IVR flow:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create IVR flow. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteIVRFlow = async (ivrFlowId: string) => {
//     setIsLoading(true);
//     try {
//       const success = await IVRApiService.deleteZconnectFlow(parseInt(ivrFlowId));
      
//       if (success) {
//         await loadIVRFlows(); // Reload flows from database
//         toast({
//           title: "IVR Flow Deleted",
//           description: "IVR flow has been successfully deleted from database.",
//         });
//       } else {
//         throw new Error('Failed to delete IVR flow');
//       }
//     } catch (error) {
//       console.error('Error deleting IVR flow:', error);
//       toast({
//         title: "Error",
//         description: "Failed to delete IVR flow. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addOption = () => {
//     setNewIVRFlow({
//       ...newIVRFlow,
//       options: [...newIVRFlow.options, '']
//     });
//   };

//   const updateOption = (index: number, value: string) => {
//     const updatedOptions = [...newIVRFlow.options];
//     updatedOptions[index] = value;
//     setNewIVRFlow({
//       ...newIVRFlow,
//       options: updatedOptions
//     });
//   };

//   const removeOption = (index: number) => {
//     const updatedOptions = newIVRFlow.options.filter((_, i) => i !== index);
//     setNewIVRFlow({
//       ...newIVRFlow,
//       options: updatedOptions
//     });
//   };

//   const addQueue = () => {
//     setNewIVRFlow({
//       ...newIVRFlow,
//       queues: [...newIVRFlow.queues, '']
//     });
//   };

//   const updateQueue = (index: number, value: string) => {
//     const updatedQueues = [...newIVRFlow.queues];
//     updatedQueues[index] = value;
//     setNewIVRFlow({
//       ...newIVRFlow,
//       queues: updatedQueues
//     });
//   };

//   const removeQueue = (index: number) => {
//     const updatedQueues = newIVRFlow.queues.filter((_, i) => i !== index);
//     setNewIVRFlow({
//       ...newIVRFlow,
//       queues: updatedQueues
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">IVR Flow Designer</h1>
//           {/* <p className="text-gray-600 mt-2">Create and manage interactive voice response flows with PostgreSQL integration</p> */}
//         </div>
//         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//           <DialogTrigger asChild>
//             <Button 
//               className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//               disabled={isLoading}
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Create IVR Flow
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Create New IVR Flow</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="flowName">Flow Name</Label>
//                 <Input
//                   id="flowName"
//                   value={newIVRFlow.name}
//                   onChange={(e) => setNewIVRFlow({ ...newIVRFlow, name: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="prompt">Voice Prompt</Label>
//                 <Textarea
//                   id="prompt"
//                   rows={4}
//                   value={newIVRFlow.prompt}
//                   onChange={(e) => setNewIVRFlow({ ...newIVRFlow, prompt: e.target.value })}
//                   placeholder="Enter the voice prompt that will be played to callers..."
//                 />
//               </div>
//               <div>
//                 <Label>Menu Options</Label>
//                 {newIVRFlow.options.map((option, index) => (
//                   <div key={index} className="flex items-center space-x-2 mt-2">
//                     <span className="text-sm font-medium w-8">{index + 1}.</span>
//                     <Input
//                       value={option}
//                       onChange={(e) => updateOption(index, e.target.value)}
//                       placeholder={`Option ${index + 1}`}
//                       className="flex-1"
//                     />
//                     {newIVRFlow.options.length > 1 && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => removeOption(index)}
//                         className="text-red-600"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={addOption}
//                   className="mt-2"
//                 >
//                   Add Option
//                 </Button>
//               </div>
//               <div>
//                 <Label>Queue Assignments</Label>
//                 {newIVRFlow.queues.map((queue, index) => (
//                   <div key={index} className="flex items-center space-x-2 mt-2">
//                     <span className="text-sm font-medium w-8">Q{index + 1}.</span>
//                     <Input
//                       value={queue}
//                       onChange={(e) => updateQueue(index, e.target.value)}
//                       placeholder={`Queue ${index + 1}`}
//                       className="flex-1"
//                     />
//                     {newIVRFlow.queues.length > 1 && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => removeQueue(index)}
//                         className="text-red-600"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={addQueue}
//                   className="mt-2"
//                 >
//                   Add Queue
//                 </Button>
//               </div>
//               <Button 
//                 onClick={handleCreateIVRFlow} 
//                 className="w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Creating...' : 'Create IVR Flow'}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {isLoading && (
//         <div className="flex items-center justify-center py-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="text-gray-600 mt-2">Loading...</p>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {ivrFlows.map((flow) => (
//           <Card key={flow.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex justify-between items-start">
//                 <div className="flex items-center space-x-2">
//                   <Phone className="w-5 h-5 text-green-600" />
//                   <CardTitle className="text-lg">{flow.name}</CardTitle>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button size="sm" variant="outline">
//                     <Play className="w-4 h-4" />
//                   </Button>
//                   <Button size="sm" variant="outline">
//                     <Edit className="w-4 h-4" />
//                   </Button>
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => handleDeleteIVRFlow(flow.id)}
//                     className="text-red-600 hover:text-red-700"
//                     disabled={isLoading}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium text-sm text-gray-700 mb-2">Voice Prompt:</h4>
//                   <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{flow.prompt}</p>
//                 </div>
                
//                 <div>
//                   <h4 className="font-medium text-sm text-gray-700 mb-2">Menu Options:</h4>
//                   <div className="space-y-1">
//                     {flow.options.map((option, index) => (
//                       <div key={index} className="flex items-center space-x-2 text-sm">
//                         <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
//                           {index + 1}
//                         </span>
//                         <span className="text-gray-700">{option}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {flow.menuNodes && flow.menuNodes.length > 0 && (
//                   <div>
//                     <h4 className="font-medium text-sm text-gray-700 mb-2">Database Menu Nodes:</h4>
//                     <div className="text-xs text-gray-500">
//                       {flow.menuNodes.length} node(s) created in PostgreSQL
//                     </div>
//                   </div>
//                 )}
                
//                 <p className="text-xs text-gray-500 mt-4">
//                   Created: {new Date(flow.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {!isLoading && ivrFlows.length === 0 && (
//         <div className="text-center py-12">
//           <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No IVR Flows Found</h3>
//           <p className="text-gray-600 mb-4">Create your first IVR flow to get started.</p>
//           <Button onClick={() => setIsCreateDialogOpen(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Create IVR Flow
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IVRFlow;

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone,
  Users,
  Clock,
  ArrowRight,
  Headphones,
  Volume2,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  UserCheck,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Play,
  Shield,
  Route
} from 'lucide-react';

interface QueueStats {
  id: string;
  name: string;
  waitingCalls: number;
  averageWaitTime: number;
  availableAgents: number;
  totalAgents: number;
  priority: 'high' | 'medium' | 'low';
}

interface IVRPrompt {
  id: string;
  title: string;
  content: string;
  options: { key: string; action: string; destination: string }[];
  isActive: boolean;
  audioFile?: string;
}

interface NewPrompt {
  title: string;
  content: string;
  options: { key: string; action: string; destination: string }[];
}

export default function CallCenterIVR() {
  const [selectedQueue, setSelectedQueue] = useState<string>('sales');
  const [activePrompt, setActivePrompt] = useState<string>('main-menu');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingPrompt, setPlayingPrompt] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [newPrompt, setNewPrompt] = useState<NewPrompt>({
    title: '',
    content: '',
    options: [{ key: '1', action: '', destination: '' }]
  });

  const [prompts, setPrompts] = useState<IVRPrompt[]>([
    {
      id: 'main-menu',
      title: 'Main Menu',
      content: 'Thank you for calling our customer service center. Your call is important to us. Please select from the following options:',
      options: [
        { key: '1', action: 'Sales and New Orders', destination: 'sales' },
        { key: '2', action: 'Technical Support', destination: 'support' },
        { key: '3', action: 'Billing and Account Information', destination: 'billing' },
        { key: '4', action: 'General Information', destination: 'general' },
        { key: '0', action: 'Speak to Operator', destination: 'operator' }
      ],
      isActive: true,
      audioFile: 'main-menu.wav'
    },
    {
      id: 'sales-menu',
      title: 'Sales Department',
      content: 'You have reached the Sales Department. Please choose an option:',
      options: [
        { key: '1', action: 'New Product Information', destination: 'sales-queue' },
        { key: '2', action: 'Existing Order Status', destination: 'order-status' },
        { key: '3', action: 'Return to Main Menu', destination: 'main-menu' }
      ],
      isActive: false,
      audioFile: 'sales-menu.wav'
    },
    {
      id: 'support-menu',
      title: 'Technical Support',
      content: 'Welcome to Technical Support. For faster service, please have your account number ready.',
      options: [
        { key: '1', action: 'Hardware Issues', destination: 'support-queue' },
        { key: '2', action: 'Software Problems', destination: 'support-queue' },
        { key: '3', action: 'Account Access Issues', destination: 'support-queue' },
        { key: '9', action: 'Return to Main Menu', destination: 'main-menu' }
      ],
      isActive: false,
      audioFile: 'support-menu.wav'
    }
  ]);

  const queues: QueueStats[] = [
    {
      id: 'sales',
      name: 'Sales Department',
      waitingCalls: 12,
      averageWaitTime: 3.5,
      availableAgents: 8,
      totalAgents: 12,
      priority: 'high'
    },
    {
      id: 'support',
      name: 'Technical Support',
      waitingCalls: 24,
      averageWaitTime: 8.2,
      availableAgents: 4,
      totalAgents: 15,
      priority: 'high'
    },
    {
      id: 'billing',
      name: 'Billing & Accounts',
      waitingCalls: 6,
      averageWaitTime: 2.1,
      availableAgents: 3,
      totalAgents: 5,
      priority: 'medium'
    },
    {
      id: 'general',
      name: 'General Inquiries',
      waitingCalls: 8,
      averageWaitTime: 5.0,
      availableAgents: 2,
      totalAgents: 6,
      priority: 'low'
    }
  ];

  const playPrompt = (promptId: string) => {
    if (playingPrompt === promptId) {
      setPlayingPrompt('');
    } else {
      setPlayingPrompt(promptId);
      // Simulate audio playback
      setTimeout(() => {
        setPlayingPrompt('');
      }, 3000);
    }
  };

  const deletePrompt = (promptId: string) => {
    if (promptId === 'main-menu') {
      alert('Cannot delete the main menu prompt!');
      return;
    }
    setPrompts(prompts.filter(p => p.id !== promptId));
  };

  const addOptionField = () => {
    setNewPrompt(prev => ({
      ...prev,
      options: [...prev.options, { key: '', action: '', destination: '' }]
    }));
  };

  const removeOptionField = (index: number) => {
    setNewPrompt(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: string, value: string) => {
    setNewPrompt(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const createPrompt = () => {
    if (!newPrompt.title || !newPrompt.content) {
      alert('Please fill in all required fields');
      return;
    }

    const promptId = newPrompt.title.toLowerCase().replace(/\s+/g, '-');
    const prompt: IVRPrompt = {
      id: promptId,
      title: newPrompt.title,
      content: newPrompt.content,
      options: newPrompt.options.filter(opt => opt.key && opt.action),
      isActive: false,
      audioFile: `${promptId}.wav`
    };

    setPrompts(prev => [...prev, prompt]);
    setNewPrompt({ title: '', content: '', options: [{ key: '1', action: '', destination: '' }] });
    setShowCreateForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getQueueUtilization = (available: number, total: number) => {
    return ((total - available) / total) * 100;
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-6 mt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Admin Toggle */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Phone className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Call Center IVR System</h1>
          </div>
          {/* <p className="text-lg text-gray-600">Interactive Voice Response Flow Management</p> */}
          
          <div className="flex justify-center mt-4">
            <Button
              variant={isAdminMode ? "default" : "outline"}
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isAdminMode ? 'Exit Admin Mode' : 'Admin Portal'}
            </Button>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdminMode && (
          <Card className="shadow-xl border-0 border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New IVR Prompt
                </Button>
                <Button 
                  asChild
                  variant="default"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <a href="/ivr-flow-builder">
                    <Route className="h-4 w-4" />
                    IVR Flow Builder
                  </a>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Global Settings
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Prompt Form */}
        {showCreateForm && (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New IVR Prompt
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Prompt Title *</Label>
                  <Input
                    id="title"
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Customer Support Menu"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Prompt Content *</Label>
                <Textarea
                  id="content"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the text that will be spoken to callers..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Menu Options</Label>
                  <Button size="sm" onClick={addOptionField} variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newPrompt.options.map((option, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-2">
                        <Label className="text-xs">Key</Label>
                        <Input
                          value={option.key}
                          onChange={(e) => updateOption(index, 'key', e.target.value)}
                          placeholder="1"
                          maxLength={1}
                        />
                      </div>
                      <div className="col-span-5">
                        <Label className="text-xs">Action Description</Label>
                        <Input
                          value={option.action}
                          onChange={(e) => updateOption(index, 'action', e.target.value)}
                          placeholder="Sales Department"
                        />
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs">Destination</Label>
                        <Input
                          value={option.destination}
                          onChange={(e) => updateOption(index, 'destination', e.target.value)}
                          placeholder="sales-queue"
                        />
                      </div>
                      <div className="col-span-1">
                        {newPrompt.options.length > 1 && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeOptionField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={createPrompt} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Prompt
                </Button>
                <Button 
                  onClick={() => {
                    createPrompt();
                    // Navigate to flow builder after creating prompt
                    window.location.href = '/ivr-flow-builder';
                  }}
                  variant="default"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Route className="h-4 w-4" />
                  Create & Open Flow Builder
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IVR Flow Section */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Active IVR Prompts ({prompts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {prompts.map((prompt) => (
                <div 
                  key={prompt.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${''}
                    activePrompt === prompt.id 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{prompt.title}</h3>
                    <div className="flex items-center gap-2">
                      {isAdminMode && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingPrompt(prompt.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePrompt(prompt.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant={activePrompt === prompt.id ? "default" : "outline"}
                        onClick={() => setActivePrompt(prompt.id)}
                      >
                        {activePrompt === prompt.id ? 'Active' : 'Select'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-700 italic">{prompt.content}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {prompt.options.map((option) => (
                      <div 
                        key={option.key}
                        className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                      >
                        <Badge variant="outline" className="font-mono">
                          {option.key}
                        </Badge>
                        <span className="text-sm flex-1">{option.action}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-blue-600 font-medium">
                          {option.destination}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playPrompt(prompt.id)}
                      className="flex items-center gap-2"
                    >
                      {playingPrompt === prompt.id ? (
                        <>
                          <PauseCircle className="h-3 w-3" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Play Audio
                        </>
                      )}
                    </Button>
                    {prompt.audioFile && (
                      <span className="text-xs text-gray-500">
                        {prompt.audioFile}
                      </span>
                    )}
                    {playingPrompt === prompt.id && (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs">Playing...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />
            
            <div className="flex items-center justify-center gap-4">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <PauseCircle className="h-4 w-4" />
                    Pause Simulation
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Start IVR Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure Prompts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Queue Management */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Queue Management Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {queues.map((queue) => (
                <Card 
                  key={queue.id}
                  className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${''}
                    selectedQueue === queue.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedQueue(queue.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{queue.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(queue.priority)}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waiting Calls</span>
                      <Badge variant="secondary" className="font-bold">
                        {queue.waitingCalls}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Wait Time</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium">{queue.averageWaitTime}m</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Agent Utilization</span>
                        <span className="text-sm font-medium">
                          {queue.availableAgents}/{queue.totalAgents}
                        </span>
                      </div>
                      <Progress 
                        value={getQueueUtilization(queue.availableAgents, queue.totalAgents)}
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Headphones className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {queue.availableAgents} agents available
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Statistics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Active Calls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {queues.reduce((sum, queue) => sum + queue.waitingCalls, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Agents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {queues.reduce((sum, queue) => sum + queue.availableAgents, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(queues.reduce((sum, queue) => sum + queue.averageWaitTime, 0) / queues.length).toFixed(1)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// import React, { useCallback, useState, useRef, useEffect } from 'react';
// import {
//   ReactFlow,
//   addEdge,
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   Connection,
//   Edge,
//   Node,
//   ReactFlowProvider,
//   ReactFlowInstance,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import { GitBranch, Plus, Trash2 } from 'lucide-react';

// import IVRElementsSidebar from '@/components/ivr/IVRElementsSidebar';
// import IVRConfigPanel from '@/components/ivr/IVRConfigPanel';
// import FlowCreationDialog from '@/components/ivr/FlowCreationDialog';
// import StartNode from '@/components/ivr/nodes/StartNode';
// import MenuNode from '@/components/ivr/nodes/MenuNode';
// import PlayPromptNode from '@/components/ivr/nodes/PlayPromptNode';
// import EndNode from '@/components/ivr/nodes/Endnode';
// import { useIVRData } from '@/hooks/useIVRData';
// import TopNavBar from '@/components/layout/TopNavBar';
// import ConditionNode from '@/components/ivr/nodes/ConditionNode';
// import VariableNode from '@/components/ivr/nodes/VariableNode';
// import WebhookNode from '@/components/ivr/nodes/WebhookNode';
// import TransferNode from '@/components/ivr/nodes/TransferNode';
// import DigitsCollectionNode from '@/components/ivr/nodes/DigitsCollectionNode';
// // import useIvrSaveFlow from '@/hooks/useIvrSaveFlow';

// interface TopNavBarProps {
//   // onToggleSidebar: () => void;
//   // isSidebarOpen:any;
//   // flowName?: string;
//   // onBackToProjects?: () => void;
//   // onNewFlow?: () => void;
//   // onSaveDraft?: () => void;
//   // onDeploy?: () => void;
// }
// const nodeTypes = {
//   start: StartNode,
//   menu: MenuNode,
//   playPrompt: PlayPromptNode,
//   end: EndNode,
//   condition: ConditionNode,
//   variable: VariableNode,
//   webhook: WebhookNode,
//   transfer: TransferNode,
//   digitsCollection: DigitsCollectionNode,
// };

// const initialNodes: Node[] = [];
// const initialEdges: Edge[] = [];

// const IVRFlowDesigner:React.FC<TopNavBarProps> = ({
//   // onToggleSidebar,
//   // onBackToProjects,
//   // onNewFlow,
//   // onSaveDraft,
//   // onDeploy
// }) => {
//   const { toast } = useToast();
//   const reactFlowWrapper = useRef<HTMLDivElement>(null);
//   const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
//   const [selectedNode, setSelectedNode] = useState(null);
//   const [flowName, setFlowName] = useState('');
//   const [isFlowCreated, setIsFlowCreated] = useState(false);
//   const [showFlowDialog, setShowFlowDialog] = useState(false);
//   const [currentView, setCurrentView] = useState<'welcome' | 'builder'>('welcome');
//   const [sidebarWidth, setSidebarWidth] = useState(320);
//   const [configPanelWidth, setConfigPanelWidth] = useState(320);
// const [isSidebarOpen, setIsSidebarOpen] = useState(true);
// const [menuOptions, setMenuOptions] = useState<string[]>(['NI', 'NM']); // default fallback

// const toggleSidebar = () => {
//   console.log('Toggling sidebar, current state:', isSidebarOpen, 'new state:', !isSidebarOpen);
//   setIsSidebarOpen(!isSidebarOpen);
//   setSidebarWidth(isSidebarOpen ? 0 : 320); // Collapse to 0px or restore to 320px
// }
// // const {  saveFlow,} = useIvrSaveFlow();
//   const {
//     projectList,
//     activeProject,
//     isDraftSaved,
//     isDeploying,
//     checkFlowName,
//     retrieveFlow,
//     saveFlow,
//     deployFlow,
//     lastData,
//     nodeDetails,
//     counters,
//     setLastData,
//     deleteFlow,
//     loadProjectList,
//     setIsDraftSaved,
//   } = useIVRData();

//   useEffect(() => {
//     loadProjectList();
//   }, []);

//   useEffect(() => {
//     setLastData([{
//       pagesData: {
//         Main: {
//           NodesData: nodes,
//           EdgesData: edges,
//         },
//       },
//       PopupDetails: nodeDetails,
//       pages: ['Main'],
//       pageEntryList: [],
//       Counters: counters,
//     }]);
//   }, [nodes, edges, nodeDetails, counters, setLastData]);

//   const handleFlowCreate = async (name: string) => {
//     const success = await checkFlowName(name, setNodes, setEdges);
//     if (success) {
//       setFlowName(name);
//       setIsFlowCreated(true);
//       setCurrentView('builder');
//       setShowFlowDialog(false);

//       toast({
//         title: "Flow Created",
//         description: `IVR flow "${name}" has been created. You can now start building your flow.`,
//       });
//     }
//   };

//   const handleFlowCancel = () => {
//     setShowFlowDialog(false);
//   };

//   const handleLoadFlow = async (flow: { name: string; id: string }) => {
//     const success = await retrieveFlow(flow.name, setNodes, setEdges);
//     if (success) {
//       setFlowName(flow.name);
//       setIsFlowCreated(true);
//       setCurrentView('builder');
//       setIsDraftSaved(true);
//       toast({
//         title: "Flow Loaded",
//         description: `"${flow.name}" has been loaded successfully.`,
//       });
//     }
//   };

//   const onConnect = useCallback(
//     (params: Connection) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   const onDragOver = useCallback((event: React.DragEvent) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);

//  const onDrop = useCallback(
//   (event: React.DragEvent) => {
//     event.preventDefault();
//     const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
//     const type = event.dataTransfer.getData('application/reactflow');

//     if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowBounds) return;

//     const position = reactFlowInstance.screenToFlowPosition({
//       x: event.clientX - reactFlowBounds.left,
//       y: event.clientY - reactFlowBounds.top,
//     });

//     const newNode: Node = {
//       id: `${type}-${Date.now()}`,
//       type,
//       position,
//       data: {
//         label: type.charAt(0).toUpperCase() + type.slice(1),
//         ...(type === 'menu' && { options: menuOptions }), // 👈 Use dynamic options
//         ...(type === 'playPrompt' && { text: 'Enter your message here', promptType: 'text' }),
//         ...(type === 'condition' && { conditionType: '', conditionValue: '',yesTarget: '',
//     noTarget: '' }),
//          ...(type === 'variable' && {  variableName: '',sessionData: '',operation: 'set'}),
//         ...(type === 'webhook' && { webhookUrl: '', httpMethod: 'POST' }),
//         ...(type === 'transfer' && { transferType: 'blind', transferNumber: '',destinationNumber: '' }),
//         ...(type === 'digitsCollection' && { minDigits: 1, maxDigits: 10, terminatorKey: '#' }),
//       },
//     };

//     setNodes((nds) => nds.concat(newNode));
//   },
//   [reactFlowInstance, setNodes, menuOptions] // 👈 make sure to include menuOptions in deps
// );


//   const onNodeClick = useCallback(
//     (_: React.MouseEvent, node: Node) => {
//       setSelectedNode(node);
//     },
//     []
//   );

//   const handleSaveFlow = async () => {
//     const success = await saveFlow(flowName, lastData);
//     if (success) {
//       toast({
//         title: "Flow Saved",
//         description: `IVR flow "${flowName}" has been saved successfully.`,
//       });
//     }
//   };

//   const handleDeployFlow = async () => {
//     if (!isDraftSaved) {
//       toast({
//         title: "Error",
//         description: "Please save the flow before deploying.",
//         variant: "destructive",
//       });
//       return;
//     }

//     await deployFlow(flowName);
//   };

//   const handleDeleteNode = () => {
//     if (selectedNode) {
//       setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
//       setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
//       setSelectedNode(null);
//       toast({
//         title: "Node Deleted",
//         description: "The selected node has been removed from the flow.",
//       });
//     }
//   };

//   const handleNewFlow = () => {
//     setShowFlowDialog(true);
//   };

//   const handleConfigurationSave = (nodeId: string, configData: any) => {
//     setNodes((nds) =>
//       nds.map((node) =>
//         node.id === nodeId
//           ? { ...node, data: { ...node.data, ...configData } }
//           : node
//       )
//     );
//     toast({
//       title: "Configuration Saved",
//       description: "Node configuration has been updated successfully.",
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'deployed': return 'bg-green-100 text-green-800';
//       case 'saved': return 'bg-blue-100 text-blue-800';
//       case 'draft': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const savedFlows = projectList.map((name, index) => ({
//     id: (index + 1).toString(),
//     name: name,
//     status: name === activeProject ? (isDraftSaved ? 'saved' : 'draft') : 'saved',
//     lastModified: new Date().toISOString().split('T')[0],
//     nodes: 1,
//     connections: 0,
//   }));

//   return (
//     <>
//     <TopNavBar
//   onToggleSidebar={toggleSidebar}
//   flowName={currentView === 'builder' ? flowName : undefined}
//   onBackToProjects={currentView === 'builder' ? () => setCurrentView('welcome') : undefined}
//   onNewFlow={handleNewFlow}
//   onSaveDraft={handleSaveFlow}
//   onDeploy={handleDeployFlow}
// />
//       <FlowCreationDialog
//         isOpen={showFlowDialog}
//         onFlowCreate={handleFlowCreate}
//         onCancel={handleFlowCancel}
//       />

//       <div className="h-screen bg-gray-50 flex flex-col pt-2">
//         {currentView === 'builder' ? (
//           <div className="flex-1 flex pt-0 transition-all duration-300 ease-in-out">
//             <IVRElementsSidebar
//               width={sidebarWidth}
//               onWidthChange={setSidebarWidth}
//             />
            

//             <div className="flex-1 relative h-[calc(100vh-65px)]" ref={reactFlowWrapper}>
//               <ReactFlow
//                 nodes={nodes}
//                 edges={edges}
//                 onNodesChange={onNodesChange}
//                 onEdgesChange={onEdgesChange}
//                 onConnect={onConnect}
//                 onInit={setReactFlowInstance}
//                 onDrop={onDrop}
//                 onDragOver={onDragOver}
//                 onNodeClick={onNodeClick}
//                 nodeTypes={nodeTypes}
//                 fitView
//                 className="bg-gray-50"
//               >
//                 <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
//                 <MiniMap
//                   className="bg-white border border-gray-200 rounded-lg"
//                   nodeColor={(node) => {
//                     switch (node.type) {
//                       case 'start': return '#10b981';
//                       case 'menu': return '#3b82f6';
//                       case 'playPrompt': return '#f59e0b';
//                       case 'end': return '#ef4444';
//                       default: return '#6b7280';
//                     }
//                   }}
//                 />
//                 <Background />
//               </ReactFlow>
//             </div>

//             <div className="w-80 bg-white border-l border-gray-200 h-full">
//               <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
//                 <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
//                 {selectedNode && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleDeleteNode}
//                     className="text-red-600 hover:text-red-700"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 )}
//               </div>
//               <div className="flex-1 overflow-hidden">
//                 <IVRConfigPanel
//                   selectedNode={selectedNode}
//                   setNodes={setNodes}
//                   onConfigurationSave={handleConfigurationSave}
//                   width={configPanelWidth}
//                   onWidthChange={setConfigPanelWidth}
//                 />
//               </div>
//             </div>
//           </div>
//         ) : (
//          <div className="flex-1 pt-0 p-6">
//   <div className="max-w-6xl mx-auto min-h-[calc(100vh-200px)] overflow-auto">
//     <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
//       <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//         <div>
//           <h3 className="text-xl font-semibold text-gray-900">Your IVR Flows</h3>
//           <p className="text-gray-600 mt-1">Manage and edit your existing flows</p>
//         </div>
//         <Button
//           onClick={handleNewFlow}
//           className="bg-blue-600 hover:bg-blue-700"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Create New Flow
//         </Button>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {savedFlows.map((flow) => (
//           <div key={flow.id} className="p-4 hover:bg-gray-50 transition-colors min-h-[80px]">
//             <div className="flex items-center justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center space-x-3">
//                   <h4 className="text-lg font-medium text-gray-900">{flow.name}</h4>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
//                     {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
//                   </span>
//                 </div>
//                 <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
//                   <span>Modified: {flow.lastModified}</span>
//                   <span>{flow.nodes} nodes</span>
//                   <span>{flow.connections} connections</span>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleLoadFlow({ name: flow.name, id: flow.id })}
//                 >
//                   Open
//                 </Button>
//                 <Trash2
//                   onClick={() => deleteFlow(flow.name, setNodes, setEdges)}
//                   className="cursor-pointer text-red-500 hover:text-red-700"
//                   size={16}
//                 />
//                 {flow.status === 'deployed' && (
//                   <div className="flex items-center text-green-600 text-sm">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                     Live
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// </div>
//         )}
//       </div>
//     </>
//   );
// };

// const IVRFlowDesignerWithProvider = () => (
//   <ReactFlowProvider>
//     <IVRFlowDesigner />
//   </ReactFlowProvider>
// );

// export default IVRFlowDesignerWithProvider;



import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, Plus, Trash2 } from 'lucide-react';

import IVRElementsSidebar from '@/components/ivr/IVRElementsSidebar';
import IVRConfigPanel from '@/components/ivr/IVRConfigPanel';
import FlowCreationDialog from '@/components/ivr/FlowCreationDialog';
import StartNode from '@/components/ivr/nodes/StartNode';
import MenuNode from '@/components/ivr/nodes/MenuNode';
import PlayPromptNode from '@/components/ivr/nodes/PlayPromptNode';
import EndNode from '@/components/ivr/nodes/Endnode';
import { useIVRData } from '@/hooks/useIVRData';
import TopNavBar from '@/components/layout/TopNavBar';
import ConditionNode from '@/components/ivr/nodes/ConditionNode';
import VariableNode from '@/components/ivr/nodes/VariableNode';
import WebhookNode from '@/components/ivr/nodes/WebhookNode';
import TransferNode from '@/components/ivr/nodes/TransferNode';
import DigitsCollectionNode from '@/components/ivr/nodes/DigitsCollectionNode';
import { useSidebar } from '@/components/SidebarContext';


const nodeTypes = {
  start: StartNode,
  menu: MenuNode,
  playPrompt: PlayPromptNode,
  end: EndNode,
  condition: ConditionNode,
  variable: VariableNode,
  webhook: WebhookNode,
  transfer: TransferNode,
  digitsCollection: DigitsCollectionNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const IVRFlowDesigner = () => {
  const { toast } = useToast();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState('');
  const [isFlowCreated, setIsFlowCreated] = useState(false);
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'builder'>('welcome');
  // const [sidebarWidth, setSidebarWidth] = useState(320);
  const [configPanelWidth, setConfigPanelWidth] = useState(320);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOptions, setMenuOptions] = useState<string[]>(['NI', 'NM']); // default fallback
console.log("Selected Node in parent component", selectedNode)
  // const toggleSidebar = () => {
  //   console.log('Toggling sidebar, current state:', isSidebarOpen, 'new state:', !isSidebarOpen);
  //   setIsSidebarOpen(!isSidebarOpen);
  //   setSidebarWidth(isSidebarOpen ? 0 : 320); // Collapse to 0px or restore to 320px
  // };

  const {
    projectList,
    activeProject,
    isDraftSaved,
    isDeploying,
    checkFlowName,
    retrieveFlow,
    saveFlow,
    deployFlow,
    lastData,
    nodeDetails,
    counters,
    setLastData,
    deleteFlow,
    loadProjectList,
    setIsDraftSaved,
  } = useIVRData();

  useEffect(() => {
    loadProjectList();
  }, []);
useEffect(() => {
  setSidebarWidth(250);
}, [isSidebarOpen]);
  useEffect(() => {
    setLastData([{
      pagesData: {
        Main: {
          NodesData: nodes,
          EdgesData: edges,
        },
      },
      PopupDetails: nodeDetails,
      pages: ['Main'],
      pageEntryList: [],
      Counters: counters,
    }]);
  }, [nodes, edges, nodeDetails, counters, setLastData]);

  const handleFlowCreate = async (name: string) => {
    const success = await checkFlowName(name, setNodes, setEdges);
    if (success) {
      setFlowName(name);
      setIsFlowCreated(true);
      setCurrentView('builder');
      setShowFlowDialog(false);

      toast({
        title: "Flow Created",
        description: `IVR flow "${name}" has been created. You can now start building your flow.`,
      });
    }
  };

  const handleFlowCancel = () => {
    setShowFlowDialog(false);
  };

const handleLoadFlow = async (flow: { name: string; id: string }) => {
  const success = await retrieveFlow(flow.name, setNodes, setEdges);
  if (success) {
    setFlowName(flow.name);
    setIsFlowCreated(true);
    setCurrentView('builder');
    setIsDraftSaved(true);
    // Dynamically select the start node or the first node
    if (nodes.length > 0) {
      const startNode = nodes.find((node) => node.type === 'start');
      const selected = startNode || nodes[0];
      console.log('Selected node after load:', selected); // Debug log
      setSelectedNode(selected);
    }
    toast({
      title: "Flow Loaded",
      description: `"${flow.name}" has been loaded successfully.`,
    });
  }
};

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowBounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          ...(type === 'menu' && { options: menuOptions }), // Use dynamic options
          ...(type === 'playPrompt' && { text: 'Enter your message here', promptType: 'text' }),
          ...(type === 'condition' && { conditionType: '', conditionValue: '', yesTarget: '', noTarget: '' }),
          ...(type === 'variable' && { variableName: '', sessionData: '', operation: 'set' }),
          ...(type === 'webhook' && { webhookUrl: '', httpMethod: 'POST' }),
          ...(type === 'transfer' && { transferType: 'blind', transferNumber: '', destinationNumber: '' }),
          ...(type === 'digitsCollection' && { minDigits: 1, maxDigits: 10, terminatorKey: '#' }),
        },
      };
      console.log('Adding new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, menuOptions]
  );

const onNodeClick = useCallback(
  (_: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node); // Debug log
    setSelectedNode(node);
  },
  [setSelectedNode] // Add setSelectedNode to dependencies
);

  const handleSaveFlow = async () => {
    const success = await saveFlow(flowName, lastData);
    if (success) {
      toast({
        title: "Flow Saved",
        description: `IVR flow "${flowName}" has been saved successfully.`,
      });
    }
  };

  const handleDeployFlow = async () => {
    if (!isDraftSaved) {
      toast({
        title: "Error",
        description: "Please save the flow before deploying.",
        variant: "destructive",
      });
      return;
    }

    await deployFlow(flowName);
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast({
        title: "Node Deleted",
        description: "The selected node has been removed from the flow.",
      });
    }
  };

  const handleNewFlow = () => {
    setShowFlowDialog(true);
  };

  const handleConfigurationSave = (nodeId: string, configData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...configData } }
          : node
      )
    );
    toast({
      title: "Configuration Saved",
      description: "Node configuration has been updated successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'saved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const savedFlows = projectList.map((name, index) => ({
    id: (index + 1).toString(),
    name: name,
    status: name === activeProject ? (isDraftSaved ? 'saved' : 'draft') : 'saved',
    lastModified: new Date().toISOString().split('T')[0],
    nodes: 1,
    connections: 0,
  }));

  return (
    <>
      <TopNavBar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        flowName={currentView === 'builder' ? flowName : undefined}
        onBackToProjects={currentView === 'builder' ? () => setCurrentView('welcome') : undefined}
        onNewFlow={handleNewFlow}
        onSaveDraft={handleSaveFlow}
        onDeploy={handleDeployFlow}
      />
      <FlowCreationDialog
        isOpen={showFlowDialog}
        onFlowCreate={handleFlowCreate}
        onCancel={handleFlowCancel}
      />

      <div className="h-screen bg-gray-50 flex flex-col pt-2">
        {currentView === 'builder' ? (
          <div className="flex-1 flex pt-0 transition-all duration-300 ease-in-out">
            <IVRElementsSidebar
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
            />

            <div className="flex-1 relative h-[calc(100vh-65px)]" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{ type: 'default' }} // Added to ensure edge type is set
                fitView
                className="bg-gray-50"
                onNodeMouseEnter={(event, node) => console.log('Node hovered:', node.id)}
              >
                <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
                <MiniMap
                  className="bg-white border border-gray-200 rounded-lg"
                  nodeColor={(node) => {
                    switch (node.type) {
                      case 'start': return '#10b981';
                      case 'menu': return '#3b82f6';
                      case 'playPrompt': return '#f59e0b';
                      case 'end': return '#ef4444';
                      default: return '#6b7280';
                    }
                  }}
                />
                <Background />
              </ReactFlow>
            </div>

            <div className="w-80 bg-white border-l border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                {selectedNode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteNode}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <IVRConfigPanel
                  selectedNode={selectedNode}
                  setNodes={setNodes}
                  onConfigurationSave={handleConfigurationSave}
                  width={configPanelWidth}
                  onWidthChange={setConfigPanelWidth}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 pt-0 p-6">
            <div className="max-w-6xl mx-auto min-h-[calc(100vh-200px)] overflow-auto">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Your IVR Flows</h3>
                    <p className="text-gray-600 mt-1">Manage and edit your existing flows</p>
                  </div>
                  <Button
                    onClick={handleNewFlow}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Flow
                  </Button>
                </div>
                <div className="divide-y divide-gray-200">
                  {savedFlows.map((flow) => (
                    <div key={flow.id} className="p-4 hover:bg-gray-50 transition-colors min-h-[80px]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">{flow.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                              {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Modified: {flow.lastModified}</span>
                            <span>{flow.nodes} nodes</span>
                            <span>{flow.connections} connections</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadFlow({ name: flow.name, id: flow.id })}
                          >
                            Open
                          </Button>
                          <Trash2
                            onClick={() => deleteFlow(flow.name, setNodes, setEdges)}
                            className="cursor-pointer text-red-500 hover:text-red-700"
                            size={16}
                          />
                          {flow.status === 'deployed' && (
                            <div className="flex items-center text-green-600 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Live
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const IVRFlowDesignerWithProvider = () => (
  <ReactFlowProvider>
    <IVRFlowDesigner />
  </ReactFlowProvider>
);

export default IVRFlowDesignerWithProvider;
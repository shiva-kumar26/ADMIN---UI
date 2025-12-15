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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, Plus, Trash2, Search } from 'lucide-react';

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
  const [configPanelWidth, setConfigPanelWidth] = useState(320);
  const [menuOptions, setMenuOptions] = useState<string[]>(['NI', 'NM']); // default fallback

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
        variant: 'success'
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
      if (nodes.length > 0) {
        const startNode = nodes.find((node) => node.type === 'start');
        const selected = startNode || nodes[0];
        setSelectedNode(selected);
      }
      toast({
        title: "Flow Loaded",
        description: `"${flow.name}" has been loaded successfully.`,
        variant: 'success'
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
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, menuOptions]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const handleSaveFlow = async () => {
    const success = await saveFlow(flowName, lastData);
    if (success) {
      toast({
        title: "Flow Saved",
        description: `IVR flow "${flowName}" has been saved successfully.`,
        variant: 'success'
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
        variant: 'success'
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
      variant: 'success'
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

  const [searchTerm, setSearchTerm] = useState('');

  const savedFlows = projectList.map((name, index) => ({
    id: (index + 1).toString(),
    name: name,
    status: name === activeProject ? (isDraftSaved ? 'saved' : 'draft') : 'saved',
    lastModified: new Date().toISOString().split('T')[0],
    nodes: 1,
    connections: 0,
  }));

  const filteredFlows = savedFlows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Builder View
  if (currentView === 'builder') {
    return (
      <>
        <TopNavBar
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          flowName={flowName}
          onBackToProjects={() => setCurrentView('welcome')}
          onNewFlow={handleNewFlow}
          onSaveDraft={handleSaveFlow}
          onDeploy={handleDeployFlow}
        />

        <FlowCreationDialog
          isOpen={showFlowDialog}
          onFlowCreate={handleFlowCreate}
          onCancel={handleFlowCancel}
        />

        <div className="w-full h-[calc(100vh-100px)] mt-4 flex flex-col pt-2 overflow-hidden">
          <div className="flex-1 flex pt-0 transition-all duration-300 ease-in-out h-full overflow-hidden">
            <IVRElementsSidebar
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
            />
            <div className="flex-1 relative h-full" ref={reactFlowWrapper}>
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
                defaultEdgeOptions={{ type: 'default' }}
                fitView
                className="bg-gray-50"
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
        </div>
      </>
    );
  }

  // Welcome / List View (Standard Layout)
  return (
    <>
      <FlowCreationDialog
        isOpen={showFlowDialog}
        onFlowCreate={handleFlowCreate}
        onCancel={handleFlowCancel}
      />

      <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">IVR Flows</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage your interactive voice response flows
            </p>
          </div>
          <Button
            onClick={handleNewFlow}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Flow
          </Button>
        </div>

        <div className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search flows..."
                  className="pl-10 bg-white border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Flow Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Last Modified</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nodes</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Connections</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFlows.length > 0 ? (
                  filteredFlows.map((flow) => (
                    <tr key={flow.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-4 h-4 text-blue-600" />
                          <span>{flow.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${flow.status === 'deployed' ? 'bg-green-100 text-green-700' :
                            flow.status === 'saved' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                          }`}>
                          {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{flow.lastModified}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{flow.nodes}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{flow.connections}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadFlow({ name: flow.name, id: flow.id })}
                            className="h-8 text-xs font-medium text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                          >
                            Open Builder
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFlow(flow.name, setNodes, setEdges)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p>No flows match your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
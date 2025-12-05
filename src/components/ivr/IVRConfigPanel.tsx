import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface IVRNodeData {
  label?: string;
  transferNumber?: string;
  [key: string]: any;
}

interface IVRConfigPanelProps {
  // selectedNode: { id: string; type: string; data: any } | null;
  selectedNode?: Node<IVRNodeData>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onConfigurationSave?: (nodeId: string, configData: any) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

interface DigitsNodeData {
  AudioType: 'TTS' | 'PROMPT';
  InitialTTS: string;
  NoInputTTS: string;
  NoMatchTTS: string;
  InitialPrompt: File | null;
  NoInputPrompt: File | null;
  NoMatchPrompt: File | null;
  MinDigits: string;
  MaxDigits: string;
  IntradigitTimeout: string;
  SessionVariable: string;
  Maxtries: string;
}

interface NodeData {
  label?: string;
  type?: string;
   text?: string;
promptType?: 'TTS' | 'PROMPT';
  textToSay?: string;
  noInputTTS?: string;
  noMatchTTS?: string;
  maxTries?: string;
  menuOptions?: string;
  options?: string[]; // Added for storing arbitrary option values
  optionsTarget?: { [key: string]: string }; // Added for mapping options to target nodes
  audioFile?: File | null;
  noInputAudio?: File | null;
  noMatchAudio?: File | null;
  sessionKey?: string;
  conditionOperation?: string;
  sessionValue?: string;
  sessionData?: string;
  operation?: string;
  startIndex?: string;
  endIndex?: string;
  assign?: string;
  concat?: string;
  url?: string;
  httpMethod?: 'GET' | 'POST';
  request?: string;
  apiResponse?: string;
  pageEntry?: string;
  destinationNumber?: string;
  digitsNodeData?: DigitsNodeData;
  variableName?: string;
  popupDetails?: any;
  prompt?: string;
}
interface VariableNodeData {
  label: string;
  variableName?: string;
  sessionData?: string;
  operation?: 'set' | 'get' | 'delete' | 'increment' | 'decrement';
}
const IVRConfigPanel: React.FC<IVRConfigPanelProps> = ({
  selectedNode,
  setNodes,
  onConfigurationSave,
  width,
  onWidthChange,
}) => {
  const [nodeData, setNodeData] = useState<NodeData>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
      const [loading, setLoading] = useState(true);
     const [queues, setQueues] = useState<any[]>([]);
     const [selectedQueue, setSelectedQueue] = useState<string | undefined>(selectedNode?.type === 'transfer' ? selectedNode.data.transferNumber : undefined);
  useEffect(() => {
    if (selectedNode?.type === 'transfer') {
      setLoading(true);
      fetch('https://10.16.7.96/api/api/queue')
        .then(res => res.json())
        .then(data => {
          setQueues(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch queues:", error);
          setLoading(false);
        });
    }
  }, [selectedNode]);

useEffect(() => {
  if (selectedNode) {
    const initialData: NodeData = selectedNode.data || {};
    const popupDetails = initialData.popupDetails || {};
    setNodeData({
      label: initialData.label || '',
      type: selectedNode.type,
      promptType: initialData.promptType || 'TTS',
      // textToSay: initialData.textToSay || initialData.prompt || popupDetails.TexttoSay || '',
      textToSay: selectedNode.type === 'playPrompt' ? initialData.text || popupDetails.TexttoSay || '' : // Prioritize initialData.text for playPrompt
                selectedNode.type === 'menu' ? popupDetails.TexttoSay || initialData.prompt || initialData.textToSay || '' : 
                initialData.textToSay || initialData.prompt || popupDetails.TexttoSay || '',      noInputTTS: initialData.noInputTTS || popupDetails.NoinputTTS || '',
      noMatchTTS: initialData.noMatchTTS || popupDetails.NomatchTTS || '',
      maxTries: initialData.maxTries || popupDetails.Maxtries || '',
      menuOptions: initialData.menuOptions || popupDetails.menuoptions || '',
      options: initialData.options || (popupDetails.menuoptions ? Array.from({ length: parseInt(popupDetails.menuoptions, 10) || 0 }, (_, i) => `${i + 1}`) : []),
      optionsTarget: initialData.optionsTarget || popupDetails.optionsTarget || {},
      audioFile: initialData.audioFile || null,
      noInputAudio: initialData.noInputAudio || null,
      noMatchAudio: initialData.noMatchAudio || null,
      sessionKey: initialData.sessionKey || '',
      conditionOperation: initialData.conditionOperation || '',
      sessionValue: initialData.sessionValue || '',
      sessionData: initialData.sessionData || '',
      operation: initialData.operation || '',
      startIndex: initialData.startIndex || '',
      endIndex: initialData.endIndex || '',
      assign: initialData.assign || '',
      concat: initialData.concat || '',
      url: initialData.url || '',
      httpMethod: initialData.httpMethod || 'GET',
      request: initialData.request || '',
      apiResponse: initialData.apiResponse || '',
      pageEntry: initialData.pageEntry || '',
      destinationNumber: initialData.destinationNumber || '',
      digitsNodeData: initialData.digitsNodeData || {
        AudioType: 'TTS',
        InitialTTS: '',
        NoInputTTS: '',
        NoMatchTTS: '',
        InitialPrompt: null,
        NoInputPrompt: null,
        NoMatchPrompt: null,
        MinDigits: '',
        MaxDigits: '',
        IntradigitTimeout: '',
        SessionVariable: '',
        Maxtries: '',
      },
      variableName: initialData.variableName || '',
      popupDetails: popupDetails,
    });
    setHasUnsavedChanges(false);
    console.log('Initialized nodeData:', nodeData);
    setSelectedQueue(selectedNode.type === 'transfer' ? initialData.destinationNumber : undefined);
  } else {
    setNodeData({});
    setHasUnsavedChanges(false);
    setSelectedQueue(undefined);
  }
  console.log("Selected Node:", selectedNode);
  console.log("Selected Node Data:", selectedNode?.data);
}, [selectedNode]);

const updateNodeData = (updates: Partial<NodeData>) => {
  if (!selectedNode) return;
console.log('Updating node data for node:', selectedNode.id, 'Current nodeData:', nodeData, 'Updates:', updates);
  // Check if there are actual changes
  const hasChanges = Object.keys(updates).some(key => {
    const currentValue = nodeData[key as keyof NodeData];
    const newValue = updates[key as keyof NodeData];
    return JSON.stringify(currentValue) !== JSON.stringify(newValue);
  });

  if (hasChanges) {
    const newData = { ...nodeData, ...updates };
    setNodeData(newData);
    setHasUnsavedChanges(true);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === selectedNode.id ? { ...node, data: newData } : node
      )
    );
  }
  else{
    console.log('No changes detected in node data');
  }
};

  // Handle menu option count change and initialize options array
const handleMenuOptionsChange = (value: string) => {
  const newOptions = Array.from({ length: parseInt(value, 10) || 0 }, (_, i) => `${i + 1}`);
  const newOptionsTarget = { ...nodeData.optionsTarget };
  // Preserve existing targets for new options
  newOptions.forEach((option) => {
    if (!newOptionsTarget[option]) {
      newOptionsTarget[option] = nodeData.optionsTarget?.[option] || '';
    }
  });
  // Remove targets for options no longer present
  Object.keys(newOptionsTarget).forEach((key) => {
    if (!newOptions.includes(key) && key !== 'NI' && key !== 'NM') {
      delete newOptionsTarget[key];
    }
  });
  updateNodeData({ menuOptions: value, options: newOptions, optionsTarget: newOptionsTarget });
};
useEffect(() => {
  console.log('nodeData updated:', nodeData);
}, [nodeData]);
const updateOption = (index: number, value: string) => {
  const newOptions = [...nodeData.options];
  newOptions[index] = value;
  updateNodeData({ options: newOptions });
};

const updateOptionTarget = (option: string, value: string) => {
  const newOptionsTarget = { ...nodeData.optionsTarget, [option]: value };
  updateNodeData({ optionsTarget: newOptionsTarget });
};
  // Generate TexttoSay dynamically based on options
  const generateTextToSay = (options: string[]) => {
    if (options.length === 0 || options.some((opt) => !opt)) return nodeData.textToSay || 'Please provide text to say';
    const optionDescriptions = options.map((opt, idx) => `${opt} for option ${idx + 1}`);
    return `Please select ${optionDescriptions.join(', ')}`;
  };

  const handleSaveConfiguration = () => {
    if (!selectedNode || !hasUnsavedChanges) {
    console.log('No selected node or no unsaved changes, skipping save');
    return;
  }
  console.log('Saving configuration for node:', selectedNode.id, 'Node data:', nodeData);

    // Validation
    if (!nodeData.label?.trim()) {
      toast.error('Node Label is required.');
      return;
    }

    if (selectedNode.type === 'menu') {
      if (nodeData.promptType === 'TTS' && !nodeData.textToSay?.trim()) {
        toast.error('Please enter the initial TTS.');
        return;
      }
      if (nodeData.promptType === 'PROMPT' && !nodeData.audioFile) {
        toast.error('Please select the initial audio file.');
        return;
      }
      if (!nodeData.menuOptions) {
        toast.error('Select Menu Option.');
        return;
      }
      if (!nodeData.maxTries) {
        toast.error('Please enter the max tries value.');
        return;
      }
      if (!nodeData.options || nodeData.options.some((opt) => !opt)) {
        toast.error('Please enter values for all menu options.');
        return;
      }
      if (
        !nodeData.optionsTarget ||
        !nodeData.options.every((opt) => nodeData.optionsTarget && nodeData.optionsTarget[opt])
      ) {
        toast.error('Please select target nodes for all menu options.');
        return;
      }
    }

    if (selectedNode.type === 'playPrompt') {
      if (nodeData.promptType === 'TTS' && !nodeData.textToSay?.trim()) {
        toast.error('Please enter text to speech.');
        return;
      }
      if (nodeData.promptType === 'PROMPT' && !nodeData.audioFile) {
        toast.error('Please upload an audio file.');
        return;
      }
    }

    if (selectedNode.type === 'transfer') {
      if (!nodeData.destinationNumber?.trim()) {
        toast.error('Please enter the destination number.');
        return;
      }
    }

    if (selectedNode.type === 'condition') {
      if (!nodeData.sessionKey?.trim()) {
        toast.error('Please enter the session key.');
        return;
      }
      if (!nodeData.conditionOperation) {
        toast.error('Please select the operation to perform.');
        return;
      }
      if (!nodeData.sessionValue?.trim()) {
        toast.error('Please enter the session value.');
        return;
      }
    }

    if (selectedNode.type === 'variable') {
      if (!nodeData.sessionData?.trim()) {
        toast.error('Please enter the session data.');
        return;
      }
      if (!nodeData.operation) {
        toast.error('Please select the operation to perform.');
        return;
      }
      if (nodeData.operation === 'slice' || nodeData.operation === 'substr' || nodeData.operation === 'replace') {
        if (!nodeData.startIndex?.trim()) {
          toast.error(`Please enter the ${nodeData.operation === 'replace' ? 'string to replace' : 'start index'}.`);
          return;
        }
        if (!nodeData.endIndex?.trim()) {
          toast.error(`Please enter the ${nodeData.operation === 'replace' ? 'replace string' : 'end index'}.`);
          return;
        }
      }
      if (nodeData.operation === 'concat' && !nodeData.concat?.trim()) {
        toast.error('Please enter the string to concat.');
        return;
      }
      if (nodeData.operation === 'assign' && !nodeData.assign?.trim()) {
        toast.error('Please enter the value to assign.');
        return;
      }
    }

    if (selectedNode.type === 'webhook') {
      if (!nodeData.url?.trim()) {
        toast.error('Please enter the URL.');
        return;
      }
      if (!nodeData.apiResponse?.trim()) {
        toast.error('Please enter the value for store response.');
        return;
      }
    }

    if (selectedNode.type === 'exit') {
      if (!nodeData.pageEntry) {
        toast.error('Please select the entry node.');
        return;
      }
    }

    if (selectedNode.type === 'digitsCollection') {
      if (nodeData.digitsNodeData?.AudioType === 'TTS') {
        if (!nodeData.digitsNodeData.InitialTTS.trim()) {
          toast.error('Please enter the initial TTS.');
          return;
        }
        if (!nodeData.digitsNodeData.NoInputTTS.trim()) {
          toast.error('Please enter the no input TTS.');
          return;
        }
        if (!nodeData.digitsNodeData.NoMatchTTS.trim()) {
          toast.error('Please enter the no match TTS.');
          return;
        }
      }
      if (nodeData.digitsNodeData?.AudioType === 'PROMPT') {
        if (!nodeData.digitsNodeData.InitialPrompt) {
          toast.error('Please select initial audio.');
          return;
        }
        if (!nodeData.digitsNodeData.NoInputPrompt) {
          toast.error('Please select no input audio.');
          return;
        }
        if (!nodeData.digitsNodeData.NoMatchPrompt) {
          toast.error('Please select no match audio.');
          return;
        }
      }
      if (!nodeData.digitsNodeData?.MinDigits.trim()) {
        toast.error('Please enter the minimum digits.');
        return;
      }
      if (!nodeData.digitsNodeData?.MaxDigits.trim()) {
        toast.error('Please enter the maximum digits.');
        return;
      }
      if (!nodeData.digitsNodeData?.IntradigitTimeout.trim()) {
        toast.error('Please enter the intra digit timeout.');
        return;
      }
      if (!nodeData.digitsNodeData?.SessionVariable.trim()) {
        toast.error('Please enter the session variable to store.');
        return;
      }
      if (!nodeData.digitsNodeData?.Maxtries.trim()) {
        toast.error('Please enter the max tries.');
        return;
      }
    }
console.log('Validation passed, calling onConfigurationSave with:', nodeData);
    if (onConfigurationSave) {
      onConfigurationSave(selectedNode.id, nodeData);
    }
    setHasUnsavedChanges(false);
    console.log("hasChanges", hasUnsavedChanges)
    console.log('Configuration saved successfully');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.max(250, Math.min(500, startWidth - (e.clientX - startX)));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth, width, onWidthChange]);

const handleQueueChange = (value: string) => {
    setSelectedQueue(value);
    if (selectedNode) {
      updateNodeData({ destinationNumber: value }); // Fixed to use destinationNumber
    }
  };
console.log("nodeData.digitsNodeData?.NoInputTTS", nodeData.digitsNodeData?.NoInputTTS)
  if (!selectedNode) {
    return (
      <div className="min-h-screen flex bg-white border-l border-gray-200" style={{ width }}>
        <div
          className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${isResizing ? 'bg-blue-400' : ''}`}
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Element Selected</h3>
              <p className="text-sm text-gray-600">Select an element from the canvas to configure its properties.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white border-l border-gray-200" style={{ width}}>
      <div
        className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${isResizing ? 'bg-blue-400' : ''}`}
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
        {/* <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            
            {hasUnsavedChanges && (
              <Button size="sm" onClick={handleSaveConfiguration} 
               disabled={!hasUnsavedChanges}
              className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
          </div>
           {hasUnsavedChanges && (
    <p className="text-xs text-amber-600 mt-1">You have unsaved changes</p>
  )}
        </div> */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
          <Card className=''>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                Properties of {nodeData.label || selectedNode.id}
              </CardTitle>
              {hasUnsavedChanges && (
                <p className="text-xs text-amber-600">You have unsaved changes</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nodeLabel">Node Name</Label>
                <Input
                  id="nodeLabel"
                  value={nodeData.label || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ label: e.target.value })}
                  placeholder="Enter node name"
                />
              </div>
              {/* <div>
                <Label htmlFor="variableName">Variable Name</Label>
                <Input
                  id="variableName"
                  value={nodeData.variableName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ variableName: e.target.value })}
                  placeholder="Enter variable name"
                />
              </div> */}

             {selectedNode.type === 'menu' && (
  <div className="space-y-4">
    <div>
      <Label>Prompt Type</Label>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="TTS"
            checked={nodeData.promptType === 'TTS'}
            onChange={() => updateNodeData({ promptType: 'TTS' })}
            className="form-radio"
          />
          <span>TTS</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="PROMPT"
            checked={nodeData.promptType === 'PROMPT'}
            onChange={() => updateNodeData({ promptType: 'PROMPT' })}
            className="form-radio"
          />
          <span>Prompt</span>
        </label>
      </div>
    </div>
    {nodeData.promptType === 'TTS' ? (
      <>
        <div>
          <Label htmlFor="textToSay">Initial TTS</Label>
          <Textarea
            id="textToSay"
            value={nodeData.textToSay || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData({ textToSay: e.target.value })}
            placeholder="Enter initial TTS text"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="noInputTTS">No Input TTS</Label>
          <Textarea
            id="noInputTTS"
            value={nodeData.noInputTTS || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData({ noInputTTS: e.target.value })}
            placeholder="Enter no input TTS text"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="noMatchTTS">No Match TTS</Label>
          <Textarea
            id="noMatchTTS"
            value={nodeData.noMatchTTS || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData({ noMatchTTS: e.target.value })}
            placeholder="Enter no match TTS text"
            rows={3}
          />
        </div>
      </>
    ) : (
      <>
                      <div>
                      <Label htmlFor="audioFile">Audio File</Label>
                      <Input
                        id="audioFile"
                        type="file"
                        accept=".mp3,.wav"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0] || null;
                          updateNodeData({ audioFile: file });
                        }}
                      />
                      {nodeData.audioFile && (
                        <p className="text-sm text-gray-600 mt-1">Selected: {nodeData.audioFile.name}</p>
                      )}
                    </div>
      </>
      // PROMPT handling (omitted for brevity, ensure it’s present)
    )}
    <div>
      <Label htmlFor="menuOptions">Menu Options</Label>
      <Select
        value={nodeData.menuOptions || ''}
        onValueChange={handleMenuOptionsChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select number of options" />
        </SelectTrigger>
        <SelectContent>
          {['2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <SelectItem key={num} value={num}>{num}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label htmlFor="maxTries">Max Tries</Label>
      <Input
        id="maxTries"
        type="number"
        value={nodeData.maxTries || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ maxTries: e.target.value })}
        placeholder="Enter max tries value"
        min="0"
      />
    </div>
    {/* Add dynamic options and targets if not present */}
    {/* {nodeData.options?.map((option, index) => (
      <div key={index}>
        <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
        <Input
          id={`option-${index}`}
          value={option || ''}
          onChange={(e) => updateOption(index, e.target.value)}
          placeholder={`Enter option ${index + 1}`}
        />
      
      </div>
    ))} */}
  </div>
)}
              {selectedNode.type === 'playPrompt' && (
                <div className="space-y-4">
                  <div>
                    <Label>Prompt Type</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="TTS"
                          checked={nodeData.promptType === 'TTS'}
                          onChange={() => updateNodeData({ promptType: 'TTS' })}
                          className="form-radio"
                        />
                        <span>TTS</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="PROMPT"
                          checked={nodeData.promptType === 'PROMPT'}
                          onChange={() => updateNodeData({ promptType: 'PROMPT' })}
                          className="form-radio"
                        />
                        <span>Prompt</span>
                      </label>
                    </div>
                  </div>
                  {nodeData.promptType === 'TTS' ? (
                    <div>
                      <Label htmlFor="textToSay">Text to Speech</Label>
                      <Textarea
                        id="textToSay"
                        value={nodeData.textToSay || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData({ textToSay: e.target.value })}
                        placeholder="Enter text to be spoken"
                        rows={4}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="audioFile">Audio File</Label>
                      <Input
                        id="audioFile"
                        type="file"
                        accept=".mp3,.wav"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0] || null;
                          updateNodeData({ audioFile: file });
                        }}
                      />
                      {nodeData.audioFile && (
                        <p className="text-sm text-gray-600 mt-1">Selected: {nodeData.audioFile.name}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionKey">Session Key</Label>
                    <Input
                      id="sessionKey"
                      value={nodeData.sessionKey || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ sessionKey: e.target.value })}
                      placeholder="Enter session key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditionOperation">Operation to Perform</Label>
                    <Select
                      value={nodeData.conditionOperation || ''}
                      onValueChange={(value: string) => updateNodeData({ conditionOperation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an operation" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Equal to', 'Greater than', 'Less than', 'Not equal to', 'Greater than or equal to', 'Less than or equal to'].map((op) => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sessionValue">Value</Label>
                    <Input
                      id="sessionValue"
                      value={nodeData.sessionValue || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ sessionValue: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={nodeData.url || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ url: e.target.value })}
                      placeholder="Enter the complete URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="httpMethod">HTTP Method</Label>
                    <Select
                      value={nodeData.httpMethod || 'GET'}
                      onValueChange={(value: 'GET' | 'POST') => updateNodeData({ httpMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {nodeData.httpMethod === 'POST' && (
                    <div>
                      <Label htmlFor="request">Request Body</Label>
                      <Input
                        id="request"
                        value={nodeData.request || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ request: e.target.value })}
                        placeholder="Enter request body"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="apiResponse">Store Response</Label>
                    <Input
                      id="apiResponse"
                      value={nodeData.apiResponse || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ apiResponse: e.target.value })}
                      placeholder="Enter variable to store response"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'exit' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pageEntry">Entry Node</Label>
                    <Select
                      value={nodeData.pageEntry || ''}
                      onValueChange={(value: string) => updateNodeData({ pageEntry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry node" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Entry1', 'Entry2'].map((entry) => (
                          <SelectItem key={entry} value={entry}>{entry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedNode.type === 'transfer' && (
                // <div className="space-y-4">
                //   <div>
                //     <Label htmlFor="destinationNumber">Destination Number</Label>
                //     <Input
                //       id="destinationNumber"
                //       type="number"
                //       value={nodeData.destinationNumber || ''}
                //       onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNodeData({ destinationNumber: e.target.value })}
                //       placeholder="Enter destination number to transfer"
                //       min="0"
                //     />
                //   </div>
                // </div>
                 <div>
            <label htmlFor="queueSelect" className="text-sm font-medium text-orange-800">
              Queue
            </label>
            <Select
                      value={selectedQueue || ''}
                      onValueChange={handleQueueChange}
                    >
                      <SelectTrigger className="mt-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-1 w-full">
                        <SelectValue placeholder="Select a queue" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>Loading queues...</SelectItem>
                        ) : queues.length === 0 ? (
                          <SelectItem value="no-queues" disabled>No queues available</SelectItem>
                        ) : (
                          queues.map((queue) => (
                            <SelectItem key={queue.id} value={queue.name}>
                              {queue.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
          </div>
              )}

              {selectedNode.type === 'digitsCollection' && (
                <div className="space-y-4">
                  <div>
                    <Label>Prompt Type</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="TTS"
                          checked={nodeData.digitsNodeData?.AudioType === 'TTS'}
                          onChange={() =>
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, AudioType: 'TTS' },
                            })
                          }
                          className="form-radio"
                        />
                        <span>TTS</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="PROMPT"
                          checked={nodeData.digitsNodeData?.AudioType === 'PROMPT'}
                          onChange={() =>
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, AudioType: 'PROMPT' },
                            })
                          }
                          className="form-radio"
                        />
                        <span>Prompt</span>
                      </label>
                    </div>
                  </div>
                  {nodeData.digitsNodeData?.AudioType === 'TTS' ? (
                    <>
                      <div>
                        <Label htmlFor="initialTTS">Initial TTS</Label>
                        <Textarea
        id="textToSay"
        value={nodeData.textToSay || ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData({ textToSay: e.target.value })}
        placeholder="Enter initial TTS text"
        rows={3}
      />
                      </div>
                      <div>
                        <Label htmlFor="noInputTTS">No Input TTS</Label>
                        <Textarea
                          id="noInputTTS"
                          value={nodeData.digitsNodeData?.NoInputTTS || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, NoInputTTS: e.target.value },
                            })
                          }
                          placeholder="Enter no input TTS text"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="noMatchTTS">No Match TTS</Label>
                        <Textarea
                          id="noMatchTTS"
                          value={nodeData.digitsNodeData?.NoMatchTTS || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, NoMatchTTS: e.target.value },
                            })
                          }
                          placeholder="Enter no match TTS text"
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="initialPrompt">Initial Audio File</Label>
                        <Input
                          id="initialPrompt"
                          type="file"
                          accept=".mp3,.wav"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] || null;
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, InitialPrompt: file },
                            });
                          }}
                        />
                        {nodeData.digitsNodeData?.InitialPrompt && (
                          <p className="text-sm text-gray-600 mt-1">
                            Selected: {nodeData.digitsNodeData.InitialPrompt.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="noInputPrompt">No Input Audio File</Label>
                        <Input
                          id="noInputPrompt"
                          type="file"
                          accept=".mp3,.wav"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] || null;
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, NoInputPrompt: file },
                            });
                          }}
                        />
                        {nodeData.digitsNodeData?.NoInputPrompt && (
                          <p className="text-sm text-gray-600 mt-1">
                            Selected: {nodeData.digitsNodeData.NoInputPrompt.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="noMatchPrompt">No Match Audio File</Label>
                        <Input
                          id="noMatchPrompt"
                          type="file"
                          accept=".mp3,.wav"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] || null;
                            updateNodeData({
                              digitsNodeData: { ...nodeData.digitsNodeData, NoMatchPrompt: file },
                            });
                          }}
                        />
                        {nodeData.digitsNodeData?.NoMatchPrompt && (
                          <p className="text-sm text-gray-600 mt-1">
                            Selected: {nodeData.digitsNodeData.NoMatchPrompt.name}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="minDigits">Minimum Digits</Label>
                    <Input
                      id="minDigits"
                      type="number"
                      value={nodeData.digitsNodeData?.MinDigits || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNodeData({
                          digitsNodeData: { ...nodeData.digitsNodeData, MinDigits: e.target.value },
                        })
                      }
                      placeholder="Enter minimum digits allowed"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDigits">Maximum Digits</Label>
                    <Input
                      id="maxDigits"
                      type="number"
                      value={nodeData.digitsNodeData?.MaxDigits || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNodeData({
                          digitsNodeData: { ...nodeData.digitsNodeData, MaxDigits: e.target.value },
                        })
                      }
                      placeholder="Enter maximum digits allowed"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="intradigitTimeout">Intra Digit Timeout</Label>
                    <Input
                      id="intradigitTimeout"
                      type="number"
                      value={nodeData.digitsNodeData?.IntradigitTimeout || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNodeData({
                          digitsNodeData: { ...nodeData.digitsNodeData, IntradigitTimeout: e.target.value },
                        })
                      }
                      placeholder="Enter intra digit timeout"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionVariable">Session Variable</Label>
                    <Input
                      id="sessionVariable"
                      value={nodeData.digitsNodeData?.SessionVariable || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNodeData({
                          digitsNodeData: { ...nodeData.digitsNodeData, SessionVariable: e.target.value },
                        })
                      }
                      placeholder="Enter session variable to store"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTries">Max Tries</Label>
                    <Input
                      id="maxTries"
                      type="number"
                      value={nodeData.digitsNodeData?.Maxtries || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateNodeData({
                          digitsNodeData: { ...nodeData.digitsNodeData, Maxtries: e.target.value },
                        })
                      }
                      placeholder="Enter max tries value"
                      min="0"
                    />
                  </div>
                </div>
              )}
              {selectedNode?.type === 'variable' && (
                // <div className="space-y-4 p-4">
                <div>
                  {/* <h3 className="text-lg font-semibold mb-4">Properties of Session Variable</h3> */}
                  <div className="mb-4">
                    <Label htmlFor="sessionData">Session Data To Modify</Label>
                    <Input
                      id="sessionData"
                      value={nodeData.sessionData || ''}
                      onChange={(e) => updateNodeData({ sessionData: e.target.value })}
                      placeholder="Enter the session data"
                    />
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="operation">Operation To Perform</Label>
                    <Select
                      value={nodeData.operation || ''}
                      onValueChange={(value) => updateNodeData({ operation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="get">Get</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="increment">Increment</SelectItem>
                        <SelectItem value="decrement">Decrement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setNodeData({});
                setHasUnsavedChanges(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveConfiguration} disabled={!hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IVRConfigPanel;
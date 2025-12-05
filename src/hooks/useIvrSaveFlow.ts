// import { useState, useRef, useEffect } from 'react';
// import { Node, Edge } from '@xyflow/react';
// import { ivrApiService } from '@/services/ivrApiService';
// import { useToast } from '@/hooks/use-toast';

// interface NodeData {
//   id: string;
//   type?: string;
//   nodeType?: string;
//   sourceLabel?: string;
//   source?: string;
//   data?: {
//     label?: string;
//     type?: string;
//     welcomeMessage?: string;
//     prompt?: string;
//     text?: string;
//     options?: string[];
//     endType?: string;
//     popupDetails?: { [key: string]: any };
//   };
//   position?: { x: number; y: number };
//   target?: string;
//   optionsTarget?: { [key: string]: string };
//  popupDetails?: { [key: string]: any };
// }

// interface EdgeData {
//   id?: string;
//   source: string;
//   sourceLabel?: string;
//   target: string;
// }

// interface Counters {
//   menuCounter: number;
//   PlayPromptCounter: number;
//   ExitCounter: number;
//   EntryCounter: number;
//   DigitsCounter: number;
//   sessionVariableCounter: number;
//   TransferCounter: number;
// }

// interface PayloadData {
//   flowName: string;
//   lastData: (NodeData | EdgeData)[];
// }

// export const useIvrSaveFlow = () => {
//   const [isDraftSaved, setIsDraftSaved] = useState(false);
//   const { toast } = useToast();

//   const saveFlow = async (flowName: string, data: any[]) => {
//     try {
//       if (flowName === "") {
//         toast({
//           title: "Error",
//           description: "Failed to save workflow due to an empty flow name",
//           variant: "destructive",
//         });
//         return { success: false };
//       }

//       let nodesData: NodeData[] = [];
//       let edgesData: EdgeData[] = [];
//       let popupDetails: { [key: string]: any } = {};
//       let counters: Counters = { menuCounter: 0, PlayPromptCounter: 0, ExitCounter: 0, EntryCounter: 0, DigitsCounter: 0, sessionVariableCounter: 0, TransferCounter: 0 };

//       // Handle the provided payload structure
//       if (data.length > 0 && data[0]?.pagesData?.Main) {
//         nodesData = data[0].pagesData.Main.NodesData || [];
//         edgesData = data[0].pagesData.Main.EdgesData || [];
//         popupDetails = data[0].PopupDetails || {};
//         counters = data[0].Counters || counters;
//       } else if (data.length > 0 && data[0]?.NodesData) {
//         nodesData = data[0].NodesData || [];
//         edgesData = data[0].EdgesData || [];
//         popupDetails = data[0].PopupDetails || {};
//       }

//       // Transform nodes to match backend expectations
//       const transformedNodes = nodesData.map((node: NodeData, index: number) => {
//         const nodeType = node.type || node.nodeType || 'playPrompt';
//         const nodeId = node.id || `node-${index}`;
//         const sourceLabel = node.sourceLabel || node.data?.label || nodeType;
//         const targetEdge = edgesData.find((edge: EdgeData) => edge.source === nodeId);
//         const target = targetEdge ? targetEdge.target : node.target || '';
//         // const nodePopupDetails = popupDetails[nodeId] || {};
//         const nodePopupDetails = node.data?.popupDetails || popupDetails[nodeId] || {};

//         // Normalize node type for backend
//         const getBackendNodeType = (type: string) => {
//           const lowerType = type.toLowerCase();
//           switch (lowerType) {
//             case 'start':
//             case 'input':
//               return 'Start';
//             case 'menu':
//             case 'output':
//               return 'Menu';
//             case 'playprompt':
//             case 'default':
//               return 'Play Prompt';
//             case 'end':
//             case 'disconnect':
//               return 'Disconnect';
//             default:
//               return 'Play Prompt';
//           }
//         };

//         const backendNodeType = getBackendNodeType(nodeType);

//         // Generate source ID based on node type and counters
//         const getSourceId = () => {
//           if (backendNodeType === 'Start') return String(counters.EntryCounter++ || 1);
//           if (backendNodeType === 'Menu') return String(counters.menuCounter++ || 1);
//           if (backendNodeType === 'Play Prompt') return String(counters.PlayPromptCounter++ || 1);
//           if (backendNodeType === 'Disconnect') return String(counters.ExitCounter++ || 1);
//           if (backendNodeType === 'Transfer') return String(counters.TransferCounter++ || 1);
//           if (backendNodeType === 'DigitsCollection') return String(counters.DigitsCounter++ || 1);
//           if (backendNodeType === 'Decision') return String(counters.sessionVariableCounter++ || 1);
//           return nodeId;
//         };

//         // Build optionsTarget dynamically for Menu nodes
//         const buildOptionsTarget = () => {
//           if (backendNodeType !== 'Menu') return {};
//           const menuEdges = edgesData.filter((edge: EdgeData) => 
//             edge.source === nodeId || 
//             edge.source.startsWith(`c${nodeId}`) || 
//             edge.source.includes(nodeId)
//           );
//           const optionsTarget: { [key: string]: string } = {};
//           // Determine maxOptions from edges or popupDetails, default to 1
//           const maxOptions = Math.max(
//             ...menuEdges
//               .filter(edge => edge.sourceLabel?.match(/^\d+$/))
//               .map(edge => parseInt(edge.sourceLabel || '0')),
//             parseInt(nodePopupDetails.menuoptions) || node.data?.options?.length || 1
//           ) || 1;

//           // Map edges to optionsTarget with safeguard
//           menuEdges.forEach((edge: EdgeData) => {
//             console.log('Processing edge:', edge); // Debug log
//             if (edge.sourceLabel === 'NI') {
//               optionsTarget['NI'] = edge.target || target;
//             } else if (edge.sourceLabel === 'NM') {
//               optionsTarget['NM'] = edge.target || target;
//             } else {
//               const optionMatch = edge.sourceLabel?.match(/^\d+$/);
//               if (optionMatch) {
//                 const optionNum = optionMatch[0];
//                 if (parseInt(optionNum) <= maxOptions) {
//                   optionsTarget[optionNum] = edge.target || target;
//                 }
//               } else if (edge.sourceLabel) {
//                 console.warn(`Unexpected sourceLabel value: ${edge.sourceLabel} for edge ${edge.id}`);
//               }
//             }
//           });

//           // Fill in missing options up to maxOptions with default target
//           for (let i = 1; i <= maxOptions; i++) {
//             if (!optionsTarget[String(i)]) {
//               optionsTarget[String(i)] = target;
//             }
//           }

//           // Ensure NI and NM are always present with default target if not mapped
//           if (!optionsTarget['NI']) optionsTarget['NI'] = target;
//           if (!optionsTarget['NM']) optionsTarget['NM'] = target;

//           return optionsTarget;
//         };

//         return {
//           id: nodeId,
//           nodeType: backendNodeType,
//           sourceLabel: sourceLabel,
//           source: getSourceId(),
//           data: {
//             label: sourceLabel,
//             type: backendNodeType,
//             ...(backendNodeType === 'Start' && {
//               welcomeMessage: node.data?.welcomeMessage || nodePopupDetails.welcomeMessage || 'Welcome',
//               prompt: node.data?.prompt || nodePopupDetails.prompt || 'Welcome to the IVR',
//             }),
//             ...(backendNodeType === 'Play Prompt' && {
//               text: nodePopupDetails.TexttoSay || node.data?.text || 'Enter your message here',
//             }),
//             ...(backendNodeType === 'Menu' && {
//               prompt: node.data?.prompt || nodePopupDetails.prompt || 'Select an option',
//               options: node.data?.options || nodePopupDetails.options || [],
//             }),
//             ...(backendNodeType === 'Disconnect' && {
//               endType: node.data?.endType || nodePopupDetails.endType || 'Disconnect',
//             }),
//           },
//           position: node.position || { x: (index * 200) % 800, y: (index * 200) % 600 },
//           target: target,
//           ...(backendNodeType === 'Menu' && {
//             optionsTarget: buildOptionsTarget(),
//             popupDetails: {
//               id: nodeId,
//               Menuname: sourceLabel,
//               TexttoSay: nodePopupDetails.TexttoSay || 'Please provide text to say',
//               NoinputTTS: nodePopupDetails.NoinputTTS || 'No input received',
//               NomatchTTS: nodePopupDetails.NomatchTTS || 'No match found',
//               menuoptions: String(Object.keys(buildOptionsTarget()).filter(key => !isNaN(parseInt(key))).length || 1),
//               Maxtries: nodePopupDetails.Maxtries || '3',
//               Channel: nodePopupDetails.Channel || '',
//               initialAudio: nodePopupDetails.initialAudio || null,
//               NoinputAudio: nodePopupDetails.NoinputAudio || null,
//               NomatchAudio: nodePopupDetails.NomatchAudio || null,
//               SessionData: nodePopupDetails.SessionData || '',
//               Operation: nodePopupDetails.Operation || '',
//               StartIndex: nodePopupDetails.StartIndex || '',
//               EndIndex: nodePopupDetails.EndIndex || '',
//               Concat: nodePopupDetails.Concat || '',
//               Assign: nodePopupDetails.Assign || '',
//               SessionKey: nodePopupDetails.SessionKey || '',
//               ConditionOperation: nodePopupDetails.ConditionOperation || '',
//               Value: nodePopupDetails.Value || '',
//               apiResponse: nodePopupDetails.apiResponse || null,
//               url: nodePopupDetails.url || null,
//               playprompt: nodePopupDetails.playprompt || '',
//               pageEntry: nodePopupDetails.pageEntry || '',
//               digitsNodeData: {
//                 AudioType: nodePopupDetails.digitsNodeData?.AudioType || 'TTS',
//                 InitialTTS: nodePopupDetails.digitsNodeData?.InitialTTS || '',
//                 NoInputTTS: nodePopupDetails.digitsNodeData?.NoInputTTS || '',
//                 NoMatchTTS: nodePopupDetails.digitsNodeData?.NoMatchTTS || '',
//                 InitialPrompt: nodePopupDetails.digitsNodeData?.InitialPrompt || null,
//                 NoInputPrompt: nodePopupDetails.digitsNodeData?.NoInputPrompt || null,
//                 NoMatchPrompt: nodePopupDetails.digitsNodeData?.NoMatchPrompt || null,
//                 MinDigits: nodePopupDetails.digitsNodeData?.MinDigits || '',
//                 MaxDigits: nodePopupDetails.digitsNodeData?.MaxDigits || '',
//                 IntradigitTimeout: nodePopupDetails.digitsNodeData?.IntradigitTimeout || '',
//                 SessionVariable: nodePopupDetails.digitsNodeData?.SessionVariable || '',
//                 Maxtries: nodePopupDetails.digitsNodeData?.Maxtries || '',
//               },
//               destinationNumber: nodePopupDetails.destinationNumber || null,
//             },
//           }),
//           ...(backendNodeType === 'Play Prompt' && {
//             popupDetails: {
//               id: nodeId,
//               Menuname: sourceLabel,
//               TexttoSay: nodePopupDetails.TexttoSay || node.data?.text || 'Enter your message here',
//               initialAudio: nodePopupDetails.initialAudio || null,
//             },
//           }),
//           ...(backendNodeType === 'Disconnect' && {
//             popupDetails: {
//               id: nodeId,
//               Menuname: sourceLabel,
//             },
//           }),
//         };
//       });

//       const transformedEdges = edgesData.map((edge: EdgeData, index: number) => ({
//         id: edge.id || `reactflow__edge-${edge.source}-${edge.target}-${index}`,
//         source: edge.source,
//         sourceLabel: edge.sourceLabel || transformedNodes.find((n: NodeData) => n.id === edge.source)?.sourceLabel || edge.source,
//         target: edge.target,
//       }));

//       const payload: PayloadData = {
//         flowName,
//         lastData: [...transformedNodes, ...transformedEdges],
//       };

//       console.log('Saving flow with payload:', JSON.stringify(payload, null, 2));

//       const response = await fetch("http://localhost:5000/save-flow", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         setIsDraftSaved(true);
//         toast({
//           title: "Success",
//           description: `${flowName} flow saved successfully`,
//         });
//         return { success: true };
//       } else if (response.status === 400) {
//         const data = await response.json();
//         toast({
//           title: "Error",
//           description: data.error || `Failed to save ${flowName} flow`,
//           variant: "destructive",
//         });
//         return { success: false, error: data.error };
//       } else {
//         console.error("Failed to save flow");
//         toast({
//           title: "Error",
//           description: `Failed to save ${flowName} flow`,
//           variant: "destructive",
//         });
//         return { success: false };
//       }
//     } catch (error) {
//       console.error("Error saving flow:", error);
//       toast({
//         title: "Error",
//         description: `Failed to save ${flowName} flow: ${error.message}`,
//         variant: "destructive",
//       });
//       return { success: false };
//     }
//   };

//   return { saveFlow };
// };

// export default useIvrSaveFlow;
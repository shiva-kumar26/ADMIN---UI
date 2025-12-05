import { useState, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ivrApiService } from '@/services/ivrApiService';
import { useToast } from '@/hooks/use-toast';


interface IVRCounters {
    menuCounter: number;
    audioCounter: number;
    exitCounter: number;
    entryCounter: number;
    DigitsCounter: number;
    TransferCounter: number;
    ApplicationModifierCounter: number;
}


interface NodeData {
    id?: string;
    type?: string;
    nodeType?: string;
    sourceLabel?: string;
    source?: string;
    data?: {
        label?: string;
        type?: string;
        welcomeMessage?: string;
        prompt?: string;
        text?: string;
        textToSay?: string; // Add this for Play Prompt text
        promptType?: string; // Add this for prompt type (e.g., TTS)
        audioFile?: File | string | null; // Add this for audio file support
        options?: string[];
        endType?: string;
        noInputTTS?: string; // Add if used in your nodes
        noMatchTTS?: string; // Add if used in your nodes
        maxTries?: string; // Add if used in your nodes
        menuOptions?: string; // Add if used in your nodes
        optionsTarget?: { [key: string]: string }; // Add if used in Menu nodes
        popupDetails?: { [key: string]: any };
        [key: string]: any; // Optional: Allow additional dynamic properties
    };
    position?: { x: number; y: number };
    target?: string;
    popupDetails?: { [key: string]: any };
}
interface EdgeData {
    id?: string;
    source: string;
    sourceLabel?: string;
    sourceHandle?: string;   // 👈 add this
    targetHandle?: string;
    target: string | null;
}

interface Counters {
    menuCounter: number;
    PlayPromptCounter: number;
    ExitCounter: number;
    EntryCounter: number;
    DigitsCounter: number;
    sessionVariableCounter: number;
    TransferCounter: number;
}

interface PayloadData {
    flowName: string;
    lastData: (NodeData | EdgeData)[];
}


export const useIVRData = () => {

    const { toast } = useToast();

    // State management
    const [projectList, setProjectList] = useState<string[]>([]);
    const [activeProject, setActiveProject] = useState<string>('');
    const [isDraftSaved, setIsDraftSaved] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [pages, setPages] = useState<string[]>(['Main']);
    const [pagesData, setPagesData] = useState<any>({});
    const [pageEntryList, setPageEntryList] = useState<any[]>([]);
    const [nodeDetails, setNodeDetails] = useState<any>({});
    const [lastData, setLastData] = useState<any[]>([]);
    const [pageId, setPageId] = useState(1);

    // Counters using refs
    const counters = useRef<IVRCounters>({
        menuCounter: 1,
        audioCounter: 1,
        exitCounter: 1,
        entryCounter: 1,
        DigitsCounter: 1,
        TransferCounter: 1,
        ApplicationModifierCounter: 1,
    });

    let main_id = 0;
    let currentPage = 'Main';

    // Load project list on mount
    useEffect(() => {
        loadProjectList();
    }, []);
    function validateNodeType(node: Node): boolean {
        const validTypes = ['start', 'playPrompt', 'menu', 'end', 'condition', 'variable', 'webhook', 'transfer', 'digitsCollection'];
        return validTypes.includes(node.type);
    }

    const convertLegacyNodeToIVRNode = (legacyNode: any): Node => {
  console.log('Converting legacy node:', legacyNode);
  // Preserve optionsTarget from root or nested levels before spreading
  const initialOptionsTarget = legacyNode.optionsTarget || legacyNode.data?.optionsTarget || legacyNode.popupDetails?.optionsTarget || {};
  
  const baseNode = {
    id: legacyNode.id,
    position: legacyNode.position || { x: 0, y: 0 },
    sourceLabel: legacyNode.sourceLabel || legacyNode.id,
    data: {
      ...legacyNode.data, // Spread initial data
      label: legacyNode.sourceLabel || legacyNode.data?.label || legacyNode.type,
      target: legacyNode.target || "",
      id: legacyNode.id,
      description: legacyNode.description || "",
      optionsTarget: initialOptionsTarget, // Explicitly set optionsTarget
    },
  };

  const nodeType = legacyNode.nodeType || legacyNode.data?.type || legacyNode.type;
  let effectiveNodeType = nodeType?.toLowerCase() || '';
  if (nodeType?.toLowerCase() === 'destination transfer') {
    effectiveNodeType = 'transfer';
  }

  const labelType = legacyNode.sourceLabel?.toLowerCase() || legacyNode.data?.label?.toLowerCase() || '';
  if (effectiveNodeType === 'play prompt') {
    if (labelType === 'condition') effectiveNodeType = 'condition';
    else if (labelType === 'digitscollection' || labelType === 'digits collection') effectiveNodeType = 'digitscollection';
    else if (labelType === 'transfer') effectiveNodeType = 'transfer';
    else if (labelType === 'variable') effectiveNodeType = 'variable';
    else if (labelType === 'webhook') effectiveNodeType = 'webhook';
  }

  switch (effectiveNodeType) {
    case 'input':
      return {
        ...baseNode,
        type: 'start',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Start',
          type: 'start',
        },
      };
    case 'menu': {
      const optionsTarget = baseNode.data.optionsTarget; // Use the preserved optionsTarget
      console.log(`Converted menu node ${legacyNode.id}, raw optionsTarget:`, optionsTarget);
      const numericOptions = Object.keys(optionsTarget)
        .filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key)))
        .sort((a, b) => parseInt(a) - parseInt(b));

      if (Object.keys(optionsTarget).length === 0) {
        optionsTarget['1'] = legacyNode.target || '';
        optionsTarget['NI'] = legacyNode.target || '';
        optionsTarget['NM'] = legacyNode.target || '';
        console.log(`Defaulted optionsTarget for ${legacyNode.id}:`, optionsTarget);
      } else {
        console.log(`Preserved optionsTarget for ${legacyNode.id}:`, optionsTarget);
      }

      return {
        ...baseNode,
        type: 'menu',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Menu',
          type: 'menu',
          prompt: legacyNode.data?.prompt || legacyNode.data?.TexttoSay || 'Please select an option',
          options: numericOptions, // Use filtered numeric options
          optionsTarget: { ...optionsTarget }, // Ensure optionsTarget is preserved
          popupDetails: {
            ...legacyNode.popupDetails, // Spread the full popupDetails first to preserve all fields
            menuoptions: legacyNode.popupDetails?.menuoptions || String(numericOptions.length || legacyNode.data?.menuoptions || '2'),
            Maxtries: legacyNode.popupDetails?.Maxtries || legacyNode.data?.Maxtries || '3',
            TexttoSay: legacyNode.popupDetails?.TexttoSay || legacyNode.data?.TexttoSay || 'Select an option',
            NoinputTTS: legacyNode.popupDetails?.NoinputTTS || legacyNode.data?.NoinputTTS || 'No input',
            NomatchTTS: legacyNode.popupDetails?.NomatchTTS || legacyNode.data?.NomatchTTS || 'Invalid',
            optionsTarget: { ...optionsTarget }, // Ensure optionsTarget is preserved
          },
        },
      };
    }
    case 'play prompt':
      return {
        ...baseNode,
        type: 'playPrompt',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Play Prompt',
          type: 'playPrompt',
          text: legacyNode.data?.TexttoSay || legacyNode.data?.text || 'Enter your message here',
          promptType: legacyNode.data?.promptType || 'text',
        },
      };
    case 'disconnect':
    case 'output':
      return {
        ...baseNode,
        type: 'end',
        data: {
          ...baseNode.data,
          id: legacyNode.id,
          label: legacyNode.sourceLabel || 'End',
          type: 'end',
          endType: legacyNode.data?.endType || 'Disconnect',
          target: legacyNode.target || null,
        },
      };
    case 'condition':
      console.log("conditionType: legacyNode.data?.conditionType || '',", legacyNode.data?.conditionType || '');
      return {
        ...baseNode,
        type: 'condition',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Condition',
          conditionType: legacyNode.data?.conditionType || 'Condition',
          conditionValue: legacyNode.data?.conditionValue || '',
          yesTarget: legacyNode.data?.yesTarget || '',
          noTarget: legacyNode.data?.noMatchTarget || '',
        },
      };
    case 'variable':
      return {
        ...baseNode,
        type: 'variable',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Variable',
          type: 'variable',
          variableName: legacyNode.data?.variableName || '',
          variableValue: legacyNode.data?.variableValue || '',
        },
      };
    case 'webhook':
      return {
        ...baseNode,
        type: 'webhook',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Webhook',
          type: 'webhook',
          webhookUrl: legacyNode.data?.webhookUrl || '',
          httpMethod: legacyNode.data?.httpMethod || 'POST',
        },
      };
    case 'transfer':
      return {
        ...baseNode,
        type: 'transfer',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Transfer',
          type: 'transfer',
          transferType: legacyNode.data?.transferType || 'blind',
          transferNumber: legacyNode.data?.transferNumber || '',
          destinationNumber: legacyNode.data?.destinationNumber || '',
        },
      };
    case 'digitscollection':
      return {
        ...baseNode,
        type: 'digitsCollection',
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || 'Digits Collection',
          type: 'digitsCollection',
          minDigits: legacyNode.data?.minDigits || 1,
          maxDigits: legacyNode.data?.maxDigits || 10,
          terminatorKey: legacyNode.data?.terminatorKey || '#',
        },
      };
    default:
      console.warn(`Unknown nodeType: ${nodeType}, defaulting to generic node`);
      return {
        ...baseNode,
        type: nodeType.toLowerCase(), // Preserve original type if possible
        data: {
          ...baseNode.data,
          label: legacyNode.sourceLabel || nodeType,
          type: nodeType.toLowerCase(),
        },
      };
  }
};

//     const convertLegacyNodeToIVRNode = (legacyNode: any): Node => {
//   console.log('Converting legacy node:', legacyNode);
//   const baseNode = {
//     id: legacyNode.id,
//     position: legacyNode.position || { x: 0, y: 0 },
//     sourceLabel: legacyNode.sourceLabel || legacyNode.id,
//     data: {
//       ...legacyNode.data,
//       label: legacyNode.sourceLabel || legacyNode.data?.label || legacyNode.type,
//       target: legacyNode.target || "",
//       id: legacyNode.id,
//       description: legacyNode.description || "",
//       optionsTarget: legacyNode.data?.optionsTarget || legacyNode.popupDetails?.optionsTarget || {},
//     },
//   };

//   const nodeType = legacyNode.nodeType || legacyNode.data?.type || legacyNode.type;
//   let effectiveNodeType = nodeType?.toLowerCase() || '';
//   if (nodeType?.toLowerCase() === 'destination transfer') {
//     effectiveNodeType = 'transfer';
//   }

//   const labelType = legacyNode.sourceLabel?.toLowerCase() || legacyNode.data?.label?.toLowerCase() || '';
//   if (effectiveNodeType === 'play prompt') {
//     if (labelType === 'condition') effectiveNodeType = 'condition';
//     else if (labelType === 'digitscollection' || labelType === 'digits collection') effectiveNodeType = 'digitscollection';
//     else if (labelType === 'transfer') effectiveNodeType = 'transfer';
//     else if (labelType === 'variable') effectiveNodeType = 'variable';
//     else if (labelType === 'webhook') effectiveNodeType = 'webhook';
//   }

//   switch (effectiveNodeType) {
//     case 'input':
//       return {
//         ...baseNode,
//         type: 'start',
//         data: {
//           label: legacyNode.sourceLabel || 'Start',
//           type: 'start',
//         },
//       };
//     case 'menu': {
//     //   const optionsTarget = legacyNode.data?.optionsTarget || legacyNode.popupDetails?.optionsTarget || {};
//     const optionsTarget = baseNode.data.optionsTarget; // Use the preserved optionsTarget
//       console.log("optionstarget", optionsTarget)
//       console.log(`Converted menu node ${legacyNode.id}, raw optionsTarget:`, optionsTarget);
//       const numericOptions = Object.keys(optionsTarget)
//         .filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key)))
//         .sort((a, b) => parseInt(a) - parseInt(b));

//       if (Object.keys(optionsTarget).length === 0) {
//         optionsTarget['1'] = legacyNode.target || '';
//         optionsTarget['NI'] = legacyNode.target || '';
//         optionsTarget['NM'] = legacyNode.target || '';
//         console.log(`Defaulted optionsTarget for ${legacyNode.id}:`, optionsTarget);
//       } else {
//         console.log(`Preserved optionsTarget for ${legacyNode.id}:`, optionsTarget);
//       }

//       return {
//         ...baseNode,
//         type: 'menu',
//         data: {
//           label: legacyNode.sourceLabel || 'Menu',
//           type: 'menu',
//           prompt: legacyNode.data?.prompt || legacyNode.data?.TexttoSay || 'Please select an option',
//         //   options: Object.keys(optionsTarget).filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key))),
//         options: numericOptions, // Use filtered numeric options
//           optionsTarget: { ...optionsTarget }, // Ensure optionsTarget is preserved
//           popupDetails: {
//             ...legacyNode.popupDetails,
//             menuoptions: String(numericOptions.length || legacyNode.data?.menuoptions || '2'),
//             Maxtries: legacyNode.data?.Maxtries || '3',
//             TexttoSay: legacyNode.data?.TexttoSay || 'Select an option',
//             NoinputTTS: legacyNode.data?.NoinputTTS || 'No input',
//             NomatchTTS: legacyNode.data?.NomatchTTS || 'Invalid',
//             optionsTarget: { ...optionsTarget }, // Preserve in popupDetails as well
//           },
//         },
//       };
//     }
//     case 'play prompt':
//       return {
//         ...baseNode,
//         type: 'playPrompt',
//         data: {
//           label: legacyNode.sourceLabel || 'Play Prompt',
//           type: 'playPrompt',
//           text: legacyNode.data?.TexttoSay || legacyNode.data?.text || 'Enter your message here',
//           promptType: legacyNode.data?.promptType || 'text',
//         },
//       };
//     case 'disconnect':
//     case 'output':
//       return {
//         ...baseNode,
//         type: 'end',
//         data: {
//           id: legacyNode.id,
//           label: legacyNode.sourceLabel || 'End',
//           type: 'end',
//           endType: legacyNode.data?.endType || 'Disconnect',
//           target: legacyNode.target || null,
//         },
//       };
//     case 'condition':
//       console.log("conditionType: legacyNode.data?.conditionType || '',", legacyNode.data?.conditionType || '');
//       return {
//         ...baseNode,
//         type: 'condition',
//         data: {
//           ...baseNode.data,
//           label: legacyNode.sourceLabel || 'Condition',
//           conditionType: legacyNode.data?.conditionType || 'Condition',
//           conditionValue: legacyNode.data?.conditionValue || '',
//           yesTarget: legacyNode.data?.yesTarget || '',
//           noTarget: legacyNode.data?.noMatchTarget || '',
//         },
//       };
//     case 'variable':
//       return {
//         ...baseNode,
//         type: 'variable',
//         data: {
//           label: legacyNode.sourceLabel || 'Variable',
//           type: 'variable',
//           variableName: legacyNode.data?.variableName || '',
//           variableValue: legacyNode.data?.variableValue || '',
//         },
//       };
//     case 'webhook':
//       return {
//         ...baseNode,
//         type: 'webhook',
//         data: {
//           label: legacyNode.sourceLabel || 'Webhook',
//           type: 'webhook',
//           webhookUrl: legacyNode.data?.webhookUrl || '',
//           httpMethod: legacyNode.data?.httpMethod || 'POST',
//         },
//       };
//     case 'transfer':
//       return {
//         ...baseNode,
//         type: 'transfer',
//         data: {
//           label: legacyNode.sourceLabel || 'Transfer',
//           type: 'transfer',
//           transferType: legacyNode.data?.transferType || 'blind',
//           transferNumber: legacyNode.data?.transferNumber || '',
//           destinationNumber: legacyNode.data?.destinationNumber || '',
//         },
//       };
//     case 'digitscollection':
//       return {
//         ...baseNode,
//         type: 'digitsCollection',
//         data: {
//           label: legacyNode.sourceLabel || 'Digits Collection',
//           type: 'digitsCollection',
//           minDigits: legacyNode.data?.minDigits || 1,
//           maxDigits: legacyNode.data?.maxDigits || 10,
//           terminatorKey: legacyNode.data?.terminatorKey || '#',
//         },
//       };
//     default:
//       console.warn(`Unknown nodeType: ${nodeType}, defaulting to generic node`);
//       return {
//         ...baseNode,
//         type: nodeType.toLowerCase(), // Preserve original type if possible
//         data: {
//           ...baseNode.data,
//           label: legacyNode.sourceLabel || nodeType,
//           type: nodeType.toLowerCase(),
//         },
//       };
//   }
// };


//     const convertLegacyNodeToIVRNode = (legacyNode: any): Node => {
//         console.log('Converting legacy node:', legacyNode);
//         const baseNode = {
//             id: legacyNode.id,
//             position: legacyNode.position || { x: 0, y: 0 },
//             sourceLabel: legacyNode.sourceLabel || legacyNode.id,
//             data: {
//                 ...legacyNode.data,
//                 label: legacyNode.sourceLabel || legacyNode.data?.label || legacyNode.type,
//                 target: legacyNode.target || "",
//                 id: legacyNode.id,
//                 description: legacyNode.description || "",
//             },
//         };

//         const nodeType = legacyNode.nodeType || legacyNode.data?.type || legacyNode.type;
//         let effectiveNodeType = nodeType?.toLowerCase() || '';
//         if (nodeType?.toLowerCase() === 'destination transfer') {
//             effectiveNodeType = 'transfer';
//         }

//         const labelType = legacyNode.sourceLabel?.toLowerCase() || legacyNode.data?.label?.toLowerCase() || '';
//         if (effectiveNodeType === 'play prompt') {
//             if (labelType === 'condition') effectiveNodeType = 'condition';
//             else if (labelType === 'digitscollection' || labelType === 'digits collection') effectiveNodeType = 'digitscollection';
//             else if (labelType === 'transfer') effectiveNodeType = 'transfer';
//             else if (labelType === 'variable') effectiveNodeType = 'variable';
//             else if (labelType === 'webhook') effectiveNodeType = 'webhook';

//         }

//         switch (effectiveNodeType) {
//             case 'input':
//                 return {
//                     ...baseNode,
//                     type: 'start',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Start',
//                         type: 'start',

//                     },
//                 };
//             // case 'menu': {

//             //     const optionsTarget = legacyNode.data?.optionsTarget ||
//             //         legacyNode.popupDetails?.optionsTarget ||
//             //         legacyNode.optionsTarget || {};

//             //     // Extract numeric options (filter out NI/NM)
//             //     const numericOptions = Object.keys(optionsTarget)
//             //         .filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key)))
//             //         .sort((a, b) => parseInt(a) - parseInt(b));

//             //     // Ensure at least default options exist
//             //     if (numericOptions.length === 0) {
//             //         optionsTarget['1'] = legacyNode.target || '';
//             //         optionsTarget['NI'] = legacyNode.target || '';
//             //         optionsTarget['NM'] = legacyNode.target || '';
//             //     }

//             //     return {
//             //         ...baseNode,
//             //         type: 'menu',
//             //         data: {
//             //             label: legacyNode.sourceLabel || 'Menu',
//             //             type: 'menu',
//             //             prompt: legacyNode.data?.prompt || legacyNode.data?.TexttoSay || 'Please select an option',
//             //             options: Object.keys(optionsTarget).filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key))),
//             //             optionsTarget: optionsTarget,
//             //             popupDetails: {
//             //                 ...legacyNode.popupDetails,
//             //                 menuoptions: String(numericOptions.length || legacyNode.data?.menuoptions || '2'),
//             //                 Maxtries: legacyNode.data?.Maxtries || '3',
//             //                 TexttoSay: legacyNode.data?.TexttoSay || 'Select an option',
//             //                 NoinputTTS: legacyNode.data?.NoinputTTS || 'No input',
//             //                 NomatchTTS: legacyNode.data?.NomatchTTS || 'Invalid',
//             //                 optionsTarget: optionsTarget
//             //             },
//             //         },

//             //     };
//             // }
//             case 'menu': {
//                 const optionsTarget = legacyNode.data?.optionsTarget ||
//                     legacyNode.popupDetails?.optionsTarget ||
//                     legacyNode.optionsTarget || {};
//                     console.log(`Converted menu node ${legacyNode.id}, raw optionsTarget:`, optionsTarget); // Log raw optionsTarget
//                 // const numericOptions = Object.keys(optionsTarget)
//                 //     .filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key)))
//                 //     .sort((a, b) => parseInt(a) - parseInt(b));

//  if (Object.keys(optionsTarget).length === 0) {
//         optionsTarget['1'] = legacyNode.target || '';
//         optionsTarget['NI'] = legacyNode.target || '';
//         optionsTarget['NM'] = legacyNode.target || '';
//         console.log(`Defaulted optionsTarget for ${legacyNode.id}:`, optionsTarget); // Log defaulted optionsTarget
//       } else {
//         console.log(`Preserved optionsTarget for ${legacyNode.id}:`, optionsTarget); // Log preserved optionsTarget
//       }
//       const numericOptions = Object.keys(optionsTarget)
//         .filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key)))
//         .sort((a, b) => parseInt(a) - parseInt(b));

//                 return {
//                     ...baseNode,
//                     type: 'menu',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Menu',
//                         type: 'menu',
//                         prompt: legacyNode.data?.prompt || legacyNode.data?.TexttoSay || 'Please select an option',
//                         options: Object.keys(optionsTarget).filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key))),
//                         optionsTarget: { ...optionsTarget },
//                         popupDetails: {
//                             ...legacyNode.popupDetails,
//                             menuoptions: String(numericOptions.length || legacyNode.data?.menuoptions || '2'),
//                             Maxtries: legacyNode.data?.Maxtries || '3',
//                             TexttoSay: legacyNode.data?.TexttoSay || 'Select an option',
//                             NoinputTTS: legacyNode.data?.NoinputTTS || 'No input',
//                             NomatchTTS: legacyNode.data?.NomatchTTS || 'Invalid',
//                             optionsTarget: { ...optionsTarget },
//                         },
//                     },
//                 };
//             }
//             case 'play prompt':
//                 return {
//                     ...baseNode,
//                     type: 'playPrompt',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Play Prompt',
//                         type: 'playPrompt',
//                         text: legacyNode.data?.TexttoSay || legacyNode.data?.text || 'Enter your message here',
//                         promptType: legacyNode.data?.promptType || 'text',
//                     },
//                 };
//             case 'disconnect':
//             case 'output':
//                 return {
//                     ...baseNode,
//                     type: 'end',
//                     data: {
//                         id: legacyNode.id,
//                         label: legacyNode.sourceLabel || 'End',
//                         type: 'end',
//                         endType: legacyNode.data?.endType || 'Disconnect',
//                         target: legacyNode.target || null,
//                     },
//                 };
//             case 'condition':
//                 console.log("conditionType: legacyNode.data?.conditionType || '',", legacyNode.data?.conditionType || '',)
//                 return {
//                     ...baseNode,
//                     type: 'condition',
//                     data: {
//                         ...baseNode.data,
//                         label: legacyNode.sourceLabel || 'Condition',
//                         conditionType: legacyNode.data?.conditionType || 'Condition',
//                         conditionValue: legacyNode.data?.conditionValue || '',

//                         yesTarget: legacyNode.data?.yesTarget || '',
//                         noTarget: legacyNode.data?.noTarget || ''
//                     },
//                 };
//             case 'variable':
//                 return {
//                     ...baseNode,
//                     type: 'variable',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Variable',
//                         type: 'variable',
//                         variableName: legacyNode.data?.variableName || '',
//                         variableValue: legacyNode.data?.variableValue || '',
//                     },
//                 };
//             case 'webhook':
//                 return {
//                     ...baseNode,
//                     type: 'webhook',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Webhook',
//                         type: 'webhook',
//                         webhookUrl: legacyNode.data?.webhookUrl || '',
//                         httpMethod: legacyNode.data?.httpMethod || 'POST',
//                     },
//                 };
//             case 'transfer':
//                 return {
//                     ...baseNode,
//                     type: 'transfer',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Transfer',
//                         type: 'transfer',
//                         transferType: legacyNode.data?.transferType || 'blind',
//                         transferNumber: legacyNode.data?.transferNumber || '',
//                         destinationNumber: legacyNode.data?.destinationNumber || '',
//                     },
//                 }
//             case 'digitscollection':
//                 return {
//                     ...baseNode,
//                     type: 'digitsCollection',
//                     data: {
//                         label: legacyNode.sourceLabel || 'Digits Collection',
//                         type: 'digitsCollection',
//                         minDigits: legacyNode.data?.minDigits || 1,
//                         maxDigits: legacyNode.data?.maxDigits || 10,
//                         terminatorKey: legacyNode.data?.terminatorKey || '#',
//                     },
//                 };
//             default:
//                 console.warn(`Unknown nodeType: ${nodeType}, defaulting to playPrompt`);
//                 // Instead of forcing playPrompt, keep the original type if possible
//                 return {
//                     ...baseNode,
//                     type: nodeType.toLowerCase(), // Try to preserve original type
//                     data: {
//                         ...baseNode.data,
//                         label: legacyNode.sourceLabel || nodeType,
//                         type: nodeType.toLowerCase(),
//                         // Only add playPrompt-specific fields if it's actually a playPrompt
//                         ...(nodeType.toLowerCase() === 'playprompt' && {
//                             text: legacyNode.data?.TexttoSay || legacyNode.data?.text || 'Enter your message here',
//                             promptType: legacyNode.data?.promptType || 'text',
//                         }),
//                     },
//                 };
//         }
//     };


    const loadProjectList = async () => {
        try {
            const projects = await ivrApiService.getProjectList();
            console.log('Loaded projects:', projects);
            setProjectList(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast({
                title: "Error",
                description: "Failed to fetch projects.",
                variant: "destructive",
            });
        }
    };

    const checkFlowName = async (flowName: string, setNodes: any, setEdges: any) => {
        try {
            const checkData = await ivrApiService.checkFlowName(flowName);

            if (checkData.exists) {
                toast({
                    title: "Error",
                    description: `${flowName} name already exists. Please choose another name.`,
                    variant: "destructive",
                });
                return false;
            }

            main_id = 0;
            const startNode = {
                id: `start-${counters.current.entryCounter}`,
                type: 'Start',
                nodeType: 'Start',
                data: { label: 'Start', type: 'Start', welcomeMessage: 'Welcome', prompt: 'Welcome to the IVR' },
                position: { x: 150, y: 100 },
                sourceLabel: 'Start',
                target: '',
                // source: String(counters.current.entryCounter), // if you need a source property
            };
            console.log('New flow created with start node:', startNode);
            setNodes([startNode]);
            setEdges([]);
            setLastData([]);
            setPages(['Main']);
            setPagesData({ Main: { NodesData: [startNode], EdgesData: [] } });
            setPageId(1);
            setPageEntryList([]);
            currentPage = 'Main';
            setProjectList((prev) => [...prev, flowName]);

            counters.current = {
                menuCounter: 1,
                audioCounter: 1,
                exitCounter: 1,
                entryCounter: 2,
                DigitsCounter: 1,
                TransferCounter: 1,
                ApplicationModifierCounter: 1,
            };

            return true;
        } catch (error) {
            console.error("Error checking flow name:", error);
            toast({
                title: "Error",
                description: "Failed to check flow name. Please try again.",
                variant: "destructive",
            });
            return false;
        }
    };


const retrieveFlow = async (flowName: string, setNodes: any, setEdges: any) => {
  try {
    console.log('Retrieving flow:', flowName);
    const checkData = await ivrApiService.retrieveFlowData(flowName);
    console.log('Raw retrieved data:', checkData);

    let flowData: any;
    if (typeof checkData === 'string') {
      try {
        flowData = JSON.parse(checkData);
      } catch (e) {
        console.error('Failed to parse flow data:', checkData);
        toast({
          title: "Error",
          description: "Unable to parse flow data",
          variant: "destructive",
        });
        return false;
      }
    } else if (Array.isArray(checkData)) {
      flowData = checkData;
    } else if (checkData && typeof checkData === 'object') {
      if (checkData.pagesData?.Main) {
        flowData = [
          ...checkData.pagesData.Main.NodesData,
          ...checkData.pagesData.Main.EdgesData,
        ];
      } else if (checkData["0"]) {
        flowData = checkData["0"];
      } else {
        flowData = Object.values(checkData).flat();
      }
    } else {
      toast({
        title: "Error",
        description: "Unable to retrieve the flow",
        variant: "destructive",
      });
      return false;
    }

    // Filter nodes and edges
    const edgesData = flowData.filter(
      (item: any) =>
        typeof item.source === 'string' &&
        (typeof item.target === 'string' || item.target === null)
    );
    const nodesData = flowData.filter((item: any) => typeof item.nodeType === 'string');

    console.log('Extracted nodesData:', nodesData);
    console.log('Extracted edgesData:', edgesData);

    // Convert nodes
    const convertedNodes: Node[] = nodesData.map((node: any) => convertLegacyNodeToIVRNode(node));

    // Create edges, ensuring no duplicates
    const convertedEdges: Edge[] = [];
    const edgeIds = new Set();

    // Define menuNodes from convertedNodes instead of nodesData
    const menuNodes = convertedNodes.filter((node: any) => node.data.type?.toLowerCase() === 'menu');

    // Add non-menu edges first
    edgesData.forEach((edge: any, index: number) => {
      let correctedSource = edge.source;
      let correctedTarget = edge.target;
      if (typeof correctedTarget !== 'string') {
        correctedTarget = null;
      }
      if (edge.source === 'start-0' && nodesData.some((n: any) => n.id === 'start-1')) {
        correctedSource = 'start-1';
      }
      const edgeId = edge.id || `edge-${correctedSource}-${correctedTarget || 'null'}-${index}`;
      if (!edgeIds.has(edgeId) && correctedTarget) {
        if (!menuNodes.some((node: any) => node.id === correctedSource)) {
          edgeIds.add(edgeId);
          convertedEdges.push({
            id: edgeId,
            source: correctedSource,
            target: correctedTarget,
            type: 'default',
            data: { label: edge.sourceLabel || '' },
          });
          console.log(`Added non-menu edge: ${edgeId}`);
        }
      }
    });

    // Handle Menu node edges using optionsTarget directly
    menuNodes.forEach((node: any) => {
      const nodeId = node.id;
      const optionsTarget = node.data?.optionsTarget || node.data?.popupDetails?.optionsTarget || {};

      console.log(`Processing menu node ${nodeId}, optionsTarget:`, optionsTarget);

      // Ensure all optionsTarget entries are used
      Object.entries(optionsTarget).forEach(([option, target]) => {
        if (typeof target === 'string' && target) {
          let edgeIdPrefix = `xy-edge__${nodeId}`;
          let edgeIdSuffix = target;
          if (option === 'NI') {
            edgeIdPrefix += 'no-input';
          } else if (option === 'NM') {
            edgeIdPrefix += 'no-match';
          } else {
            edgeIdPrefix += `option-${parseInt(option) - 1}`;
          }
          const edgeId = `${edgeIdPrefix}-${edgeIdSuffix}`;
          if (!edgeIds.has(edgeId)) {
            edgeIds.add(edgeId);
            convertedEdges.push({
              id: edgeId,
              source: nodeId,
              target: target, // Use the specific target from optionsTarget
              sourceHandle: option, // Match the handle ID in MenuNode
              type: 'default',
              data: {
                label: option === 'NI' ? 'No Input' : option === 'NM' ? 'No Match' : `Option ${option}`,
              },
            });
            console.log(`Added menu edge: ${edgeId} with sourceHandle ${option} and target ${target}`);
          }
        }
      });
    });

    console.log('Final converted edges:', convertedEdges);

    // Update React Flow state
    setNodes(convertedNodes);
    setEdges(convertedEdges);

    // Update other state
    setActiveProject(flowName);
    setLastData([
      {
        pagesData: { Main: { NodesData: nodesData, EdgesData: edgesData } },
        PopupDetails: {},
        nodeDetails: {},
        pages: ['Main'],
        pageEntryList: [],
        Counters: counters.current,
      },
    ]);
    main_id = 0;
    currentPage = 'Main';
    setPages(['Main']);
    setPagesData({ Main: { NodesData: nodesData, EdgesData: edgesData } });
    setPageEntryList([]);
    setNodeDetails({});
    setIsDraftSaved(true);

    return true;
  } catch (error) {
    console.error('Error retrieving flow:', error);
    toast({
      title: 'Error',
      description: 'Failed to retrieve flow data.',
      variant: 'destructive',
    });
    return false;
  }
};

// const saveFlow = async (flowName: string, data: any[]) => {
//     console.log('Saving flow:', flowName, 'Input data:', data);
//     try {
//         if (flowName === "") {
//             toast({
//                 title: "Error",
//                 description: "Failed to save workflow due to an empty flow name",
//                 variant: "destructive",
//             });
//             return { success: false };
//         }

//         let nodesData: NodeData[] = [];
//         let edgesData: EdgeData[] = [];
//         let popupDetails: { [key: string]: any } = {};
//         let counters: Counters = { menuCounter: 0, PlayPromptCounter: 0, ExitCounter: 0, EntryCounter: 0, DigitsCounter: 0, sessionVariableCounter: 0, TransferCounter: 0 };

//         if (data.length > 0 && data[0]?.pagesData?.Main) {
//             nodesData = data[0].pagesData.Main.NodesData || [];
//             edgesData = data[0].pagesData.Main.EdgesData || [];
//             popupDetails = data[0].PopupDetails || {};
//             counters = data[0].Counters || counters;
//         } else if (data.length > 0 && data[0]?.NodesData) {
//             nodesData = data[0].NodesData || [];
//             edgesData = data[0].EdgesData || [];
//             popupDetails = data[0].PopupDetails || {};
//         }

//         const transformedNodes = nodesData.map((node: NodeData, index: number) => {
//             const nodeType = node.nodeType || node.type || 'Play Prompt';
//             const nodeId = node.id || `node-${index}`;
//             const sourceLabel = node.sourceLabel || node.data?.label || nodeType;
//             const targetEdge = edgesData.find((edge: EdgeData) => edge.source === nodeId);
//             const target = targetEdge ? targetEdge.target : node.target || '';
//             const nodePopupDetails = node.data?.popupDetails || popupDetails[nodeId] || {};

//             const getBackendNodeType = (type: string) => {
//                 const lowerType = type.toLowerCase();
//                 switch (lowerType) {
//                     case 'start':
//                     case 'input':
//                         return 'Start';
//                     case 'menu':
//                     case 'output':
//                         return 'Menu';
//                     case 'playprompt':
//                     case 'default':
//                         return 'Play Prompt';
//                     case 'destination transfer':
//                     case 'transfer':
//                         return 'Destination Transfer';
//                     case 'end':
//                     case 'disconnect':
//                         return 'Disconnect';
//                     default:
//                         return 'Play Prompt';
//                 }
//             };

//             const backendNodeType = getBackendNodeType(nodeType);
//             const getSourceId = () => {
//                 if (backendNodeType === 'Start') return String(counters.EntryCounter++ || 1);
//                 if (backendNodeType === 'Menu') return String(counters.menuCounter++ || 1);
//                 if (backendNodeType === 'Play Prompt') return String(counters.PlayPromptCounter++ || 1);
//                 if (backendNodeType === 'Disconnect') return String(counters.ExitCounter++ || 1);
//                 if (backendNodeType === 'Destination Transfer') return String(counters.TransferCounter++ || 1);
//                 if (backendNodeType === 'DigitsCollection') return String(counters.DigitsCounter++ || 1);
//                 if (backendNodeType === 'Decision') return String(counters.sessionVariableCounter++ || 1);
//                 return nodeId;
//             };

//             const buildOptionsTarget = () => {
//                 if (backendNodeType !== 'Menu') return {};
//                 const menuEdges = edgesData.filter((edge: EdgeData) => edge.source === nodeId || edge.source.startsWith(`${nodeId}`));
//                 const optionsTarget: { [key: string]: string } = {};
//                 const maxOptions = Math.max(
//                     parseInt(nodePopupDetails.menuoptions) || node.data?.options?.length || 1,
//                     1
//                 );

//                 menuEdges.forEach((edge: EdgeData) => {
//                     console.log('Processing edge:', edge);
//                     if (edge.id.includes(`${nodeId}NI`)) {
//                         optionsTarget['NI'] = edge.target;
//                     } else if (edge.id.includes(`${nodeId}NM`)) {
//                         optionsTarget['NM'] = edge.target;
//                     } else {
//                         const optionMatch = edge.id.match(/menu-\d+(\d+)/);
//                         if (optionMatch) {
//                             const optionNum = optionMatch[1];
//                             if (parseInt(optionNum) <= maxOptions) {
//                                 optionsTarget[optionNum] = edge.target;
//                             }
//                         }
//                     }
//                 });

//                 for (let i = 1; i <= maxOptions; i++) {
//                     if (!optionsTarget[String(i)]) {
//                         optionsTarget[String(i)] = target;
//                     }
//                 }
//                 if (!optionsTarget['NI']) optionsTarget['NI'] = target;
//                 if (!optionsTarget['NM']) optionsTarget['NM'] = target;

//                 return optionsTarget;
//             };

//             return {
//                 id: nodeId,
//                 nodeType: backendNodeType,
//                 sourceLabel: sourceLabel,
//                 source: getSourceId(),
//                 data: {
//                     label: sourceLabel,
//                     type: backendNodeType,
//                     ...(backendNodeType === 'Start' && {
//                         welcomeMessage: node.data?.welcomeMessage || nodePopupDetails.welcomeMessage || 'Welcome',
//                         prompt: node.data?.prompt || nodePopupDetails.prompt || 'Welcome to the IVR',
//                     }),
//                     ...(backendNodeType === 'Play Prompt' && {
//                         text: node.data?.textToSay || nodePopupDetails.TexttoSay || node.data?.text || 'Enter your message here',
//                         promptType: node.data?.promptType || 'TTS',
//                     }),
//                     ...(backendNodeType === 'Destination Transfer' && {
//                         destinationNumber: node.data?.destinationNumber || nodePopupDetails.destinationNumber || '',
//                     }),
//                     ...(backendNodeType === 'Menu' && {
//                         prompt: node.data?.prompt || nodePopupDetails.prompt || 'Select an option',
//                         options: Object.keys(buildOptionsTarget()).filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key))),
//                     }),
//                     ...(backendNodeType === 'Disconnect' && {
//                         endType: node.data?.endType || nodePopupDetails.endType || 'Disconnect',
//                     }),
//                 },
//                 position: node.position || { x: (index * 200) % 800, y: (index * 200) % 600 },
//                 target: target,
//                 ...(backendNodeType === 'Menu' && {
//                     optionsTarget: buildOptionsTarget(),
//                     popupDetails: {
//                         id: nodeId,
//                         Menuname: sourceLabel,
//                         TexttoSay: node.data?.textToSay || nodePopupDetails.TexttoSay || 'Please provide text to say',
//                         NoinputTTS: node.data?.noInputTTS || nodePopupDetails.NoinputTTS || 'No input received',
//                         NomatchTTS: node.data?.noMatchTTS || nodePopupDetails.NomatchTTS || 'No match found',
//                         menuoptions: String(Object.keys(buildOptionsTarget()).filter(key => !isNaN(parseInt(key))).length || 1),
//                         Maxtries: node.data?.maxTries || nodePopupDetails.Maxtries || '3',
//                         Channel: nodePopupDetails.Channel || '',
//                         initialAudio: node.data?.audioFile || nodePopupDetails.initialAudio || null,
//                         NoinputAudio: node.data?.noInputAudio || nodePopupDetails.NoinputAudio || null,
//                         NomatchAudio: node.data?.noMatchAudio || nodePopupDetails.NomatchAudio || null,
//                         SessionData: nodePopupDetails.SessionData || '',
//                         Operation: nodePopupDetails.Operation || '',
//                         StartIndex: nodePopupDetails.StartIndex || '',
//                         EndIndex: nodePopupDetails.EndIndex || '',
//                         Concat: nodePopupDetails.Concat || '',
//                         Assign: nodePopupDetails.Assign || '',
//                         SessionKey: nodePopupDetails.SessionKey || '',
//                         ConditionOperation: nodePopupDetails.ConditionOperation || '',
//                         Value: nodePopupDetails.Value || '',
//                         apiResponse: nodePopupDetails.apiResponse || null,
//                         url: nodePopupDetails.url || null,
//                         playprompt: nodePopupDetails.playprompt || '',
//                         pageEntry: nodePopupDetails.pageEntry || '',
//                         digitsNodeData: {
//                             AudioType: nodePopupDetails.digitsNodeData?.AudioType || 'TTS',
//                             InitialTTS: nodePopupDetails.digitsNodeData?.InitialTTS || '',
//                             NoInputTTS: nodePopupDetails.digitsNodeData?.NoInputTTS || '',
//                             NoMatchTTS: nodePopupDetails.digitsNodeData?.NoMatchTTS || '',
//                             InitialPrompt: nodePopupDetails.digitsNodeData?.InitialPrompt || null,
//                             NoInputPrompt: nodePopupDetails.digitsNodeData?.NoInputPrompt || null,
//                             NoMatchPrompt: nodePopupDetails.digitsNodeData?.NoMatchPrompt || null,
//                             MinDigits: nodePopupDetails.digitsNodeData?.MinDigits || '',
//                             MaxDigits: nodePopupDetails.digitsNodeData?.MaxDigits || '',
//                             IntradigitTimeout: nodePopupDetails.digitsNodeData?.IntradigitTimeout || '',
//                             SessionVariable: nodePopupDetails.digitsNodeData?.SessionVariable || '',
//                             Maxtries: nodePopupDetails.digitsNodeData?.Maxtries || '',
//                         },
//                         destinationNumber: nodePopupDetails.destinationNumber || null,
//                     },
//                 }),
//                 ...(backendNodeType === 'Play Prompt' && {
//                     popupDetails: {
//                         id: nodeId,
//                         Menuname: sourceLabel,
//                         TexttoSay: node.data?.textToSay || nodePopupDetails.TexttoSay || node.data?.text || '',
//                         promptType: node.data?.promptType || 'TTS',
//                         initialAudio: node.data?.audioFile || nodePopupDetails.initialAudio || null,
//                     },
//                 }),
//                 ...(backendNodeType === 'Destination Transfer' && {
//                     popupDetails: {
//                         id: nodeId,
//                         Menuname: sourceLabel,
//                         destinationNumber: node.data?.destinationNumber || nodePopupDetails.destinationNumber || '',
//                     },
//                 }),
//                 ...(backendNodeType === 'Disconnect' && {
//                     popupDetails: {
//                         id: nodeId,
//                         Menuname: sourceLabel,
//                     },
//                 }),
//             };
//         });

//         const transformedEdges = edgesData.map((edge: EdgeData, index: number) => ({
//             id: edge.id || `reactflow__edge-${edge.source}-${edge.target}-${index}`,
//             source: edge.source,
//             sourceLabel: edge.sourceLabel || transformedNodes.find((n: NodeData) => n.id === edge.source)?.sourceLabel || edge.source,
//             target: edge.target,
//         }));

//         const payload: PayloadData = {
//             flowName,
//             lastData: [...transformedNodes, ...transformedEdges],
//         };

//         console.log('Saving flow with payload:', JSON.stringify(payload, null, 2));
//         const response = await fetch("http://10.16.7.96:5000/save-flow", {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(payload),
//         });

//         if (response.ok) {
//             setIsDraftSaved(true);
//             toast({
//                 title: "Success",
//                 description: `${flowName} flow saved successfully`,
//             });
//             return { success: true };
//         } else if (response.status === 400) {
//             const data = await response.json();
//             toast({
//                 title: "Error",
//                 description: data.error || `Failed to save ${flowName} flow`,
//                 variant: "destructive",
//             });
//             return { success: false, error: data.error };
//         } else {
//             console.error("Failed to save flow");
//             toast({
//                 title: "Error",
//                 description: `Failed to save ${flowName} flow`,
//                 variant: "destructive",
//             });
//             return { success: false };
//         }
//     } catch (error) {
//         console.error("Error saving flow:", error);
//         toast({
//             title: "Error",
//             description: `Failed to save ${flowName} flow: ${error.message}`,
//             variant: "destructive",
//         });
//         return { success: false };
//     }
// };



const saveFlow = async (flowName: string, data: any[]) => {
    console.log('Saving flow:', flowName, 'Input data:', data);
    try {
        if (flowName === "") {
            toast({
                title: "Error",
                description: "Failed to save workflow due to an empty flow name",
                variant: "destructive",
            });
            return { success: false };
        }

        let nodesData: NodeData[] = [];
        let edgesData: EdgeData[] = [];
        let popupDetails: { [key: string]: any } = {};
        let counters: Counters = { menuCounter: 0, PlayPromptCounter: 0, ExitCounter: 0, EntryCounter: 0, DigitsCounter: 0, sessionVariableCounter: 0, TransferCounter: 0 };

        if (data.length > 0 && data[0]?.pagesData?.Main) {
            nodesData = data[0].pagesData.Main.NodesData || [];
            edgesData = data[0].pagesData.Main.EdgesData || [];
            popupDetails = data[0].PopupDetails || {};
            counters = data[0].Counters || counters;
        } else if (data.length > 0 && data[0]?.NodesData) {
            nodesData = data[0].NodesData || [];
            edgesData = data[0].EdgesData || [];
            popupDetails = data[0].PopupDetails || {};
        }

        const transformedNodes = nodesData.map((node: NodeData, index: number) => {
            const nodeType = node.nodeType || node.type || 'Play Prompt';
            const nodeId = node.id || `node-${index}`;
            const sourceLabel = node.sourceLabel || node.data?.label || nodeType;
            const targetEdge = edgesData.find((edge: EdgeData) => edge.source === nodeId);
            const target = targetEdge ? targetEdge.target : node.target || '';
            const nodePopupDetails = node.data?.popupDetails || popupDetails[nodeId] || {};

            const getBackendNodeType = (type: string) => {
                const lowerType = type.toLowerCase();
                switch (lowerType) {
                    case 'start':
                    case 'input':
                        return 'Start';
                    case 'menu':
                    case 'output':
                        return 'Menu';
                    case 'playprompt':
                    case 'default':
                        return 'Play Prompt';
                    case 'destination transfer':
                    case 'transfer':
                        return 'Destination Transfer';
                    case 'end':
                    case 'disconnect':
                        return 'Disconnect';
                    default:
                        return 'Play Prompt';
                }
            };

            const backendNodeType = getBackendNodeType(nodeType);
            const getSourceId = () => {
                if (backendNodeType === 'Start') return String(counters.EntryCounter++ || 1);
                if (backendNodeType === 'Menu') return String(counters.menuCounter++ || 1);
                if (backendNodeType === 'Play Prompt') return String(counters.PlayPromptCounter++ || 1);
                if (backendNodeType === 'Disconnect') return String(counters.ExitCounter++ || 1);
                if (backendNodeType === 'Destination Transfer') return String(counters.TransferCounter++ || 1);
                if (backendNodeType === 'DigitsCollection') return String(counters.DigitsCounter++ || 1);
                if (backendNodeType === 'Decision') return String(counters.sessionVariableCounter++ || 1);
                return nodeId;
            };

           const buildOptionsTarget = () => {
    if (backendNodeType !== 'Menu') return {};
    
    // Get all edges that originate from this menu node
    const menuEdges = edgesData.filter((edge: EdgeData) => 
        edge.source === nodeId || edge.source.startsWith(`${nodeId}-`)
    );
    
    console.log('Menu edges for node', nodeId, ':', menuEdges);
    
    const optionsTarget: { [key: string]: string } = {};
    const maxOptions = Math.max(
        parseInt(nodePopupDetails.menuoptions) || node.data?.options?.length || 1,
        1
    );

    // Process each edge to extract option targets
    menuEdges.forEach((edge: EdgeData) => {
        console.log('Processing edge:', edge);

        // Handle No Input (NI) edges
        if (edge.id.includes('NI') || edge.id.toLowerCase().includes('noinput')) {
            optionsTarget['NI'] = edge.target;
            console.log('Found NI target:', edge.target);
        } 
        // Handle No Match (NM) edges
        else if (edge.id.includes('NM') || edge.id.toLowerCase().includes('nomatch')) {
            optionsTarget['NM'] = edge.target;
            console.log('Found NM target:', edge.target);
        } 
        // Handle numbered options via sourceHandle
        else if (edge.sourceHandle && !isNaN(Number(edge.sourceHandle))) {
            const optionNum = edge.sourceHandle;
            optionsTarget[optionNum] = edge.target;
            console.log(`Found option ${optionNum} target:`, edge.target);
        }
    });

    // Only add fallback targets if no specific target was found
    for (let i = 1; i <= maxOptions; i++) {
        if (!optionsTarget[String(i)]) {
            // Try to find any edge from this node as fallback
            const fallbackEdge = menuEdges.find(edge => 
                !edge.id.includes('NI') && 
                !edge.id.includes('NM') && 
                !edge.id.toLowerCase().includes('noinput') && 
                !edge.id.toLowerCase().includes('nomatch')
            );
            
            if (fallbackEdge) {
                optionsTarget[String(i)] = fallbackEdge.target;
                console.log(`Using fallback target for option ${i}:`, fallbackEdge.target);
            } else if (target) {
                optionsTarget[String(i)] = target;
                console.log(`Using default target for option ${i}:`, target);
            }
        }
    }

    // Add NI and NM only if they weren't already set
    if (!optionsTarget['NI']) {
        const fallbackEdge = menuEdges[0] || { target };
        optionsTarget['NI'] = fallbackEdge.target || target;
    }
    if (!optionsTarget['NM']) {
        const fallbackEdge = menuEdges[0] || { target };
        optionsTarget['NM'] = fallbackEdge.target || target;
    }

    console.log('Final optionsTarget for node', nodeId, ':', optionsTarget);
    return optionsTarget;
};


            return {
                id: nodeId,
                nodeType: backendNodeType,
                sourceLabel: sourceLabel,
                source: getSourceId(),
                data: {
                    label: sourceLabel,
                    type: backendNodeType,
                    ...(backendNodeType === 'Start' && {
                        welcomeMessage: node.data?.welcomeMessage || nodePopupDetails.welcomeMessage || 'Welcome',
                        prompt: node.data?.prompt || nodePopupDetails.prompt || 'Welcome to the IVR',
                    }),
                    ...(backendNodeType === 'Play Prompt' && {
                        text: node.data?.textToSay || nodePopupDetails.TexttoSay || node.data?.text || 'Enter your message here',
                        promptType: node.data?.promptType || 'TTS',
                    }),
                    ...(backendNodeType === 'Destination Transfer' && {
                        destinationNumber: node.data?.destinationNumber || nodePopupDetails.destinationNumber || '',
                    }),
                    ...(backendNodeType === 'Menu' && {
                        prompt: node.data?.prompt || nodePopupDetails.prompt || 'Select an option',
                        options: Object.keys(buildOptionsTarget()).filter(key => !['NI', 'NM'].includes(key) && !isNaN(Number(key))),
                    }),
                    ...(backendNodeType === 'Disconnect' && {
                        endType: node.data?.endType || nodePopupDetails.endType || 'Disconnect',
                    }),
                },
                position: node.position || { x: (index * 200) % 800, y: (index * 200) % 600 },
                target: target,
                ...(backendNodeType === 'Menu' && {
                    optionsTarget: buildOptionsTarget(),
                    popupDetails: {
                        id: nodeId,
                        Menuname: sourceLabel,
                        TexttoSay: node.data?.textToSay || nodePopupDetails.TexttoSay || 'Please provide text to say',
                        NoinputTTS: node.data?.noInputTTS || nodePopupDetails.NoinputTTS || 'No input received',
                        NomatchTTS: node.data?.noMatchTTS || nodePopupDetails.NomatchTTS || 'No match found',
                        menuoptions: String(Object.keys(buildOptionsTarget()).filter(key => !isNaN(parseInt(key))).length || 1),
                        Maxtries: node.data?.maxTries || nodePopupDetails.Maxtries || '3',
                        Channel: nodePopupDetails.Channel || '',
                        initialAudio: node.data?.audioFile || nodePopupDetails.initialAudio || null,
                        NoinputAudio: node.data?.noInputAudio || nodePopupDetails.NoinputAudio || null,
                        NomatchAudio: node.data?.noMatchAudio || nodePopupDetails.NomatchAudio || null,
                        SessionData: nodePopupDetails.SessionData || '',
                        Operation: nodePopupDetails.Operation || '',
                        StartIndex: nodePopupDetails.StartIndex || '',
                        EndIndex: nodePopupDetails.EndIndex || '',
                        Concat: nodePopupDetails.Concat || '',
                        Assign: nodePopupDetails.Assign || '',
                        SessionKey: nodePopupDetails.SessionKey || '',
                        ConditionOperation: nodePopupDetails.ConditionOperation || '',
                        Value: nodePopupDetails.Value || '',
                        apiResponse: nodePopupDetails.apiResponse || null,
                        url: nodePopupDetails.url || null,
                        playprompt: nodePopupDetails.playprompt || '',
                        pageEntry: nodePopupDetails.pageEntry || '',
                        digitsNodeData: {
                            AudioType: nodePopupDetails.digitsNodeData?.AudioType || 'TTS',
                            InitialTTS: nodePopupDetails.digitsNodeData?.InitialTTS || '',
                            NoInputTTS: nodePopupDetails.digitsNodeData?.NoInputTTS || '',
                            NoMatchTTS: nodePopupDetails.digitsNodeData?.NoMatchTTS || '',
                            InitialPrompt: nodePopupDetails.digitsNodeData?.InitialPrompt || null,
                            NoInputPrompt: nodePopupDetails.digitsNodeData?.NoInputPrompt || null,
                            NoMatchPrompt: nodePopupDetails.digitsNodeData?.NoMatchPrompt || null,
                            MinDigits: nodePopupDetails.digitsNodeData?.MinDigits || '',
                            MaxDigits: nodePopupDetails.digitsNodeData?.MaxDigits || '',
                            IntradigitTimeout: nodePopupDetails.digitsNodeData?.IntradigitTimeout || '',
                            SessionVariable: nodePopupDetails.digitsNodeData?.SessionVariable || '',
                            Maxtries: nodePopupDetails.digitsNodeData?.Maxtries || '',
                        },
                        destinationNumber: nodePopupDetails.destinationNumber || null,
                    },
                }),
                ...(backendNodeType === 'Play Prompt' && {
                    popupDetails: {
                        id: nodeId,
                        Menuname: sourceLabel,
                        TexttoSay: node.data?.textToSay || nodePopupDetails.TexttoSay || node.data?.text || '',
                        promptType: node.data?.promptType || 'TTS',
                        initialAudio: node.data?.audioFile || nodePopupDetails.initialAudio || null,
                    },
                }),
                ...(backendNodeType === 'Destination Transfer' && {
                    popupDetails: {
                        id: nodeId,
                        Menuname: sourceLabel,
                        destinationNumber: node.data?.destinationNumber || nodePopupDetails.destinationNumber || '',
                    },
                }),
                ...(backendNodeType === 'Disconnect' && {
                    popupDetails: {
                        id: nodeId,
                        Menuname: sourceLabel,
                    },
                }),
            };
        });

        const transformedEdges = edgesData.map((edge: EdgeData, index: number) => ({
            id: edge.id || `reactflow__edge-${edge.source}-${edge.target}-${index}`,
            source: edge.source,
            sourceLabel: edge.sourceLabel || transformedNodes.find((n: NodeData) => n.id === edge.source)?.sourceLabel || edge.source,
            target: edge.target,
        }));

        const payload: PayloadData = {
            flowName,
            lastData: [...transformedNodes, ...transformedEdges],
        };

        console.log('Saving flow with payload:', JSON.stringify(payload, null, 2));
        const response = await fetch("http://localhost:5000/save-flow", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            setIsDraftSaved(true);
            toast({
                title: "Success",
                description: `${flowName} flow saved successfully`,
            });
            return { success: true };
        } else if (response.status === 400) {
            const data = await response.json();
            toast({
                title: "Error",
                description: data.error || `Failed to save ${flowName} flow`,
                variant: "destructive",
            });
            return { success: false, error: data.error };
        } else {
            console.error("Failed to save flow");
            toast({
                title: "Error",
                description: `Failed to save ${flowName} flow`,
                variant: "destructive",
            });
            return { success: false };
        }
    } catch (error) {
        console.error("Error saving flow:", error);
        toast({
            title: "Error",
            description: `Failed to save ${flowName} flow: ${error.message}`,
            variant: "destructive",
        });
        return { success: false };
    }
};




    const deployFlow = async (flowName: string) => {
        console.log('Attempting to deploy flow:', flowName);
        if (!flowName) {
            toast({
                title: "Error",
                description: "No flow selected for deployment",
                variant: "destructive",
            });
            return false;
        }

        try {
            setIsDeploying(true);
            await ivrApiService.deployFlow(flowName);
            toast({
                title: "Success",
                description: `${flowName} flow deployed successfully`,
            });
            return true;
        } catch (error: any) {
            console.error("Error deploying flow:", error);
            toast({
                title: "Error",
                description: error.message || `Failed to deploy ${flowName} flow`,
                variant: "destructive",
            });
            return false;
        } finally {
            setIsDeploying(false);
        }
    };


    const deleteFlow = async (flowName: string, setNodes: any, setEdges: any) => {
        if (!flowName) {
            toast({
                title: "Error",
                description: "No flow selected for deletion",
                variant: "destructive",
            });
            return false;
        }

        try {
            await ivrApiService.deleteFlow(flowName);
            setProjectList((prevList) => prevList.filter((project) => project !== flowName));
            setNodes([]);
            setEdges([]);
            setIsDraftSaved(false);
            setPages([]);
            setActiveProject('');
            toast({
                title: "Success",
                description: `${flowName} flow deleted successfully`,
            });
            return true;
        } catch (error: any) {
            console.error("Error deleting flow:", error);
            toast({
                title: "Error",
                description: error.message || `Failed to delete ${flowName} flow`,
                variant: "destructive",
            });
            return false;
        }
    };

    return {
        projectList,
        activeProject,
        isDraftSaved,
        isDeploying,
        pages,
        pagesData,
        pageEntryList,
        nodeDetails,
        lastData,
        pageId,
        counters: counters.current,
        loadProjectList,
        checkFlowName,
        retrieveFlow,
        deployFlow,
        deleteFlow,
        setActiveProject,
        setIsDraftSaved,
        setPages,
        setPagesData,
        setPageEntryList,
        setNodeDetails,
        setLastData,
        setPageId,
        saveFlow
    };
};

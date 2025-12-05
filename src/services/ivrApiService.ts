// types.ts

import { config } from ".././config";
interface PopupDetails {
  [key: string]: {
    id?: string;
    Menuname?: string;
    TexttoSay?: string;
    NoinputTTS?: string;
    NomatchTTS?: string;
    menuoptions?: string;
    // Add other properties as needed
  };
}

interface NodeData {
  id?: string;
  type?: string;
  data?: { label?: string; type?: string };
  position?: { x: number; y: number };
  style?: { width?: number; height?: number; padding?: number; fontSize?: string };
  // Add other properties as needed
}

interface EdgeData {
  source: string;
  target: string;
  id?: string;
  sourceDetails?: any;
}

interface PagesData {
  Main: {
    NodesData: NodeData[];
    EdgesData: EdgeData[];
  };
}

export interface FlowData {
  flowName?: string;
  lastData?: any[];
  nodes?: NodeData[]; // Changed from nodes: [] to nodes?: NodeData[]
  edges?: EdgeData[]; // Changed from edges: [] to edges?: EdgeData[]
  source?: string;
  nodeType?: string;
  sourceLabel?: string;
  target?: string;
  optionsTarget?: { [key: string]: string };
  popupDetails?: PopupDetails;
  PopupDetails?: PopupDetails;
  Main_id?: number;
  pagesData?: PagesData;
  pages?: string[];
  pageId?: number;
  pageEntryList?: any[];
  nodeDetails?: { [key: string]: any }; // Changed from nodeDetails: {} to nodeDetails?: { [key: string]: any }
  Counters?: {
    menuCounter?: number;
    PlayPromptCounter?: number;
    ExitCounter?: number;
    EntryCounter?: number;
    DigitsCounter?: number;
    sessionVariableCounter?: number;
    TransferCounter?: number;
  };
}

export const ivrApiService = {
  async checkFlowName(flowName: string): Promise<{ exists: boolean }> {
    const response = await fetch("http://10.16.7.96:5000/check-flow-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flowName }),
    });

    if (!response.ok) {
      throw new Error('Failed to check flow name');
    }

    const data = await response.json();
    console.log('checkFlowName response:', data);
    return data;
  },

  // Get list of all projects
  // async getProjectList(): Promise<string[]> {
  //   const response = await fetch('http://10.16.7.96:5000/project_list');

  //   if (!response.ok) {
  //     throw new Error('Failed to fetch projects');
  //   }
  //   const data = await response.json();
  //   console.log('API response for project list:', data);

  //   if (data && typeof data === 'object' && !Array.isArray(data)) {
  //     return Object.values(data).map((item: any) => item.flowName || item.flowname || '');
  //   }
  //   return Array.isArray(data) ? data : [];
  // },



  async getProjectList(): Promise<string[]> {
  const response = await fetch('http://10.16.7.96:5000/project_list');

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  console.log('API response for project list:', data);

  if (Array.isArray(data)) {
    return data.map((item: any) => (typeof item === 'object' ? item.flowName || item.flowname || '' : item.toString()));
  } else if (data && typeof data === 'object') {
    return Object.values(data)
      .filter((item: any) => typeof item === 'object')
      .map((item: any) => item.flowName || item.flowname || '');
  }
  return [];
},

  // Retrieve flow data
// ivrApiService.ts
async retrieveFlowData(flowName: string): Promise<FlowData> {
  const response = await fetch("http://10.16.7.96:5000/retrieve_flow_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flowName }),
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve flow data');
  }

  const data = await response.json();
  console.log('Retrieved flow data from API:', data);
  if (Object.keys(data).length === 0) {
    return {
      flowName,
      lastData: [],
      nodes: [],
      edges: [],
      pages: ['Main'],
      pagesData: {
        Main: {
          NodesData: [],
          EdgesData: [],
        },
      },
      pageEntryList: [],
      nodeDetails: {},
      Counters: {
        menuCounter: 0,
        PlayPromptCounter: 0,
        ExitCounter: 0,
        EntryCounter: 0,
        DigitsCounter: 0,
        TransferCounter: 0,
        sessionVariableCounter: 0,
      },
      Main_id: 0,
      pageId: 1,
    };
  }
  return data as FlowData;
},



async saveFlow(flowName: string, lastData: any[]): Promise<{ success: boolean; id?: number; message?: string; error?: string }> {
    // Ensure lastData is an array of objects, not a string
    let parsedLastData = lastData;
    if (Array.isArray(lastData) && lastData.length === 1 && typeof lastData[0] === 'string') {
      try {
        parsedLastData = JSON.parse(lastData[0]);
      } catch (e) {
        throw new Error('Invalid lastData format');
      }
    }

    const response = await fetch("http://10.16.7.96:5000/save-flow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flowName,
        lastData: parsedLastData, // Use parsed data
      }),
    });
console.log('Saving flow:', flowName, 'with data:', parsedLastData);
    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.error || `Failed to save ${flowName} flow`);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save ${flowName} flow`);
    }

    const data = await response.json();
    console.log('saveFlow response:', data);
    return { success: true, id: data.id, message: data.message };
  },


  // Deploy flow
 async deployFlow(flowName: string): Promise<void> {
    const response = await fetch("http://10.16.7.96:5000/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flowName }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get error message from response
      throw new Error(`Failed to deploy ${flowName} flow: ${errorText}`);
    }
},

  // Delete flow
  async deleteFlow(flowName: string): Promise<void> {
    const response = await fetch("http://10.16.7.96:5000/deleteFlow", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flowName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${flowName} flow`);
    }
  }
};
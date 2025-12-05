

// PostgreSQL connection configuration
const DB_CONFIG = {
  host: '10.16.7.91',
  port: 5432,
  database: 'dashboardsandreports',
  username: 'fsuser',
  password: 'fsuser01'
};

const API_BASE_URL = 'http://localhost/api';

export interface MenuNode {
  id?: number;
  menuname: string;
  texttosay: string;
  channel: string;
  menuoption: string;
  initialaudio?: Uint8Array;
  nomatchaudio?: Uint8Array;
  noinputaudio?: Uint8Array;
  nomatchaudioname?: string;
  noinputaudioname?: string;
}

export interface ZconnectFlow {
  id?: number;
  flowname: string;
  jscode?: Uint8Array;
  flowdata?: Uint8Array;
}

export interface IVRFlowData {
  id: string;
  name: string;
  prompt: string;
  options: string[];
  menuNodes: MenuNode[];
  createdAt: string;
}

export class IVRApiService {
  // Menu Node operations
  static async createMenuNode(menuNode: Omit<MenuNode, 'id'>): Promise<MenuNode | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuNode),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create menu node');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating menu node:', error);
      return null;
    }
  }

  static async getMenuNodes(): Promise<MenuNode[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-nodes`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu nodes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu nodes:', error);
      return [];
    }
  }

  static async getMenuNodeById(id: number): Promise<MenuNode | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-nodes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu node');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu node:', error);
      return null;
    }
  }

  static async updateMenuNode(id: number, menuNode: Partial<MenuNode>): Promise<MenuNode | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-nodes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuNode),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update menu node');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating menu node:', error);
      return null;
    }
  }

  static async deleteMenuNode(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-nodes/${id}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting menu node:', error);
      return false;
    }
  }

  // Zconnect Flow operations
  static async createZconnectFlow(flow: Omit<ZconnectFlow, 'id'>): Promise<ZconnectFlow | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/zconnect-flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flow),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create zconnect flow');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating zconnect flow:', error);
      return null;
    }
  }

  static async getZconnectFlows(): Promise<ZconnectFlow[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/zconnect-flows`);
      if (!response.ok) {
        throw new Error('Failed to fetch zconnect flows');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching zconnect flows:', error);
      return [];
    }
  }

  static async getZconnectFlowById(id: number): Promise<ZconnectFlow | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/zconnect-flows/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch zconnect flow');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching zconnect flow:', error);
      return null;
    }
  }

  static async updateZconnectFlow(id: number, flow: Partial<ZconnectFlow>): Promise<ZconnectFlow | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/zconnect-flows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flow),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update zconnect flow');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating zconnect flow:', error);
      return null;
    }
  }

  static async deleteZconnectFlow(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/zconnect-flows/${id}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting zconnect flow:', error);
      return false;
    }
  }

  // IVR Flow operations (combining both tables)
  static async createIVRFlow(ivrFlowData: IVRFlowData): Promise<boolean> {
    try {
      // Create Zconnect Flow first
      const flowData = {
        flowname: ivrFlowData.name,
        flowdata: new TextEncoder().encode(JSON.stringify(ivrFlowData))
      };
      
      const zconnectFlow = await this.createZconnectFlow(flowData);
      if (!zconnectFlow) {
        throw new Error('Failed to create zconnect flow');
      }

      // Create Menu Nodes for each option
      for (let i = 0; i < ivrFlowData.options.length; i++) {
        const menuNode: Omit<MenuNode, 'id'> = {
          menuname: `${ivrFlowData.name}_Option_${i + 1}`,
          texttosay: ivrFlowData.prompt,
          channel: 'default',
          menuoption: ivrFlowData.options[i]
        };

        await this.createMenuNode(menuNode);
      }

      return true;
    } catch (error) {
      console.error('Error creating IVR flow:', error);
      return false;
    }
  }

  static async getIVRFlows(): Promise<IVRFlowData[]> {
    try {
      const flows = await this.getZconnectFlows();
      const menuNodes = await this.getMenuNodes();
      
      return flows.map(flow => {
        let parsedData: any = {};
        
        if (flow.flowdata) {
          try {
            const flowDataString = new TextDecoder().decode(flow.flowdata);
            parsedData = JSON.parse(flowDataString);
          } catch (e) {
            console.error('Error parsing flow data:', e);
          }
        }
        
        const relatedNodes = menuNodes.filter(node => 
          node.menuname?.startsWith(flow.flowname || '')
        );
        
        return {
          id: flow.id?.toString() || '',
          name: flow.flowname || '',
          prompt: relatedNodes[0]?.texttosay || '',
          options: relatedNodes.map(node => node.menuoption || ''),
          menuNodes: relatedNodes,
          createdAt: parsedData.createdAt || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching IVR flows:', error);
      return [];
    }
  }
}

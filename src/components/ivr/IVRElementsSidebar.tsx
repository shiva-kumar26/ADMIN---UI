
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Menu, 
  Mic, 
  PhoneCall, 
  MessageSquare, 
  Settings, 
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const elementCategories = [
  {
    title: 'Basic Elements',
    elements: [
      {
        type: 'start',
        label: 'Start',
        icon: Play,
        color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
        description: 'Flow entry point'
      },
      {
        type: 'menu',
        label: 'Menu',
        icon: Menu,
        color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
        description: 'Interactive menu options'
      },
      {
        type: 'playPrompt',
        label: 'Play Prompt',
        icon: Mic,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
        description: 'Audio playback'
      },
      {
        type: 'end',
        label: 'End',
        icon: PhoneCall,
        color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
        description: 'Call termination'
      }
    ]
  },
  {
    title: 'Advanced Elements',
    elements: [
      {
        type: 'condition',
        label: 'Condition',
        icon: Settings,
        color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
        description: 'Conditional logic'
      },
      {
        type: 'variable',
        label: 'Session Variable',
        icon: MessageSquare,
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
        description: 'Store/retrieve data'
      },
      {
        type: 'webhook',
        label: 'Webhook',
        icon: Globe,
        color: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200',
        description: 'External API call'
      },
      {
        type: 'transfer',
        label: 'Destination Transfer',
        icon: PhoneCall,
        color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
        description: 'Transfer call to destination'
      },
      {
        type: 'digitsCollection',
        label: 'Digits Collection',
        icon: MessageSquare,
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200',
        description: 'Collect caller input'
      },
      // {
      //   type: 'disconnect',
      //   label: 'Disconnect',
      //   icon: PhoneCall,
      //   color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
      //   description: 'End call immediately'
      // }
    ]
  
  }
];

interface IVRElementsSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
}

const IVRElementsSidebar: React.FC<IVRElementsSidebarProps> = ({ width, onWidthChange }) => {
  console.log("ivr elements sidebar", IVRElementsSidebar)
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    'Basic Elements': true,
    'Advanced Elements': true
  });
  const [isResizing, setIsResizing] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(width);
 const isCollapsed = width <= 64;
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    console.log('Drag started for:', nodeType);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (categoryTitle: string) => {
   if (!isCollapsed) { // Only toggle when not collapsed
      setOpenCategories(prev => ({
        ...prev,
        [categoryTitle]: !prev[categoryTitle]
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(250, Math.min(500, startWidth + (e.clientX - startX)));
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

  return (
    <div className="h-full flex bg-white border-r border-gray-200" style={{ width, height:'700px' }}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Flow Elements</h2>
          <p className="text-sm text-gray-600 mt-1">Drag elements to the canvas</p>
          
        </div>
        <div className="p-4 space-y-4">
        {elementCategories.map((category) => (
          <Collapsible
            key={category.title}
            open={openCategories[category.title]}
            onOpenChange={() => toggleCategory(category.title)}
          >
            <Card className="border border-gray-200">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {category.title}
                    </CardTitle>
                    {openCategories[category.title] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-2">
                  {category.elements.map((element) => (
                    <div
                      key={element.type}
                      className={`flex items-center p-3 rounded-lg border-2 border-dashed cursor-move transition-all duration-200 ${element.color}`}
                      draggable
                      onDragStart={(event) => onDragStart(event, element.type)}
                    >
                      <element.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{element.label}</div>
                        <div className="text-xs opacity-75 truncate">{element.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Tips</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Drag elements to the canvas</li>
            <li>• Click nodes to configure</li>
            <li>• Connect nodes by dragging handles</li>
            <li>• Save before deploying</li>
          </ul>
        </div>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default IVRElementsSidebar;
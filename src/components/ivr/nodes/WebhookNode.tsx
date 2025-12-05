
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

const WebhookNode = memo(({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-teal-200 min-w-32">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-teal-100 mr-2">
          <Globe className="w-4 h-4 text-teal-600" />
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-teal-800">{data.label}</div>
          {data.httpMethod && (
            <div className="text-xs text-teal-600">{data.httpMethod}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

WebhookNode.displayName = 'WebhookNode';

export default WebhookNode;
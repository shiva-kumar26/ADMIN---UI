
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Hash } from 'lucide-react';

const DigitsCollectionNode = memo(({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-cyan-200 min-w-32">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-cyan-100 mr-2">
          <Hash className="w-4 h-4 text-cyan-600" />
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-cyan-800">{data.label}</div>
          {data.maxDigits && (
            <div className="text-xs text-cyan-600">Max: {data.maxDigits} digits</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

DigitsCollectionNode.displayName = 'DigitsCollectionNode';

export default DigitsCollectionNode;
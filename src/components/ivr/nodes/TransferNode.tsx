
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PhoneCall } from 'lucide-react';

const TransferNode = memo(({ data }: { data: any }) => {

  return (
    <div className="px-3 py-3 shadow-md rounded-md bg-white border-2 border-orange-200 min-w-24">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-orange-200" />
      
      <div className="flex items-center">
        <div className="rounded-full w-6 h-6 flex items-center justify-center bg-orange-100 mr-2">
          <PhoneCall className="w-3 h-3 text-orange-600" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold text-orange-800">{data.label}</div>
          {data.transferNumber && (
            <div className="text-xs text-orange-600">{data.transferNumber}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-orange-200" />
    </div>
  );
});

TransferNode.displayName = 'TransferNode';

export default TransferNode;
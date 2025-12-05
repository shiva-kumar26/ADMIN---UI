
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PhoneOff, Phone, Voicemail } from 'lucide-react';

const EndNode = memo(({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.endType) {
      case 'transfer': return Phone;
      case 'voicemail': return Voicemail;
      default: return PhoneOff;
    }
  };

  const Icon = getIcon();

  return (
    <div className="bg-white border-2 border-red-400 rounded-lg shadow-lg min-w-[80px] h-[60px]">
      <div className="p-1 text-center">
        <div className="text-sm font-medium text-gray-900 mb-1 ">
          {data.label || 'End'}
        </div>
        <div className="text-xs text-gray-500 mb-2 capitalize">
          {data.endType || 'hangup'}
        </div>
        {data.transferNumber && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            📞 {data.transferNumber}
          </div>
        )}
        {data.goodbyeMessage && (
          <div className="text-xs text-gray-600 line-clamp-2">
            {data.goodbyeMessage}
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-red-400 border-white border-2"
      />
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;

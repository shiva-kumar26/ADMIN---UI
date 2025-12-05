
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Settings } from 'lucide-react';

const ConditionNode = memo(({ data }: { data: any }) => {
  return (
    <div className="px-2 py-2 rounded-sm bg-white border-2 border-purple-200 min-w-16 h-15">
      <Handle type="target" position={Position.Top} className="w-3 h-3" style={{backgroundColor:'purple'}} />
      
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-sm font-bold text-purple-800">{data.label}</div>
          {data.conditionType && (
            <div className="text-xs text-purple-600">{data.conditionType}</div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '25%', backgroundColor:'purple' }}
        className="w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '75%',backgroundColor:'purple' }}
        className="w-3 h-3"
      />
      
      <div className="flex justify-between mt-2 text-xs text-purple-600">
        <span className="ml-2">Yes</span>
        <span className="mr-2">No</span>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
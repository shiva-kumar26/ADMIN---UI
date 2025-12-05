
// import React, { memo } from 'react';
// import { Handle, Position } from '@xyflow/react';
// import { MessageSquare } from 'lucide-react';

// const VariableNode = memo(({ data }: { data: any }) => {
//   return (
//     <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-indigo-200 min-w-32">
//       <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
//       <div className="flex items-center">
//         <div className="rounded-full w-8 h-8 flex items-center justify-center bg-indigo-100 mr-2">
//           <MessageSquare className="w-4 h-4 text-indigo-600" />
//         </div>
//         <div className="ml-2">
//           <div className="text-lg font-bold text-indigo-800">{data.label}</div>
//           {data.variableName && (
//             <div className="text-xs text-indigo-600">{data.variableName}</div>
//           )}
//         </div>
//       </div>

//       <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
//     </div>
//   );
// });

// VariableNode.displayName = 'sessionVariable';


// export default VariableNode




import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

const VariableNode = memo(({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-purple-200 min-w-32">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 mr-2">
          <Database className="w-4 h-4 text-purple-600" />
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-purple-800">{data.label}</div>
          {data.variableName && (
            <div className="text-xs text-purple-600">{data.variableName}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-" />
    </div>
  );
});

VariableNode.displayName = 'VariableNode';

export default VariableNode;
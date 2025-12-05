
// import React, { memo } from 'react';
// import { Handle, Position } from '@xyflow/react';
// import { Play } from 'lucide-react';

// const StartNode = memo(({ data }: { data: any }) => {
//   console.log('StartNode rendered with data:', data);
//   return (
//     <div className="bg-white border-2 border-green-400 rounded-lg shadow-lg min-w-[100px]">
//       {/* <div className="bg-green-400 text-white px-3 py-2 rounded-t-md flex items-center">
//         <Play className="w-4 h-4 mr-2" />
//         <span className="font-medium text-sm">Start</span>
//       </div> */}
//       <div className="p-3">
//         <div className="text-sm font-medium text-gray-900 mb-1 text-center">
//           {data.label || 'Start'}
//         </div>
//         {data.welcomeMessage && (
//           <div className="text-xs text-gray-600 line-clamp-2">
//             {data.welcomeMessage}
//           </div>
//         )}
//       </div>
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className="w-3 h-3 bg-green-400 border-white border-2"
//       />
//     </div>
//   );
// });

// StartNode.displayName = 'StartNode';

// export default StartNode;



import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

const StartNode = memo(({ data }: { data: any }) => {
  console.log('StartNode rendered with data:', data);

  return (
    <div
      style={{
        width: '70px',
        padding: '7px',
        fontSize: '8px',
        background: '#fff',
        border: '2px solid #34c759',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <div className="flex items-center justify-center">
        <span className="font-medium">{data.label || 'Start'}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '8px',
          height: '8px',
          background: '#34c759',
          border: '1px solid #fff',
        }}
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';

export default StartNode;
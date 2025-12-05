
// import React, { memo } from 'react';
// import { Handle, Position } from '@xyflow/react';
// import { Mic, Volume2 } from 'lucide-react';

// const PlayPromptNode = memo(({ data }: { data: any }) => {
//   return (
//     <div className="bg-white border-2 border-yellow-400 rounded-lg shadow-lg min-w-[110px]">
//       {/* <div className="bg-yellow-400 text-white px-3 py-2 rounded-t-md flex items-center">
//         {data.promptType === 'audio' ? (
//           <Volume2 className="w-4 h-4 mr-2" />
//         ) : (
//           <Mic className="w-4 h-4 mr-2" />
//         )}
//         <span className="font-medium text-sm">Play Prompt</span>
//       </div> */}
//       <div className="p-3 text-center">
//         <div className="text-sm font-medium text-gray-900 mb-1">
//           {data.label || 'Play Prompt'}
//         </div>
//         <div className="text-xs text-gray-500 mb-2">
//           {data.promptType === 'audio' ? 'Audio File' : 'Text-to-Speech'}
//         </div>
//         {data.text && (
//           <div className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
//             {data.text}
//           </div>
//         )}
//         {data.audioFile && (
//           <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
//             📎 {data.audioFile}
//           </div>
//         )}
//       </div>
//       <Handle
//         type="target"
//         position={Position.Top}
//         className="w-3 h-3 bg-yellow-400 border-white border-2"
//       />
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className="w-3 h-3 bg-yellow-400 border-white border-2"
//       />
//     </div>
//   );
// });

// PlayPromptNode.displayName = 'PlayPromptNode';

// export default PlayPromptNode;


import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Volume2, Mic } from 'lucide-react';

const PlayPromptNode = memo(({ data }: { data: any }) => {
  console.log('PlayPromptNode rendered with data:', data);

  return (
    <div
      style={{
        width: '100px',
        padding: '5px',
        fontSize: '8px',
        background: '#fff',
        border: '2px solid #facc15',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        height: '50px',
      }}
    >
      <div className="flex items-center justify-center">
        {data.popupDetails?.initialAudio ? (
          <Volume2 className="w-3 h-3 mr-1 text-yellow-500" />
        ) : (
          <Mic className="w-3 h-3 mr-1 text-yellow-500" />
        )}
        <span className="font-medium">{data.label || 'Play Prompt'}</span>
      </div>
      <div
        style={{
          fontSize: '7px',
          color: '#4b5563',
          marginTop: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data.popupDetails?.initialAudio
          ? `📎 ${data.popupDetails.initialAudio.Audioname || 'Audio File'}`
          : data.popupDetails?.TexttoSay || 'Text-to-Speech'}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: '8px',
          height: '8px',
          background: '#facc15',
          border: '1px solid #fff',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '8px',
          height: '8px',
          background: '#facc15',
          border: '1px solid #fff',
        }}
      />
    </div>
  );
});

PlayPromptNode.displayName = 'PlayPromptNode';

export default PlayPromptNode;

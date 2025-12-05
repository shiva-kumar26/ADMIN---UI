// import React, { memo } from "react";
// import { Handle, Position } from "@xyflow/react";


// const MenuNode = memo(({ data }: { data: any }) => {
// console.log('MenuNode rendered with data:', data);
// const numOptions = parseInt(data?.popupDetails?.menuoptions || data?.options?.length || '0', 10);
//   const dynamicOptions = Array.from({ length: numOptions }, (_, index) => `${index + 1}`);

//   // Combine fixed options (NI, NM) with dynamic options, ensuring all optionsTarget keys are included
//   const optionsFromTarget = Object.keys(data?.optionsTarget || {}).filter(key => !['NI', 'NM'].includes(key));
//   const allOptions = ['NI', 'NM', ...new Set([...dynamicOptions, ...optionsFromTarget])];

//   return (
//     <div className="bg-white border-2 border-blue-600 rounded-lg px-4 py-2 shadow-md min-w-[40px]">
//       {/* Top handle */}
//       <Handle
//         type="target"
//         position={Position.Top}
//         className="bg-blue w-2 h-2"
//       />

//       {/* Node label */}
//       <div className="text-center font-medium">{data.label || 'Menu'}</div>

//        <div className="flex flex-col">
//         {allOptions.map((option: string, index: number) => (
//           <div key={index} className="flex justify-between items-center relative">
//             <span className="text-sm text-black mr-2">{option}</span>
//             <Handle
//               type="source"
//               position={Position.Right}
//               id={index === 0 ? 'no-input' : index === 1 ? 'no-match' : `option-${index - 2}`}
//               className="bg-blue-600 w-2 h-2"
//               style={{ 
//                 right: -16,
//                 position: 'absolute'
//               }}

//             />
//           </div>
//         ))}

//       </div>
//     </div>
//   );
// });

// export default MenuNode;

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const MenuNode = memo(({ data }: { data: any }) => {
  console.log('MenuNode rendered with data:', { id: data.id, label: data.label, prompt: data.prompt, options: data.options, optionsTarget: data.optionsTarget });
  const numOptions = parseInt(data?.popupDetails?.menuoptions || data?.options?.length || '0', 10);
  const dynamicOptions = Array.from({ length: numOptions }, (_, index) => `${index + 1}`);

  // Combine fixed options (NI, NM) with dynamic options and options from optionsTarget
const optionsFromTarget = Object.keys(data?.optionsTarget || {}).filter(key => !isNaN(Number(key)) || ['NI', 'NM'].includes(key));  
const allOptions = [...new Set(['NI', 'NM', ...dynamicOptions, ...optionsFromTarget])];
  return (
    <div className="bg-white border-2 border-blue-600 rounded-lg px-4 py-2 shadow-md min-w-[40px]">
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="bg-blue-600 w-2 h-2"
      />

      {/* Node label */}
      <div className="text-center font-medium">{data.label || 'Menu'}</div>

      <div className="flex flex-col">
        {allOptions.map((option: string, index: number) => (
          <div key={index} className="flex justify-between items-center relative">
            <span className="text-sm text-black mr-2">{option}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={option} // Use the option key directly as the handle ID
              className="bg-blue-600 w-2 h-2"
              style={{ 
                right: -16,
                position: 'absolute'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default MenuNode;

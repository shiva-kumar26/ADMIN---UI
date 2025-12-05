

// import React, { useState, useRef, useEffect } from 'react';
// import { Check, ChevronDown, Search, X } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Checkbox } from '@/components/ui/checkbox';

// interface Option {
//   value: string;
//   label: string;
// }

// interface MultiSelectDropdownProps {
//   options: Option[];
//   selected: string[];
//   onChange: (selected: string[]) => void;
//   placeholder?: string;
//   searchPlaceholder?: string;
//   className?: string;
//   error?: boolean;
// }

// export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
//   options,
//   selected,
//   onChange,
//   placeholder = "Select items...",
//   searchPlaceholder = "Search...",
//   className,
//   error = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const filteredOptions = options.filter(option =>
//     option.label.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleToggle = (value: string) => {
//     const newSelected = selected.includes(value)
//       ? selected.filter(item => item !== value)
//       : [...selected, value];
//     onChange(newSelected);
//   };

//   const handleRemove = (value: string) => {
//     onChange(selected.filter(item => item !== value));
//   };

//   const handleClearAll = () => {
//     onChange([]);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div className={cn("relative", className)} ref={dropdownRef}>
//       <Button
//         type="button"
//         variant="outline"
//        className={cn(
//           "w-full justify-between h-auto min-h-[40px] px-3 py-2",
//           error && 'border-red-500' // Apply red border when error is true
//         )}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <div className="flex flex-wrap gap-1 flex-1 text-left fontweight-200">
//           {selected.length === 0 ? (
//             <span className="text-muted-foreground">{placeholder}</span>
//           ) : (
//             <>
//               {selected.slice(0, 2).map((value) => {
//                 const option = options.find(opt => opt.value === value);
//                 return (
//                   <span
//                     key={value}
//                     className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-sm text-xs"
//                   >
//                     {option?.label}
//                     <X
//                       className="w-3 h-3 cursor-pointer hover:text-primary/70"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleRemove(value);
//                       }}
//                     />
//                   </span>
//                 );
//               })}
//               {selected.length > 2 && (
//                 <span className="text-muted-foreground text-xs">
//                   +{selected.length - 2} more
//                 </span>
//               )}
//             </>
//           )}
//         </div>
//         <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
//       </Button>

//       {isOpen && (
//         <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
//           <div className="p-2 border-b">
//             <div className="relative">
//               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder={searchPlaceholder}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-8"
//               />
//             </div>
//           </div>
          
//           {selected.length > 0 && (
//             <div className="p-2 border-b">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleClearAll}
//                 className="w-full justify-start text-muted-foreground hover:text-foreground"
//               >
//                 Clear all ({selected.length})
//               </Button>
//             </div>
//           )}

//           <div className="max-h-60 overflow-y-auto">
//             {filteredOptions.length === 0 ? (
//               <div className="p-2 text-center text-muted-foreground text-sm">
//                 No options found
//               </div>
//             ) : (
//               filteredOptions.map((option) => (
//                 <div
//                   key={option.value}
//                   className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
//                   onClick={() => handleToggle(option.value)}
//                 >
//                   <Checkbox
//                     checked={selected.includes(option.value)}
//                     onCheckedChange={() => handleToggle(option.value)}
//                   />
//                   <span className="flex-1 text-sm">{option.label}</span>
//                   {selected.includes(option.value) && (
//                     <Check className="h-4 w-4 text-primary" />
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  error?: boolean;
  placeholderClassName?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  className,
  error = false,
  placeholderClassName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between h-auto min-h-[40px] px-3 py-2 placeholder:text-muted-foreground",
          error && 'border-red-500'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1 text-left">
          {selected.length === 0 ? (
            <span className={cn("text-muted-foreground", placeholderClassName)}>
              {placeholder}
            </span>
          ) : (
            <>
              {selected.slice(0, 2).map((value) => {
                const option = options.find(opt => opt.value === value);
                return (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-sm text-xs"
                  >
                    {option?.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-primary/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                    />
                  </span>
                );
              })}
              {selected.length > 2 && (
                <span className="text-muted-foreground text-xs">
                  +{selected.length - 2} more
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {selected.length > 0 && (
            <div className="p-2 border-b">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                Clear all ({selected.length})
              </Button>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-muted-foreground text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <span className="flex-1 text-sm">{option.label}</span>
                  {selected.includes(option.value) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

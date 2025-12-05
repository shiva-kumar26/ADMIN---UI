
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DialplanDeleteDialog from '@/components/dialplan/DialplanDeleteDialog';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';
interface DialplanDetail {
  dialplan_id: number;
  detail_id: number;
  insert_date: string;
  update_date: string;
  dialplan_detail_tag: string;
  dialplan_detail_type: string;
  dialplan_detail_data: string;
  dialplan_detail_break: string | null;
  dialplan_detail_inline: string | null;
}

interface Dialplan {
  dialplan_id: number;
  dialplan_name: string;
  dialplan_destination: string;
  hostname: string;
  dialplan_context: string;
  dialplan_continue: boolean;
  domain_id: string | number;
  domain_name?: string;
  dialplan_description: string;
  dialplan_details?: DialplanDetail[];
}

const DialplanManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
   const {isSidebarOpen} = useSidebar()
  const [dialPlansData, setdialPlansData] = useState<Dialplan[]>([]);
  const [sortingDialplans, setSortingDialplans] = useState("ASC");
   const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [showparPage, setShowparPage] = useState(5);
  const [isDelete, setIsDelete] = useState(false);
  const [deletedItem, setDeletedItem] = useState<any>();
  const [searchDialplan, setSearchDialplan] = useState({
    searchData: ''
  });

  useEffect(() => {
    fetchDialplans();
  }, []);
  const fetchDialplans = () => {
    fetch('https://10.16.7.96/api/dialplans/')
      .then(res => res.json())
      .then((data: Dialplan[]) => {
        console.log('Fetched dialplans:', data);
        setdialPlansData(data);
      })
      .catch(err => {
        console.error('Error fetching dialplans:', err);
        toast({
          title: "Error",
          description: "Failed to fetch dialplans",
          variant: "destructive"
        });
      });
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = dialPlansData.slice(indexOfFirstPost, indexOfLastPost);

  const handleEditDialplan = (dialplan_id: number) => {
    navigate(`/dialplan/${dialplan_id}`);
  };

  const handleAddNewDialplan = () => {
    navigate('/dialplan-creating');
  };
 const handleViewDialplan = (dialplan_id: number) => {
    navigate(`/dialplan/${dialplan_id}/view`);
  };
  const dialplanDelete = (items: any) => {
    setDeletedItem(items);
    setIsDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (deletedItem) {
      fetch(`https://10.16.7.96/api/dialplans/${deletedItem.dialplan_id}`, {
        method: 'DELETE',
      })
        .then(res => {
          if (res.ok) {
            toast({
              title: "Success",
              description: "Dialplan deleted successfully",
            });
            fetchDialplans(); // Refresh the list
          } else {
            throw new Error('Failed to delete');
          }
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to delete dialplan",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsDelete(false);
          setDeletedItem(null);
        });
    }
  };

  const handleSearchdialplan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;
    setSearchDialplan({
      searchData: targetValue
    });
    
    if (targetValue !== '') {
      const filteredUsers = dialPlansData.filter((items: any) =>
        (items.dialplan_name?.toLowerCase().includes(targetValue.toLowerCase())) ||
        (items.dialplan_destination?.toLowerCase().includes(targetValue.toLowerCase()))
      );
      setdialPlansData(filteredUsers);
    } else {
      fetchDialplans();
    }
  };

  const handlesortingDialPlan = (col: keyof Dialplan) => {
    let sortedData;
    if (sortingDialplans === 'ASC') {
      sortedData = [...dialPlansData].sort((a, b) =>
        a[col] > b[col] ? 1 : -1
      );
      setSortingDialplans('DSC');
    } else {
      sortedData = [...dialPlansData].sort((a, b) =>
        a[col] < b[col] ? 1 : -1
      );
      setSortingDialplans('ASC');
    }
    setdialPlansData(sortedData);
  };
  const totalPages = Math.ceil(dialPlansData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  return (
    <div className="flex flex-col items-center">
      <Card
               className={` h-[88vh] flex flex-col mx-1 mb-2 ${
                 !isSidebarOpen ? 'w-full ml-10' : 'w-full'
               }`}
             >
        <CardHeader className="sticky top-0 z-10 flex-shrink-0">
           <div className="flex items-center justify-between">
                  <CardTitle>Dialplan List</CardTitle>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
                    onClick={() => navigate('/dialplan-creating')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Dialplan
                  </Button>
                </div>
          
                <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search dialplans..."
                value={searchDialplan.searchData}
                onChange={handleSearchdialplan}
                className="pl-10"
              />
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="relative overflow-auto scrollbar-hide">
           <div className="min-w-full overflow-x-auto scrollbar-hide"> 
             <div className="min-h-[100px] flex flex-col justify-between">
            <Table className="min-w-full table-auto scrollbar-hide px-2"  style={{height:'390px'}}>
              <TableHeader>
                <TableRow className='sticky top-0 z-10 bg-white'>
                  <TableHead className="cursor-pointer text-black" onClick={() => handlesortingDialPlan('dialplan_name')}>
                    <div className="flex items-center gap-2">
                      Name <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-black" onClick={() => handlesortingDialPlan('dialplan_destination')}>
                    <div className="flex items-center gap-2">
                      Destination 
                      {/* <ArrowUpDown className="w-4 h-4" /> */}
                    </div>
                  </TableHead>
                  <TableHead className='text-black'>Hostname</TableHead>
                  <TableHead className='text-black'>Context</TableHead>
                  <TableHead className='text-black'>Continue</TableHead>
                  <TableHead className='text-black'>Domain</TableHead>
                  <TableHead className='text-black'>Description</TableHead>
                  <TableHead className="text-center text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPosts.map((dialplan) => (
                  <TableRow key={dialplan.dialplan_id} className="hover:bg-gray-50 px-2 py-2"
                  onDoubleClick={() => handleViewDialplan(dialplan.dialplan_id)}
                  > 
                    <TableCell className="font-medium px-2 py-2">{dialplan.dialplan_name}</TableCell>
                    <TableCell className='px-2 py-2'>
                      <Badge variant="outline">{dialplan.dialplan_destination}</Badge>
                    </TableCell>
                    <TableCell className='px-2 py-2'>{dialplan.hostname}</TableCell>
                    <TableCell className='px-2 py-2'>{dialplan.dialplan_context}</TableCell>
                    <TableCell className='px-2 py-2'>
                      <Badge variant={dialplan.dialplan_continue ? 'default' : 'secondary'}>
                        {dialplan.dialplan_continue ? 'true' : 'false'}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-2 py-2'>{dialplan.domain_name || dialplan.domain_id}</TableCell>
                    <TableCell className="max-w-xs truncate px-2 py-2">{dialplan.dialplan_description}</TableCell>
                    <TableCell className='px-2 py-2 text-center'>
                      <div className="flex space-x-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDialplan(dialplan.dialplan_id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dialplanDelete(dialplan)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </div>
          </div>
        </CardContent>
         <CardFooter className="border-t border-gray-200 px-4 py-3 bg-white sticky bottom-0 z-10">
  <div className="w-full flex justify-between items-center">
    {/* Record Count */}
    <span className="text-sm text-gray-600">
      Showing {startIndex + 1} to {startIndex + currentPosts.length} of {currentPosts.length} Records
    </span>

    {/* Pagination Controls */}
    <div className="flex items-center gap-4">

      {/* Rows per page selector */}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <label htmlFor="itemsPerPage">Rows per page:</label>
        <select
          id="itemsPerPage"
          className="border border-gray-300 rounded px-2 py-1"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          {[10, 20, 30, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Page navigation icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === 1
              ? 'text-gray-400 border-gray-200 cursor-not-allowed'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          ‹
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage === totalPages
              ? 'text-gray-400 border-gray-200 cursor-not-allowed'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          ›
        </button>
      </div>
    </div>
  </div>
</CardFooter>
      </Card>
      {/* <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        filteredUsers={dialPlansData}
        startIndex={startIndex}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      /> */}
      <DialplanDeleteDialog
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
        onConfirm={handleDeleteConfirm}
        dialplanName={deletedItem?.dialplan_name}
      />
    </div>
  );
};

export default DialplanManagement;

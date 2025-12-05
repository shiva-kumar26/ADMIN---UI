import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Save, Check, X } from 'lucide-react';
// import { DialplanDetail } from '@/types/dialplan';
import { applicationstypes } from './DialplanTypesData';

interface DialplanDetail {
  detail_id: number;
  dialplan_detail_tag: string;
  dialplan_detail_type: string;
  dialplan_detail_data: string;
  dialplan_detail_break: string;
  dialplan_detail_inline: string;
}

interface ApiResponseItem {
  flowname: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DialplanDetailsTableProps {
  details: any[];
  setDetails: (details: any[]) => void;
}

const DialplanDetailsTable: React.FC<DialplanDetailsTableProps> = ({
  details,
  setDetails,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newDetail, setNewDetail] = useState<any>({
    dialplan_detail_tag: '', // Start with empty tag
    dialplan_detail_type: '',
    dialplan_detail_data: '',
    dialplan_detail_break: '',
    dialplan_detail_inline: ''
  });
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dropdownData, setDropdownData] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddDetail = () => {
    console.log('button clicked');

    const emptyDetail = {
      detail_id: 0,
      dialplan_detail_tag: '',
      dialplan_detail_type: '',
      dialplan_detail_data: '',
      dialplan_detail_break: '',
      dialplan_detail_inline: ''
    };

    setDetails([...details, emptyDetail]);
    setEditingIndex(details.length); // open new row in edit mode
  };

  useEffect(() => {
    console.log('useEffect triggered');
    console.log('editingIndex:', editingIndex);
    console.log('details:', details);
    console.log('newDetail:', newDetail);

    const shouldFetchFlows = (tag: string, type: string) => {
      return tag === 'Action' && type === 'Javascript';
    };

    let needsFetch = false;

    if (editingIndex !== null && editingIndex < details.length) {
      const editingDetail = details[editingIndex];
      needsFetch = shouldFetchFlows(editingDetail.dialplan_detail_tag, editingDetail.dialplan_detail_type);
      console.log('Editing row condition:', editingDetail.dialplan_detail_tag, editingDetail.dialplan_detail_type, needsFetch);
    }

    if (!needsFetch && shouldFetchFlows(newDetail.dialplan_detail_tag, newDetail.dialplan_detail_type)) {
      needsFetch = true;
      console.log('New detail condition:', newDetail.dialplan_detail_tag, newDetail.dialplan_detail_type, needsFetch);
    }

    if (needsFetch) {
      console.log('Fetching data from API...');
      setLoading(true);
      fetch('http://10.16.7.96:5000/project_list')
        .then((response) => response.json())
        .then((data: any) => {
          // If data is [{ flowname: 'Zconnect flow' }, ...]
          const seen = new Set<string>();
          const uniqueData: DropdownOption[] = data
            .map((item: any) => item.flowname)
            .filter((flowname: string) => {
              if (seen.has(flowname)) return false;
              seen.add(flowname);
              return true;
            })
            .map((flowname: string) => ({
              value: flowname,
              label: flowname,
            }));
          setDropdownData(uniqueData);
        })
        .catch((error) => {
          console.error('Error fetching project list:', error);
          setDropdownData([]);
        })
        .finally(() => {
          console.log('Fetch completed, loading set to false');
          setLoading(false);
        });
    } else {
      console.log('No fetch needed, clearing dropdownData');
      setDropdownData([]);
    }
  }, [editingIndex, details, newDetail.dialplan_detail_tag, newDetail.dialplan_detail_type]);

  useEffect(() => {
    console.log('dropdownData state updated:', dropdownData);
  }, [dropdownData]);

  useEffect(() => {
    console.log('dropdownData state updated:', dropdownData);
  }, [dropdownData]);
  const handleRemoveDetail = async (index: number) => {
    const detail = details[index];
    const detailId = detail.detail_id;

    if (detailId) {
      try {
        const response = await fetch(`https://10.16.7.96/api/dialplandetails/${detailId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary authentication headers, e.g., Authorization: Bearer <token>
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete detail with ID ${detailId}: ${response.statusText}`);
        }
        const updated = [...details];
        updated.splice(index, 1);
        setDetails(updated);

        if (editingIndex === index) {
          setEditingIndex(null);
        }
      } catch (error) {
        console.error('Error deleting dialplan detail:', error);
        // Optionally, show a user-friendly error message (e.g., using a toast or alert)
        alert('Failed to delete the detail. Please try again.');
      }
    } else {
      // If the detail doesn't have an ID (e.g., a new unsaved detail), remove it locally
      const updated = [...details];
      updated.splice(index, 1);
      setDetails(updated);

      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const handleEditDetail = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  const handleUpdateDetail = (index: number, field: keyof any, value: string) => {
    const updated = [...details];
    updated[index] = { ...updated[index], [field]: value };
    setDetails(updated);
  };

  const handleNewDetailChange = (field: keyof DialplanDetail, value: string) => {
    setNewDetail({ ...newDetail, [field]: value });
    if (editingIndex === details.length - 1) {
      const updated = [...details];
      updated[details.length - 1] = { ...updated[details.length - 1], [field]: value };
      setDetails(updated);
    }
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dialplan Details</CardTitle>
          <Button
            onClick={handleAddDetail}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Add Condition
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Inline</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={index === details.length - 1 ? newDetail.dialplan_detail_tag : detail.dialplan_detail_tag}
                      onValueChange={(value) =>
                        index === details.length - 1
                          ? handleNewDetailChange('dialplan_detail_tag', value)
                          : handleUpdateDetail(index, 'dialplan_detail_tag', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Condition">Condition</SelectItem>
                        <SelectItem value="Regular Expression">Regular Expression</SelectItem>
                        <SelectItem value="Action">Action</SelectItem>
                        <SelectItem value="Anti-Action">Anti-Action</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    detail.dialplan_detail_tag
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={index === details.length - 1 ? newDetail.dialplan_detail_type : detail.dialplan_detail_type}
                      onValueChange={(value) =>
                        index === details.length - 1
                          ? handleNewDetailChange('dialplan_detail_type', value)
                          : handleUpdateDetail(index, 'dialplan_detail_type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationstypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    detail.dialplan_detail_type
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index &&
                    (index === details.length - 1
                      ? newDetail.dialplan_detail_tag === 'Action' && newDetail.dialplan_detail_type === 'Javascript'
                      : detail.dialplan_detail_tag === 'Action' && detail.dialplan_detail_type === 'Javascript') ? (
                    <Select
                      value={index === details.length - 1 ? newDetail.dialplan_detail_data : detail.dialplan_detail_data}
                      onValueChange={(value) =>
                        index === details.length - 1
                          ? handleNewDetailChange('dialplan_detail_data', value)
                          : handleUpdateDetail(index, 'dialplan_detail_data', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading..." : "Select data"} />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {console.log('Rendering Select with dropdownData:', dropdownData, 'value:', index === details.length - 1 ? newDetail.dialplan_detail_data : detail.dialplan_detail_data)} */}
                        {loading ? (
                          <SelectItem value="loading-state" disabled>
                            Loading...
                          </SelectItem>
                        ) : dropdownData.length > 0 ? (
                          dropdownData.map((item, idx) => (
                            <SelectItem key={idx} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data-state" disabled>
                            No data available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : editingIndex === index ? (
                    <Input
                      value={index === details.length - 1 ? newDetail.dialplan_detail_data : detail.dialplan_detail_data}
                      onChange={(e) =>
                        index === details.length - 1
                          ? handleNewDetailChange('dialplan_detail_data', e.target.value)
                          : handleUpdateDetail(index, 'dialplan_detail_data', e.target.value)
                      }
                    />
                  ) : (
                    detail.dialplan_detail_data
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={detail.dialplan_detail_break}
                      onValueChange={(value) => handleUpdateDetail(index, 'dialplan_detail_break', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-true">on-true</SelectItem>
                        <SelectItem value="on-false">on-false</SelectItem>
                        <SelectItem value="always">always</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    detail.dialplan_detail_break || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={detail.dialplan_detail_inline}
                      onValueChange={(value) => handleUpdateDetail(index, 'dialplan_detail_inline', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    detail.dialplan_detail_inline || '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 justify-center">
                    {editingIndex === index ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index === details.length - 1) {
                              const isEmpty = !newDetail.dialplan_detail_tag && !newDetail.dialplan_detail_type && !newDetail.dialplan_detail_data;
                              if (isEmpty) {
                                const updated = [...details];
                                updated.pop();
                                setDetails(updated);
                              } else {
                                console.log('Saving new detail:', newDetail);
                                // Add save logic here if needed
                              }
                            }
                            setEditingIndex(null);
                          }}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index === details.length - 1) {
                              const isEmpty = !newDetail.dialplan_detail_tag && !newDetail.dialplan_detail_type && !newDetail.dialplan_detail_data;
                              if (isEmpty) {
                                const updated = [...details];
                                updated.pop(); // Remove the last (new) row
                                setDetails(updated);
                              }
                            }
                            setEditingIndex(null); // Exit edit mode
                          }}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDetail(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          disabled={deleting === index}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {details.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No dialplan details added yet. Click "Add Condition" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DialplanDetailsTable;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, Save, Eye } from 'lucide-react';
import DialplanForm from '@/components/dialplan/DialplanForm';
import DialplanDetailsTable from '@/components/dialplan/DialplanDetailsTable';

const DialplanViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    number: "",
    hostname: "",
    context: "",
    description: "",
    continue: "",
    domain: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      // Fetch dialplan data
      fetch(`https://10.16.7.96/api/dialplans/${id}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched dialplan data:', data);
          setInputs({
            name: data.dialplan_name || "",
            number: data.dialplan_destination || "",
            hostname: data.hostname || "",
            context: data.dialplan_context || "",
            description: data.dialplan_description || "",
            continue: data.dialplan_continue ? "true" : "false",
            domain: data.domain_id ? String(data.domain_id) : ""
          });

          // Set dialplan details
          if (data.dialplan_details) {
            const formattedDetails = data.dialplan_details.map((detail: any) => ({
              detail_id: detail.detail_id,
              dialplan_detail_tag: detail.dialplan_detail_tag || "",
              dialplan_detail_type: detail.dialplan_detail_type || "",
              dialplan_detail_data: detail.dialplan_detail_data || "",
              dialplan_detail_break: detail.dialplan_detail_break || "",
              dialplan_detail_inline: detail.dialplan_detail_inline || ""
            }));
            setDetails(formattedDetails);
          }

          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching dialplan:', error);
          toast({
            title: "Error",
            description: "Failed to fetch dialplan details",
            variant: "destructive"
          });
          setLoading(false);
        });
    }
  }, [id, toast]);

  const handleUpdate = () => {
    console.log('Updating dialplan with inputs:', inputs);
    console.log('Updating dialplan details:', details);

    // Basic validation
    const newErrors: any = {};
    if (!inputs.name) newErrors.name = 'Name is required';
    if (!inputs.number) newErrors.number = 'Number is required';
    if (!inputs.hostname) newErrors.hostname = 'Hostname is required';
    if (!inputs.context) newErrors.context = 'Context is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payload with filtered and mapped dialplan details
    const handleDialPlanPayload = {
      domain_id: inputs.domain || null,
      dialplan_continue: inputs.continue === 'true',
      dialplan_xml: "",
      dialplan_description: inputs.description,
      hostname: inputs.hostname,
      dialplan_context: inputs.context,
      dialplan_name: inputs.name,
      dialplan_destination: inputs.number,
      dialplan_details: details
        .filter((detail: any) =>
          detail.detail_id !== Number ||
          detail.dialplan_detail_tag !== "" ||
          detail.dialplan_detail_type !== "" ||
          detail.dialplan_detail_data !== "" ||
          detail.dialplan_detail_break !== "" ||
          detail.dialplan_detail_inline !== ""
        )
        .map((detail: any) => {
        
          return {
            detail_id: 0,
            dialplan_detail_tag: detail.dialplan_detail_tag.charAt(0).toLowerCase() + detail.dialplan_detail_tag.slice(1),
            dialplan_detail_type: detail.dialplan_detail_type.charAt(0).toLowerCase() + detail.dialplan_detail_type.slice(1),
            dialplan_detail_data: detail.dialplan_detail_data,
            dialplan_detail_break: detail.dialplan_detail_break,
            dialplan_detail_inline: detail.dialplan_detail_inline
          };
        })
    };

    // Make API call to update dialplan
    fetch(`https://10.16.7.96/api/dialplans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(handleDialPlanPayload)
    })
      .then(response => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Dialplan updated successfully",
          });
          setIsEditMode(false);
          navigate('/dialplan')
        } else {
          throw new Error('Failed to update dialplan');
        }
      })
      .catch(error => {
        console.error('Error updating dialplan:', error);
        toast({
          title: "Error",
          description: "Failed to update dialplan",
          variant: "destructive"
        });
      });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => navigate('/dialplan')}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dialplans</span>
      </Button>

      {isEditMode ? (
        <DialplanForm
          inputs={inputs}
          setInputs={setInputs}
          errors={errors}
          setErrors={setErrors}
          createToUpdate={false}
          onClose={() => setIsEditMode(false)}
          onSave={() => {}}
          onUpdate={handleUpdate}
          details={details}
          setDetails={setDetails}
        />
      ) : (
        <div className="space-y-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div>Dialplan Information</div>
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.name}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Number</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.number}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hostname</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.hostname}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Context</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.context}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Continue</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.continue}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Domain</label>
                  <div className="p-3 bg-gray-50 rounded-md">{inputs.domain || 'Not specified'}</div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">{inputs.description || 'No description provided'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dialplan Details</CardTitle>
            </CardHeader>
            <CardContent>
              {details.length > 0 ? (
                <DialplanDetailsTable details={details} setDetails={setDetails} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No dialplan details available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DialplanViewPage;
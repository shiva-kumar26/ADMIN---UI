import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialplanForm from '@/components/dialplan/DialplanForm';
import { toast } from 'sonner';

const DialplanEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dialplan, setDialplan] = useState(null);
  const [details, setDetails] =useState([])
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({
    name: '',
    number: '',
    hostname: '',
    context: '',
    continue: '',
    domain: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`https://10.16.7.96/api/dialplans/${id}`)
      .then(res => res.json())
      .then(data => {
        setDialplan(data);
        setInputs({
          name: data.dialplan_name || '',
          number: data.dialplan_destination || '',
          hostname: data.hostname || '',
          context: data.dialplan_context || '',
          continue: String(data.dialplan_continue),
          domain: String(data.domain_id),
          description: data.dialplan_description || ''
        });
         setDetails(data.dialplan_details || []);
        setLoading(false);
      });
  }, [id]);
  function lowerFirst(str: string) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : '';
}
    
  const onUpdate = async () => {
  const payload = {
    domain_id: Number(inputs.domain),
    dialplan_continue: inputs.continue === 'true',
    dialplan_description: inputs.description,
    hostname: inputs.hostname,
    dialplan_context: inputs.context,
    dialplan_name: inputs.name,
    dialplan_destination: inputs.number,
    dialplan_details: details.map((detail) => ({
      detail_id: detail.detail_id || 0,
dialplan_detail_tag: lowerFirst(detail.dialplan_detail_tag || ''),
  dialplan_detail_type: lowerFirst(detail.dialplan_detail_type || ''),
      dialplan_detail_data: detail.dialplan_detail_data || '',
      dialplan_detail_break: detail.dialplan_detail_break || '',
      dialplan_detail_inline: detail.dialplan_detail_inline || '',
    })),
  };

  try {
    const response = await fetch(`https://10.16.7.96/api/dialplans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
     toast('Dialplan updated successfully!');
      navigate("/dialplan"); // Go back
    } else {
      const err = await response.json();
      console.error('Update failed:', err);
      alert('Failed to update dialplan');
    }
  } catch (error) {
    console.error('Error during update:', error);
    alert('Server error occurred');
  }
};

  if (loading) return <div>Loading...</div>;
  if (!dialplan) return <div>Dialplan not found</div>;

  return (
    <DialplanForm
      inputs={inputs}
      setInputs={setInputs}
      errors={errors}
      setErrors={setErrors}
      createToUpdate={false}
      onClose={() => navigate(-1)}
      onSave={() => {/* implement save logic */}}
      onUpdate={() => {onUpdate()}}
      details={details}
      setDetails={setDetails}
      // pass other props as needed
    />
  );
};

export default DialplanEditPage;
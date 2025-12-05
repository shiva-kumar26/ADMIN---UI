
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DialplanForm from './DialplanForm';
import { toast } from 'sonner';

const DialplanAddPage = () => {
  const navigate = useNavigate();
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

const onSave = async () => {
  const payload = {
    domain_id: Number(inputs.domain),
    dialplan_continue: inputs.continue === 'true',
    dialplan_description: inputs.description,
    hostname: inputs.hostname,
    dialplan_context: inputs.context,
    dialplan_name: inputs.name,
    dialplan_destination: inputs.number,
    dialplan_details: details.map((detail) => ({
      dialplan_detail_tag: detail.dialplan_detail_tag || '',
      dialplan_detail_type: detail.dialplan_detail_type || '',
      dialplan_detail_data: detail.dialplan_detail_data || '',
      dialplan_detail_break: detail.dialplan_detail_break || '',
      dialplan_detail_inline: detail.dialplan_detail_inline || '',
    })),
  };

  try {
    const response = await fetch('https://10.16.7.96/api/dialplans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
    toast('Dialplan created successfully!')
      // Optionally navigate back
      // navigate(-1);
      navigate("/dialplan")
    } else {
      const err = await response.json();
      console.error('Creation failed:', err);
      alert('Failed to create dialplan');
    }
  } catch (error) {
    console.error('Error during creation:', error);
    alert('Server error occurred');
  }
};
  const [details, setDetails] = useState([
    {
      dialplan_detail_tag: '',
      dialplan_detail_type: '',
      dialplan_detail_data: '',
      dialplan_detail_break: '',
      dialplan_detail_inline: ''
    }
  ]);
  return (
    <DialplanForm
      inputs={inputs}
      setInputs={setInputs}
      errors={errors}
      setErrors={setErrors}
      createToUpdate={true}
      onClose={() => navigate(-1)}
      onSave={() => {/* implement save logic */ onSave() }}
      onUpdate={() => {}}
    />
  );
};

export default DialplanAddPage;
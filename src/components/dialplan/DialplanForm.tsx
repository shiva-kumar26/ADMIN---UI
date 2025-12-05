import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DialplanDetailsTable from './DialplanDetailsTable';

interface DialplanInputs {
  name: string;
  number: string;
  hostname: string;
  context: string;
  continue: string;
  domain: string;
  description: string;
}

interface DialplanErrors {
  name?: string;
  number?: string;
  hostname?: string;
  context?: string;
  continue?: string;
  domain?: string;
  description?: string;
}

interface Domain {
  domain_id: number;
  domain_name: string;
}

interface DialplanFormProps {
  inputs: DialplanInputs;
  setInputs: (inputs: DialplanInputs) => void;
  errors: DialplanErrors;
  setErrors: (errors: DialplanErrors) => void;
  createToUpdate: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdate: () => void;
  details?: any[]; // or use a proper type
setDetails?: (details: any[]) => void;
}

const DialplanForm: React.FC<DialplanFormProps> = ({
  inputs,
  setInputs,
  errors,
  setErrors,
  createToUpdate,
  onClose,
  onSave,
  onUpdate,
  details = [],
  setDetails = () => {},
}) => {
  const { toast } = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainsLoaded, setDomainsLoaded] = useState(false);


  const handleInputChange = (field: keyof DialplanInputs, value: string) => {
    setInputs({ ...inputs, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };


  const handleDomainDropdownClick = () => {
    if (!domainsLoaded) {
      console.log("Fetching domains...");
      fetch('https://10.16.7.96/api/domains/')
        .then((response) => {
          console.log('Domains API response status:', response.status);
          return response.json();
        })
        .then((data) => {
          console.log('Domains API response data:', data);
          setDomains(data);
          setDomainsLoaded(true);
        })
        .catch((error) => {
          console.error('Error fetching domains:', error);
          toast({
            title: "Error",
            description: "Failed to fetch domains",
            variant: "destructive"
          });
        });
    }
  };

  // Load domains on component mount
  useEffect(() => {
    handleDomainDropdownClick();
  }, []);

  return (
    <Card className='mt-8'>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              {createToUpdate ? (
                <>
                  <Save className="w-5 h-5" />
                  Add New Dialplan
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5" />
                  Edit Dialplan
                </>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Dialplan Name *</Label>
            <Input
              id="name"
              placeholder="Enter dialplan name"
              value={inputs.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Destination Number *</Label>
            <Input
              id="number"
              placeholder="Enter destination number"
              value={inputs.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname *</Label>
            <Input
              id="hostname"
              placeholder="Enter hostname (IP address)"
              value={inputs.hostname}
              onChange={(e) => handleInputChange('hostname', e.target.value)}
              className={errors.hostname ? 'border-red-500' : ''}
            />
            {errors.hostname && <p className="text-sm text-red-500">{errors.hostname}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context *</Label>
            <Input
              id="context"
              placeholder="Enter context"
              value={inputs.context}
              onChange={(e) => handleInputChange('context', e.target.value)}
              className={errors.context ? 'border-red-500' : ''}
            />
            {errors.context && <p className="text-sm text-red-500">{errors.context}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="continue">Continue</Label>
            <Select value={inputs.continue} onValueChange={(value) => handleInputChange('continue', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select continue option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="space-y-2">
  <Label htmlFor="domain">Domain</Label>
 <Select
  value={inputs.domain !== "" ? inputs.domain : undefined}
  onValueChange={(value) => handleInputChange("domain", value)}
  onOpenChange={(open) => {
    if (open) handleDomainDropdownClick();
  }}
>
  <SelectTrigger>
    <SelectValue
      placeholder={
        domainsLoaded
          ? domains.length > 0
            ? "Select domain"
            : "No domains available"
          : "Loading domains..."
      }
    />
  </SelectTrigger>
  <SelectContent>
    {domains.map((domain) => (
      <SelectItem key={domain.domain_id} value={String(domain.domain_id)}>
        {domain.domain_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

</div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter dialplan description"
              value={inputs.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
        </div>
{!createToUpdate && details && setDetails && (
  <DialplanDetailsTable 
  details={details}
  setDetails={setDetails}/>
)}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={createToUpdate ? onSave : onUpdate}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {createToUpdate ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Dialplan
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Update Dialplan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DialplanForm;

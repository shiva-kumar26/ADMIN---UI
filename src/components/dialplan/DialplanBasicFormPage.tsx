
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface DialplanBasicFormProps {
  inputs: DialplanInputs;
  errors: DialplanErrors;
  domains: Domain[];
  domainsLoaded: boolean;
  onInputChange: (field: keyof DialplanInputs, value: string) => void;
  onDomainDropdownClick: () => void;
}

const DialplanBasicForm: React.FC<DialplanBasicFormProps> = ({
  inputs,
  errors,
  domains,
  domainsLoaded,
  onInputChange,
  onDomainDropdownClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">Dialplan Name *</Label>
        <Input
          id="name"
          placeholder="Enter dialplan name"
          value={inputs.name}
          onChange={(e) => onInputChange('name', e.target.value)}
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
          onChange={(e) => onInputChange('number', e.target.value)}
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
          onChange={(e) => onInputChange('hostname', e.target.value)}
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
          onChange={(e) => onInputChange('context', e.target.value)}
          className={errors.context ? 'border-red-500' : ''}
        />
        {errors.context && <p className="text-sm text-red-500">{errors.context}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="continue">Continue</Label>
        <Select value={inputs.continue} onValueChange={(value) => onInputChange('continue', value)}>
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
          onValueChange={(value) => onInputChange("domain", value)}
          onOpenChange={(open) => {
            if (open) onDomainDropdownClick();
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
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default DialplanBasicForm;

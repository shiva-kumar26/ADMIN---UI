import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // adjust import if needed

const QueueCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    strategy: '',
    moh_sound: '',
    time_base_score: '',
    tier_rules_apply: '',
    tier_rule_wait_second: 0,
    tier_rule_wait_multiply_level: '',
    tier_rule_no_agent_no_wait: '',
    discard_abandoned_after: 0,
    abandoned_resume_allowed: '',
    max_wait_time: 0,
    max_wait_time_with_no_agent: 0,
    max_wait_time_with_no_agent_time_reached: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation logic
    const {
      name,
      strategy,
      moh_sound,
      time_base_score,
      tier_rules_apply,
      tier_rule_wait_second,
      tier_rule_wait_multiply_level,
      tier_rule_no_agent_no_wait,
      discard_abandoned_after,
      abandoned_resume_allowed,
      max_wait_time,
      max_wait_time_with_no_agent,
      max_wait_time_with_no_agent_time_reached
    } = form;

    const regexNumbers = /^[0-9]+$/;
    let newErrors: { [key: string]: string } = {};

    // Name validation (example, adjust as needed)
    if (!name || name.trim().length < 5) {
      newErrors.name = 'Name must be at least 5 characters long.';
    }
    if (!strategy) newErrors.strategy = 'Strategy is required.';
    if (!moh_sound) newErrors.moh_sound = 'MOH sound is required.';
    if (!time_base_score) newErrors.time_base_score = 'Time base score is required.';
    if (!tier_rules_apply) newErrors.tier_rules_apply = 'Tier rules apply is required.';
    if (!regexNumbers.test(tier_rule_wait_second.toString())) newErrors.tier_rule_wait_second = 'Enter a valid number.';
    if (!tier_rule_wait_multiply_level) newErrors.tier_rule_wait_multiply_level = 'Required.';
    if (!tier_rule_no_agent_no_wait) newErrors.tier_rule_no_agent_no_wait = 'Required.';
    if (!regexNumbers.test(discard_abandoned_after.toString())) newErrors.discard_abandoned_after = 'Enter a valid number.';
    if (!abandoned_resume_allowed) newErrors.abandoned_resume_allowed = 'Required.';
    if (!regexNumbers.test(max_wait_time.toString())) newErrors.max_wait_time = 'Enter a valid number.';
    if (!regexNumbers.test(max_wait_time_with_no_agent.toString())) newErrors.max_wait_time_with_no_agent = 'Enter a valid number.';
    if (!regexNumbers.test(max_wait_time_with_no_agent_time_reached.toString())) newErrors.max_wait_time_with_no_agent_time_reached = 'Enter a valid number.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before saving.",
        variant: "destructive",
      });
      return;
    }

    // Prepare payload
    const payload = {
      name,
      strategy,
      moh_sound,
      time_base_score,
      tier_rules_apply,
      tier_rule_wait_second,
      tier_rule_wait_multiply_level,
      tier_rule_no_agent_no_wait,
      discard_abandoned_after,
      abandoned_resume_allowed,
      max_wait_time,
      max_wait_time_with_no_agent,
      max_wait_time_with_no_agent_time_reached,
      record_template: '$${recordings_dir}/${strftime(%Y-%m-%d)}/${sip_to_user}.${caller_id_number}.${uuid}.wav'
    };

    try {
      await axios.post('https://10.16.7.96/api/api/queue', payload);
      toast({
        title: "Queue Created",
        description: "Queue added successfully.",
      });
      navigate('/queues');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create queue.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/queues')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queues
            </Button>
         
          </div>
         
          <div>
            
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label>Queue Name</label>
              <Input
              placeholder='Enter queue name'
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </div>
            <div className="space-y-2">
              <label>Strategy</label>
              <Select
                value={form.strategy}
                onValueChange={v => handleChange('strategy', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ring-all">ring-all</SelectItem>
                  <SelectItem value="longest-idle-agent">longest-idle-agent</SelectItem>
                  <SelectItem value="round-robin">round-robin</SelectItem>
                  <SelectItem value="top-down">top-down</SelectItem>
                  <SelectItem value="agent-with-least-talk-time">agent-with-least-talk-time</SelectItem>
                  <SelectItem value="agent-with-fewest-calls">agent-with-fewest-calls</SelectItem>
                  <SelectItem value="sequentially-by-agent-order">sequentially-by-agent-order</SelectItem>
                  <SelectItem value="random">random</SelectItem>
                  <SelectItem value="ring-progressively">ring-progressively</SelectItem>
                  {/* Add more strategies as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>MOH sound</label>
              <Select
                value={form.moh_sound}
                onValueChange={v => handleChange('moh_sound', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local_stream://moh">local_stream://moh</SelectItem>
                  <SelectItem value="local_stream://default">local_stream://default</SelectItem>
                  <SelectItem value="Recordings">Recordings</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
              {errors.moh_sound && <span className="text-red-500 text-xs">{errors.moh_sound}</span>}
            </div>
            <div className="space-y-2">
              <label>Time base score</label>
              <Select
                value={form.time_base_score}
                onValueChange={v => handleChange('time_base_score', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">Queue</SelectItem>
                  <SelectItem value="system">system</SelectItem>
                  {/* Add more options as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Tier rules apply</label>
              <Select
                value={form.tier_rules_apply}
                onValueChange={v => handleChange('tier_rules_apply', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Tier rule wait second</label>
              <Input
                type="number"
                value={form.tier_rule_wait_second}
                onChange={e => handleChange('tier_rule_wait_second', Number(e.target.value))}
              />
              {errors.tier_rule_wait_second && <span className="text-red-500 text-xs">{errors.tier_rule_wait_second}</span>}
            </div>
            <div className="space-y-2">
              <label>Tier rule wait multiply level</label>
                <Select
                value={form.tier_rule_wait_multiply_level}
                onValueChange={v => handleChange('tier_rule_wait_multiply_level', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
              {errors.tier_rule_wait_multiply_level && <span className="text-red-500 text-xs">{errors.tier_rule_wait_multiply_level}</span>}
            </div>
            <div className="space-y-2">
              <label>Tier rule no agent no wait</label>
              <Select
                value={form.tier_rule_no_agent_no_wait}
                onValueChange={v => handleChange('tier_rule_no_agent_no_wait', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
              {errors.tier_rule_no_agent_no_wait && <span className="text-red-500 text-xs">{errors.tier_rule_no_agent_no_wait}</span>}
            </div>
            <div className="space-y-2">
              <label>Discard abandoned after</label>
              <Input
                type="number"
                value={form.discard_abandoned_after}
                onChange={e => handleChange('discard_abandoned_after', Number(e.target.value))}
              />
              {errors.discard_abandoned_after && <span className="text-red-500 text-xs">{errors.discard_abandoned_after}</span>}
            </div>
            <div className="space-y-2">
              <label>Abandoned resume allowed</label>
              <Select
                value={form.abandoned_resume_allowed}
                onValueChange={v => handleChange('abandoned_resume_allowed', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
              {errors.abandoned_resume_allowed && <span className="text-red-500 text-xs">{errors.abandoned_resume_allowed}</span>}
            </div>
            <div className="space-y-2">
              <label>Max wait time</label>
              <Input
                type="number"
                value={form.max_wait_time}
                onChange={e => handleChange('max_wait_time', Number(e.target.value))}
              />
              {errors.max_wait_time && <span className="text-red-500 text-xs">{errors.max_wait_time}</span>}
            </div>
            <div className="space-y-2">
              <label>Max wait time no agent</label>
              <Input
                type="number"
                value={form.max_wait_time_with_no_agent}
                onChange={e => handleChange('max_wait_time_with_no_agent', Number(e.target.value))}
              />
              {errors.max_wait_time_with_no_agent && <span className="text-red-500 text-xs">{errors.max_wait_time_with_no_agent}</span>}
            </div>
            <div className="space-y-2">
              <label>Max wait time no agent reached</label>
              <Input
                type="number"
                value={form.max_wait_time_with_no_agent_time_reached}
                onChange={e => handleChange('max_wait_time_with_no_agent_time_reached', Number(e.target.value))}
              />
              {errors.max_wait_time_with_no_agent_time_reached && <span className="text-red-500 text-xs">{errors.max_wait_time_with_no_agent_time_reached}</span>}
            </div>

          </form>
              <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg ml-auto mt-2"
            style={{marginLeft:'66rem'}}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueCreation;
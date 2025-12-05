
export interface LoginRequest {
  username: string;
  password: string;
}

export interface DirectoryUser {
  directory_id: number;
  firstname: string;
  lastname: string;
  hostname: string;
  extension: string;
  password: string;
  role: string[];
  supervisor_reference: string[];
  user_id: string;
  name: string;
  instance_id: string;
  uuid: string;
  type: string;
  contact: string;
  status: string;
  state: string;
  max_no_answer: number;
  wrap_up_time: number;
  reject_delay_time: number;
  busy_delay_time: number;
  no_answer_delay_time: number;
  last_bridge_start: number;
  last_bridge_end: number;
  last_offered_call: number;
  last_status_change: number;
  no_answer_count: number;
  calls_answered: number;
  talk_time: number;
  ready_time: number;
  external_calls_count: number;
  agent: string;
  queue: string[];
  tier_state: string | null;
  level: number;
  position: number;
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  hostname: string;
  extension: string;
  password: string;
  role: string[];
  supervisor_reference: string[];
  user_id: string;
  instance_id: string;
  uuid: string;
  type: string;
  contact: string;
  status: string;
  state: string;
  max_no_answer: number;
  wrap_up_time: number;
  reject_delay_time: number;
  busy_delay_time: number;
  no_answer_delay_time: number;
  last_bridge_start: number;
  last_bridge_end: number;
  last_offered_call: number;
  last_status_change: number;
  no_answer_count: number;
  calls_answered: number;
  talk_time: number;
  ready_time: number;
  external_calls_count: number;
  queue: string[];
  tier_state: string;
  level: number;
  position: number;
}

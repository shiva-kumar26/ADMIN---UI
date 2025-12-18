

export interface EmailTemplate {
  template_id: number;
  name: string;
  subject: string;
  body: string;
  attachments?: FileOrUrl[];
  images?: FileOrUrl[];
  created_at?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  url: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  body: string;
}

export interface FileOrUrl {
  id?: string; // Added optional ID for compatibility
  name: string;
  file?: File;
  url?: string;
}
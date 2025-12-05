

export interface EmailTemplate {
  template_id: number;
  name: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
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
  name: string;
  file?: File;
  url?: string;
}
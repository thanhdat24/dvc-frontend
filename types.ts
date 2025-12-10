export interface UploadResponse {
  success: boolean;
  message: string;
}

export enum InputMethod {
  TEXT = 'TEXT',
  FILE = 'FILE'
}

// Cấu trúc dữ liệu trả về từ API DVC
export interface DossierItem {
  id: string;
  code: string;
  applicant: {
    data: {
      noidungyeucaugiaiquyet?: string;
    };
  };
  accepter: {
    fullname: string;
  };
  appointmentDate?: string;
  procedure?: {
    id: string;
  };
  currentTask?: any; // Có thể là list hoặc object
}

export interface FetchResult {
  dat: DossierItem[];
  sau: DossierItem[];
  error?: string;
}

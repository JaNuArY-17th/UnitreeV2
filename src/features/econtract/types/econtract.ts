// Định nghĩa các interface cho eContract

// Interface cho Contract Job Info từ generate-contract API
export interface ContractJob {
  queue_name: string;
  job_id: string;
}

// Interface cho signed contract info từ sign-contract API
export interface SignedContractInfo {
  id: string;
  contract_id: number;
  contract_uid: string;
  contract_no: string;
  contract_name: string;
  signed_file: {
    id: string;
    file_url?: string; // URL của file đã ký
    file_name?: string; // Tên file
    file_key?: string; // Key của file
    created_at?: string; // Thời gian tạo
    updated_at?: string; // Thời gian cập nhật
    status?: string; // Trạng thái file
  };
}

// Interface cho EContract State
export interface EContractState {
  contractJob: ContractJob | null;
  signedContract: SignedContractInfo | null;
  jobStatus: string | null;
  otpStatus: boolean;
  isLoading: boolean;
  error: string | null;
}

// Response interfaces cho từng API

// Generate Contract Response
export interface GenerateContractResponse {
  success: boolean;
  message: string;
  data: ContractJob;
  code: number;
}

// Sign Contract Request
export interface SignContractRequest {
  otp: string;
  sign_base64: string;
}

// Sign Contract Response
export interface SignContractResponse {
  success: boolean;
  message: string;
  data: SignedContractInfo;
  code: number;
}

// Request OTP Response
export interface RequestOtpResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    otp_sent?: boolean;
    phone_number?: string;
  };
  code: number;
}

// Resend OTP Response
export interface ResendOtpResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
  };
  code: number;
}

// Queue Status Request
export interface QueueStatusRequest {
  queue_name: string;
  job_id: string;
}

// Định nghĩa kiểu cho file trong response
export interface EcontractFile {
  created_at: string;
  expire_at: string | null;
  file_key: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  id: string;
  status: string;
  updated_at: string;
}

// Định nghĩa kiểu cho thông tin hợp đồng
export interface UploadFileEcontractS3 {
  contract_expire_time: string;
  contract_id: number;
  contract_name: string;
  contract_no: string;
  contract_sign_time: string;
  contract_uid: string;
  created_at: string;
  id: string;
  organization_id: number;
  recipient_id: number;
  sign_info_id: number;
  signed_file: null | EcontractFile;
  unsigned_file: EcontractFile;
}

// Định nghĩa kiểu cho result trong response, với cấu trúc linh hoạt hơn
export interface QueueStatusResult {
  uploadFileEcontractS3?: UploadFileEcontractS3;
  status: string;
  message?: string;
  success?: boolean;
  [key: string]: any; // Cho phép các trường khác có thể có trong response thực tế
}

// Queue Status Response - Linh hoạt hơn để phù hợp với response thực tế
export interface QueueStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    result?: QueueStatusResult;
    status?: string; // Một số API có thể trả về status trực tiếp ở đây
    [key: string]: any; // Cho phép các trường khác
  };
  code: number;
} 
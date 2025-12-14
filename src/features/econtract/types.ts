import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type JobStatus = 'pending' | 'completed' | 'failed' | null;

export interface PdfSource {
  uri: string;
}

export interface OtpFormValues {
  otp: string;
}

export interface SignatureResult {
  encoded: string;
  pathName?: string;
}

export interface ContractGenerationResult {
  queue_name: string;
  job_id: string;
}

export interface ContractStatusParams {
  queue_name: string;
  job_id: string;
}

export interface SignContractParams {
  otp: string;
  sign_base64: string;
}

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
}

export interface DownloadResult {
  statusCode: number;
}

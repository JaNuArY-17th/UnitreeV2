import { ParsedEkycResult } from '@/features/ekyc/services/ekycService';

// Extend ParsedEkycResult to include ocrErrors
export interface ExtendedEkycResult extends ParsedEkycResult {
  ocrErrors?: string[];
}

// Route params type
export interface UserInfoRouteParams {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  address?: string;
  ekycResult?: ExtendedEkycResult;
}

export interface VerifiedData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  address: string;
}

export interface ContactData {
  contactAddress: string;
  phoneNumber: string;
  email: string;
  useSameAddress: boolean;
}

export interface UserInfoSubmitData {
  documentVerification: {
    personalInfo: {
      fullName: string;
      gender: string;
      dateOfBirth: string;
      dateOfExpiry: string;
      dateOfIssue: string;
      nationality: string;
      identificationNumber: string;
      permanentAddress: string;
      contactAddress: string;
    };
    verification: {
      frontCard: {
        isAuthentic: boolean;
        livenessScore: number;
        faceSwappingScore: number;
        imageData: any;
      };
      backCard: {
        isAuthentic: boolean;
        livenessScore: number;
        faceSwappingScore: number;
        imageData: any;
      };
    };
  };
  faceVerification: {
    isLive: boolean;
    livenessScore: number;
    livenessMessage: string;
    age: number;
    gender: string;
    blurScore: number;
    eyesOpen: boolean;
    isMasked: boolean;
    nearImageData: any;
    farImageData: any;
  };
  metadata: {
    verificationTimestamp: string;
    challengeCode: string;
    serverVersion: string;
    status: string;
  };
}

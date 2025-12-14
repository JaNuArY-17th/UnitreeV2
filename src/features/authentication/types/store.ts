export type statusType = "PENDING" | "APPROVED" | "LOCKED";
export type businessType = "INDIVIDUAL" | "COMPANY";

export interface StoreType {
  id: number;
  name: string;
  description: string;
  vat: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BankMyDataResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankType: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  code: number;
}

export interface StoreMyDataResponse {
  success: boolean,
  message: string,
  data: {
    id: string,
    name: string,
    addressProvince: string,
    addressWard: string,
    addressDetail: string,
    postpaid: {
      commissionPercent: number;
    },
    owner: {
      id: string,
      name: string,
      email: string,
      phoneNumber: string,
      citizenNumber: string,
      createdAt: string,
      updatedAt: string
    },
    businessType: businessType,
    isActive: boolean,
    status: statusType,
    createdAt: string,
    updatedAt: string
  } | null,
  code: number
}

export interface CreateStoreRequest {
  name: string;
  taxCode: string;
  companyName: string | null;
  companyAddress: string | null;
  representative: string;
  addressProvince: string;
  addressWard: string;
  addressDetail: string;
  type: string;
  businessType: businessType;
  bankId: string;
}

export interface CreateStoreResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    taxCode: string;
    companyName: string;
    companyAddress: string;
    representative: string;
    addressProvince: string;
    addressWard: string;
    addressDetail: string;
    type: string;
    status: statusType;
    createdAt: string;
    updatedAt: string;
  };
  code: number;
}

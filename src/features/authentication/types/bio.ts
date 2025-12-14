export interface CheckBioResponse {
  success: boolean,
  message: string,
  data: {
    status: boolean
  },
  code: number
}

export interface BioResponse {
  success: boolean,
  message: string,
  data: true | null,
  code: number
}

export interface EnrollRequest {
  app_id: number,
  old_password: string,
  biometric_key: string
}

export interface RemoveRequest {
  app_id: number,
  old_password: string
}
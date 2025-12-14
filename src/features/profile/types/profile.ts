export interface UpdateAvatarRequest {
    avatar_id?: string;
}

export interface UpdatePhoneNumberRequest {
    phone_number: string;
}

export interface VerifyUpdatePhoneNumberRequest {
    otp: string;
}

export interface UpdateEmailRequest {
    email: string;
}

export interface VerifyUpdateEmailRequest {
    otp: string;
}
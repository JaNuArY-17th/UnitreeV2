export type Bank = {
  name: string;
  shortName: string;
  deeplink?: string;
};

export const BANKS: Bank[] = [
  { name: 'Vietcombank', shortName: 'VCB', deeplink: 'vietcombank://' },
  { name: 'Techcombank', shortName: 'TCB', deeplink: 'techcombank://' },
  { name: 'VietinBank', shortName: 'VTB', deeplink: 'vietinbank://' },
];

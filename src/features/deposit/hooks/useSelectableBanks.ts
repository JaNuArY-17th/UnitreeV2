import { useMemo } from 'react';
import { useListBanks } from './useBankAccount';
// Use require to avoid JSON module resolution issues across environments
 
const bankData = require('@/shared/types/bank.json');
import type { VietQRBank, ListBank } from '../types/bank';

export interface SelectableBank {
  source: 'mapped' | 'unmapped';
  citad: string;
  id: number;
  code?: string;
  bin?: string;
  name: string;
  short_name?: string;
  logo?: string;
  original?: VietQRBank | any; // bank.json entry
  listBank: ListBank;
}

// Build index by citad
const citadIndex: Record<string, any> = (bankData as any).data.reduce((acc: Record<string, any>, b: any) => {
  if (b.citad) acc[b.citad] = b;
  return acc;
}, {});

// Use local placeholder asset for banks without a mapped logo
import { PlaceholderBank } from '@/shared/assets';
const PLACEHOLDER_LOGO = PlaceholderBank; // numeric module id for Image source

export const useSelectableBanks = () => {
  const listBanksQuery = useListBanks();

  const selectableBanks = useMemo<SelectableBank[]>(() => {
    const listBanks = listBanksQuery.data?.data || [];
    return listBanks.map((lb, idx) => {
      const mapped = citadIndex[lb.citad];
      if (mapped) {
        return {
          source: 'mapped',
          citad: lb.citad,
          id: mapped.id ?? idx,
          code: mapped.code,
          bin: mapped.bin,
          name: mapped.name,
          short_name: mapped.short_name || mapped.shortName,
          logo: mapped.logo,
          original: mapped,
          listBank: lb,
        } as SelectableBank;
      }
      return {
        source: 'unmapped',
        citad: lb.citad,
        id: 100000 + idx,
        name: lb.bnkNm,
        short_name: undefined,
        code: undefined,
        bin: lb.bnkId,
  logo: PLACEHOLDER_LOGO,
        original: undefined,
        listBank: lb,
      } as SelectableBank;
    });
  }, [listBanksQuery.data?.data]);

  const searchable = useMemo(() => selectableBanks.map(b => ({
    ...b,
    _search: [b.short_name, b.name, b.code, b.bin, b.citad, b.listBank?.bnkNm].filter(Boolean).join(' ').toLowerCase(),
  })), [selectableBanks]);

  return {
    selectableBanks: searchable,
    isLoading: listBanksQuery.isLoading,
    isError: listBanksQuery.isError,
    error: listBanksQuery.error,
    refetch: listBanksQuery.refetch,
  };
};

export type { ListBank };
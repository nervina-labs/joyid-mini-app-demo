import { useAtomValue } from 'jotai'
import { atomWithStorage, useUpdateAtom } from 'jotai/utils'
import { Hex } from 'viem';

const addressAtom = atomWithStorage<Hex | null>(
  "joyid:address",
  null,
);

export const useCurrentAddress = () => useAtomValue(addressAtom);

export const useUpdateAddress = () => useUpdateAtom(addressAtom);

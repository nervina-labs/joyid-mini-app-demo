import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Hex } from 'viem';

const addressAtom = atomWithStorage<Hex | undefined>("joyid:address", undefined);
export const useCurrentAddress = () => useAtomValue(addressAtom);
export const useUpdateAddress = () => useSetAtom(addressAtom);


const aaAddressAtom = atom<Hex | undefined>(undefined);
export const useAaAddress = () => useAtomValue(aaAddressAtom);
export const useUpdateAaAddress = () => useSetAtom(aaAddressAtom);
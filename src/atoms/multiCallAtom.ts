import { Dispatch, SetStateAction } from 'react'
import { atom } from 'recoil'
import { Narrow, Abi, Address } from 'viem'

export interface IContractCallResult {
    key: string,
    error?: any,
    result: any
}

interface Icallback {
    fn: Dispatch<SetStateAction<any>> | ((data: any, key: string) => void),
    counter: number
}

// interface for global state
export interface IGlobalState {
    key: string,
    callback: Icallback[],
    abi: Narrow<Abi>,
    args?: Narrow<any>[],
    functionName: string,
    address: Address,
}


// this state contains all the requested contract function details, their keys and callback functions
export const globalState = atom({
    key: 'function_details',
    default: [] as IGlobalState[]
})

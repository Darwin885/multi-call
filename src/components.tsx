import { useState } from 'react';
import { useAccount } from 'wagmi'
import { fake_USDC, todo_address } from './utilities/address';
import { IContractCallResult } from './atoms/multiCallAtom';
import useMultiCall, { IActiveKeys, ISubscribeParam, createKey } from './hooks/useMultiCall';
import todoABI from './abis/todo.json';
import { IGlobalState } from './atoms/multiCallAtom';

export const Component1 = () => {

    const { address } = useAccount()

    const [callsResult, setCallsResult] = useState<IContractCallResult[]>([])
    const [activeKeys, setActiveKeys] = useState<IActiveKeys[]>([])

    const { subscribe, unSubscribe } = useMultiCall(activeKeys, setActiveKeys, setCallsResult);


    // test for requesting multiple contract call from one component and reading their data
    const call = () => {
        subscribe({ abi: todoABI, address: todo_address, functionName: 'getTodos', args: [address] } as ISubscribeParam)

        subscribe({
            abi: todoABI, address: todo_address, functionName: 'id2TodoItems', args: ['Things to Buy', '0']
        } as ISubscribeParam)

    }

    const stop = () => {
        unSubscribe(activeKeys)
    }

    // console.log('component 1................', callsResult)

    return (
        <div>
            <h3>Component 1 - function 1 with args1</h3>
            <button onClick={call}>Start Fetching Data 1</button>
            <button onClick={stop}>Stop Fetching Data 1</button>
        </div>
    );
}


export const Component2 = () => {
    const { address } = useAccount()

    const [callsResult, setCallsResult] = useState<IContractCallResult[]>([]);
    const [activeKeys, setActiveKeys] = useState<IActiveKeys[]>([]);

    const { subscribe, unSubscribe } = useMultiCall(activeKeys, setActiveKeys, setCallsResult);

    // test for requesting a contract call which was already subscribed by another component
    const call = () => {
        subscribe({ abi: todoABI, address: todo_address, callback_fn: (arg1) => console.log('component 2...callback function called... result', arg1.result), functionName: 'getTodos', args: [address] } as ISubscribeParam)

    }

    const stop = () => {
        unSubscribe(activeKeys)
    }

    // console.log('component 2.................', callsResult)
    return (
        <div>
            <h3>Component 2 - function 1 with args1</h3>
            <button onClick={call}>Start Fetching Data</button>
            <button onClick={stop}>Stop Fetching Data </button>
        </div>
    );
}



export const Component3 = () => {
    const { address } = useAccount()

    const [callsResult, setCallsResult] = useState<IContractCallResult[]>([])
    const [activeKeys, setActiveKeys] = useState<IActiveKeys[]>([])

    const { subscribe, unSubscribe } = useMultiCall(activeKeys, setActiveKeys, setCallsResult);


    // different contract call
    const call = () => {

        subscribe({
            abi: todoABI, address: todo_address, callback_fn: (arg1) => console.log('component 3...callback function called....function result', arg1.result),
            functionName: 'id2TodoItems', args: ['Things to Buy', '0']
        } as ISubscribeParam)


    }

    const stop = () => {
        unSubscribe(activeKeys)
    }


    // console.log('component 3 rendered......................', callsResult)


    return (
        <div>
            <h3>Component 3 - function 2 with args</h3>
            <button onClick={call}>Start Fetching Data</button>
            <button onClick={stop}>Stop Fetching Data </button>
        </div>
    );
}



export const Component4 = () => {
    const { address } = useAccount()

    const [callsResult, setCallsResult] = useState<IContractCallResult[]>([])
    const [activeKeys, setActiveKeys] = useState<IActiveKeys[]>([])

    const { subscribe, unSubscribe } = useMultiCall(activeKeys, setActiveKeys, setCallsResult);

    // test for requesting same contract function but with different args
    const call = () => {
        subscribe({ abi: todoABI, address: todo_address, callback_fn: (arg1) => console.log('component 4...callback function called...function result', arg1.result), functionName: 'getTodos', args: ['0xEdAcA12E8f1C751ebB387aA37002153024C68456'] } as ISubscribeParam)

    }

    const stop = () => {
        unSubscribe(activeKeys)
    }

    return (
        <div>
            <h3>Component 4 - function 1 with args2</h3>
            <button onClick={call}>Start Fetching Data</button>
            <button onClick={stop}>Stop Fetching Data </button>
        </div>
    );
}

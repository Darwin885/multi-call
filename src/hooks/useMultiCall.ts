import { Dispatch, SetStateAction } from 'react'
import { useSetRecoilState } from 'recoil'
import { IGlobalState, globalState } from '../atoms/multiCallAtom'
import { IContractCallResult } from '../atoms/multiCallAtom'


// interface for component's key state and activeKeys variable
export interface IActiveKeys {
    key: string,
    counter: number
}

// interface for subscribe param
export interface ISubscribeParam extends Omit<IGlobalState, 'callback' | 'key'> {
    callback_fn?: ((data: any) => void)
}



// this key is used to update contractFunctions
export const createKey = ({ address, functionName, args }: Omit<IGlobalState, 'abi' | 'key' | 'callback'>) => {
    const key = JSON.stringify({ address, functionName, args })

    return key
}


// contains keys of all the contract calls being made
const activeKeys: IActiveKeys[] = []


// if a fn with same args is already subscribed by another components then counter will be increased and returned.
// if a it's a new fn then counter value zero is returned
const _updateAndGetCounter = (key: string) => {
    const index = activeKeys.findIndex(a => a.key === key)

    if (index !== -1) {
        activeKeys[index].counter = activeKeys[index].counter + 1
        return activeKeys[index].counter
    }

    const counter = 0
    activeKeys.push({ key, counter })
    return counter
}


// when a contract call is no longer subscribed by any component it will be removed from globalState
// and this function is called to remove from activeKeys Variable as well.
const _removeInactiveKey = (key: string) => {
    const index = activeKeys.findIndex(a => a.key === key);

    if (index === -1) {
        console.warn('key wasnt found when removing from activeKeys, scenario: when a fn has only one callback_fn and is unsubscribed')
        return
    }

    activeKeys.splice(index, 1)
}


// wraps result State setter function with setTimeout
const _wrapCallbackFnWithSetTimout = (callback_fn: Dispatch<SetStateAction<IContractCallResult[]>>) => {

    return (data: any, key: string) => setTimeout(() => {
        callback_fn(prev => {

            // find if a particular contract call was made before, if true then update the old data with new
            const index = prev.findIndex(p => p.key === key)
            if (index !== -1) {
                prev[index].result = data.result
                return prev
            }

            // this contract call was never made before so there is no obj containing this key value, a new obj is pushed
            prev.push({ key, result: data.result })
            return prev
        })
    })
}




/**
 * @dev to use this hook components should have two thing in their component
 * 1) a key useState for uniquenes (use IActiveKeys interface) 
 * 2) a result useState to provide result data to it's component
 * @returns two functions 'subscribe' and 'unsubscribe'
 */
const useMultiCall = (keys: IActiveKeys[], componentKeyState: Dispatch<SetStateAction<IActiveKeys[]>>, componentResultState: Dispatch<SetStateAction<IContractCallResult[]>>) => {


    // setter function of globalState
    const setter = useSetRecoilState(globalState)

    /**
     * @dev updates global state to start fetching data of requested contract call
     * @param details contract function details 
     */
    const subscribe = (details: ISubscribeParam) => {

        const key = createKey({ address: details.address, functionName: details.functionName, args: details.args })


        // find if this contract call was already requested by this component
        const check = keys.findIndex(k => k.key === key)

        // prevent if it's already requested
        if (check !== -1) {
            console.log('prevented a component from subscribing same function with same args more than once')
            return
        }

        // counter to provide unique id for callback function
        const counter = _updateAndGetCounter(key)

        const update = (prev: IGlobalState[]): IGlobalState[] => {

            // find if contract is already subscribed by another component
            const index = prev.findIndex(d => d.key === key)

            const callback_fn = details.callback_fn || _wrapCallbackFnWithSetTimout(componentResultState)

            // if a contract fn is already subscribed by another component then callback_fn is updated
            if (index !== -1) {
                console.log('function already exists in global state.........')

                const new_obj: IGlobalState = prev[index]
                const filtered_arr = prev.filter(p => p.key !== key)

                return [...filtered_arr, { ...new_obj, callback: [...new_obj.callback, { counter, fn: callback_fn }] }]
            }

            // if it's a new contract call then new obj is added in globalState
            const new_arr: IGlobalState[] = [...prev, { ...details, key, callback: [{ fn: callback_fn, counter }] }]
            return new_arr
        }

        setter(prev => update(prev))

        // updating key state of called component
        componentKeyState(prev => [...prev, { key, counter }])
    }


    /**
     * @dev stops 
     * @param param array of objects containing key and counter
     * @returns error message if a inactive key is passed
     */
    const unSubscribe = (param: IActiveKeys[]) => {

        // check param has keys which were requested by this component
        const arrayOfKeys = keys.map(k => k.key)
        const checkPassed = param.every(p => arrayOfKeys.includes(p.key))

        if (!checkPassed) {
            return "contract call to remove wasn't requested before"
        }


        const remove = (prev: IGlobalState[]) => {
            let new_globalState = [...prev]

            param.forEach(p => {

                const index = new_globalState.findIndex(pv => pv.key === p.key)
                if (index === -1) {
                    console.warn('CallBack Function doesnt exist in globalState');
                    return
                }

                // if obj has only one callback_fn remove the entire obj
                if (new_globalState[index].callback.length === 1) {
                    new_globalState.splice(index, 1)
                    new_globalState = new_globalState.filter(obj => obj.key !== p.key)
                    _removeInactiveKey(p.key)

                }
                else {
                    // if obj has multiple callback_fn remove the callback_fn of called component
                    const new_callback = new_globalState[index].callback.filter(m => m.counter !== p.counter)
                    const objToUpdate = new_globalState[index]
                    new_globalState = new_globalState.filter(n => n.key !== p.key)
                    new_globalState = [...new_globalState, { ...objToUpdate, callback: new_callback }]

                }
            })

            return new_globalState
        }

        setter(prev => remove(prev))

        const updateComponentKeys = (prev: IActiveKeys[]) => {
            let original = prev
            param.forEach(v => {
                original = original.filter(o => o.key !== v.key)
            })

            return original
        }

        // updating key state of called component
        componentKeyState(prev => updateComponentKeys(prev))
    }


    return {
        subscribe,
        unSubscribe
    }
}

export default useMultiCall;
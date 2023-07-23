import { useContractReads } from 'wagmi';
import { useRecoilValue } from 'recoil'
import { globalState } from '../atoms/multiCallAtom';


const MultiCall = () => {

    const value = useRecoilValue(globalState)
    console.log('global state....', value)


    const contracts = value.map(({ callback, ...rest }) => rest)
    useContractReads({
        contracts, watch: true, select: (data) => {
            // console.log('value....................', value)

            // executing all contract calls
            value.forEach((v, index) => {

                // console.log('contract', index, v)
                console.log('result', data[index])

                // executing all callback_fn of each contract call
                v.callback.forEach(c => {

                    c.fn(data[index], v.key)

                })
            })


            return ['empty array']
        }
    })

    return null;
}

export default MultiCall;
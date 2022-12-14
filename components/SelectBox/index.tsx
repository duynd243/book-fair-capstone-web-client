import React, {useMemo, useState, Fragment} from 'react'
import {defaultInputClass} from "../Form";
import {HiCheckCircle} from "react-icons/hi2";
import {Combobox, Transition} from '@headlessui/react';
import {BiChevronDown} from "react-icons/bi";

type Props = {
    placeholder: string;
    value: any;
    onChange: (value: any) => void;
    dataSource: any[] | undefined;
    displayKey: string;
}

const SelectBox: React.FC<Props> = ({placeholder, value, onChange, dataSource, displayKey}) => {
    const [search, setSearch] = useState('');


    const searchedOptions = useMemo(() => {
        return dataSource?.filter(i => i?.[displayKey]?.toLowerCase().includes(search?.toLowerCase()))
    }, [search, displayKey, dataSource]);

    return (
        <Combobox value={value} onChange={onChange}>
            <div className='relative'>
                <Combobox.Input
                    placeholder={placeholder}
                    className={defaultInputClass}
                    displayValue={(v: typeof value) => {
                        return v?.[displayKey] ?? '';
                    }}
                    onChange={(e) => setSearch(e.target.value)}/>
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <BiChevronDown
                        className="h-5 w-5 text-gray-400 ui-open:rotate-180 transition duration-200"
                        aria-hidden="true"
                    />
                </Combobox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setSearch('')}
                >
                    <Combobox.Options
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {searchedOptions && searchedOptions?.length > 0 ? searchedOptions.map((option, index) => (
                            <Combobox.Option
                                className='ui-selected:font-medium ui-selected:text-gray-900 text-gray-700 rounded relative cursor-default select-none py-2 px-4 ui-active:bg-indigo-600 ui-active:text-white'
                                key={index}
                                value={option}>
                                {({selected}) => (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm'>{option?.[displayKey]}</span>
                                        {selected &&
                                            <HiCheckCircle className='text-lg fill-indigo-600 ui-active:fill-white'/>}
                                    </div>
                                )}
                            </Combobox.Option>
                        )) : <div className='text-center text-gray-400 py-1 text-sm'>Kh??ng c?? k???t qu???</div>}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    )
}

export default SelectBox
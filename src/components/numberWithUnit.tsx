import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useId, useMemo, useRef, useState } from "react";
import { getTestId } from "../Utilities";

export type Option = {displayName: string, value: number, isDefault?: boolean};

export const NumberWithUnit = (
    {name, placeholder, options, setState, defaultValue, validationMsg}:
    {
        name: string, 
        placeholder: string, 
        options: Option[], 
        setState: Dispatch<SetStateAction<number>>,
        defaultValue?: number,
        validationMsg?: string | null 
    }
) => {
    const inputId = useId();
    const selectId = useId();

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [val, setVal] = useState<string>(defaultValue?.toString() ?? '');
    const [unit, setUnit] = useState<Option>(options.filter(({isDefault}) => isDefault)[0] ?? options[0]);

    useEffect(() => {
        if (val !== ''){
            const valInt = parseFloat(val!);
            const unitInt = unit.value;
            const state = valInt * unitInt;
            setState(state);
        } else {
            setState(0);
        }
    }, [val, unit, setState]);

    const getUnitFromName = useMemo(() => (newDisplayName: string) => {
        const newUnit = options.filter(({displayName}) => displayName === newDisplayName)[0];
        if (!newUnit){
            console.error({newDisplayName, options});
        }
        return newUnit;
    }, [options]);

    useEffect(() => {
        const input = inputRef.current;
        if (input != null){
            input.setCustomValidity(validationMsg ?? '');
            input.reportValidity()
        }
    }, [validationMsg]);

    const setUnitFromEvent = useMemo(() => (
        ({target: {value}}: ChangeEvent<HTMLSelectElement>) => {
            const newUnit = getUnitFromName(value);
            setUnit(newUnit);
        }
    ), [getUnitFromName]);

    useEffect(() => {
        setUnit(getUnitFromName(unit.displayName)); // update unit.bits
    }, [getUnitFromName, unit]);

    return <fieldset className="fieldWithDropdown" data-testid={getTestId(name)}>
        <legend>{name}</legend>
        <div className="field-row-stacked">
            <label htmlFor={inputId}>Amount</label>
            <input 
                id={inputId} 
                type="number"
                ref={inputRef}
                defaultValue={val}
                onChange={(e) => setVal(e.target.value)}
                {...{placeholder}} 
            />
        </div>
        <div className="field-row-stacked">
            <label htmlFor={selectId}>Unit</label>
            <select id={selectId} value={unit.displayName} onChange={setUnitFromEvent}>
                {options.map(({displayName}) => (
                    <option key={displayName} value={displayName}>{displayName}</option>
                ))}
            </select>
        </div>
    </fieldset>
}
import { ChangeEvent, useId, useMemo } from "react";
import { getTestId } from "../Utilities";

const RadioBtn = (
    {radioName, value, isDefault, onChange}: 
    {radioName: string, value: string, isDefault?: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void}
) => {
    const formId = useId();

    return <div className="field-row">
        <input 
            id={formId}
            type="radio"
            name={radioName}
            defaultChecked={isDefault ?? false}
            {...{onChange}}
        />
        <label htmlFor={formId}>{value}</label>
    </div>
}

export const RadioGroup = (
    {name, options, setState}: 
    {name: string, options: {value: string, isDefault?: boolean}[], setState: (s: string) => void}
) => {

    const getOnChange = useMemo(() => (value: string) => () => {
        setState(value);
    }, [setState]);

    return <fieldset className="fieldWithDropdown" data-testid={getTestId(name)}>
        <legend>{name}</legend>
        {options.map(({value, isDefault}) => (
            <RadioBtn 
                radioName={name}
                onChange={getOnChange(value)}
                key={value}
                {...{value, isDefault}}
            />
        ))}
    </fieldset>
}
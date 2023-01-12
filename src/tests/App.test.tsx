import {render, screen, fireEvent, within} from '@testing-library/react';
import App from '../App';
import { getEta, getMeasurements } from '../Utilities';

type ConfigValue =  { 
    unit: string, 
    value: string,
};

type Config = { 
    totalSize: ConfigValue,
    speed: ConfigValue,
    downloadedSoFar: ConfigValue,
    base: number,
    expectedEta: string
};

const getBitsFromUnit = (unitName: string, base: number) => {
    const measurements = getMeasurements(base);
    for (const { name, bits } of measurements){
        if (unitName === name){
            return bits;
        }
    }
    throw Error(`Can't find measurement name: ${unitName}`);
} // getMeasurements is tested in ./Utilities.tests.ts

const getBits = ({unit, value}: ConfigValue, base: number) => {
    const unitName = unit.split(/[/ ]/g)[0];
    return getBitsFromUnit(unitName, base) * parseFloat(value);
}

const setConfig = async ({totalSize, downloadedSoFar, speed, base}: Config) => {

    // total size
    const totalSizeDiv = screen.getByTestId('totalsize');

    const totalSizeInput = within(totalSizeDiv).getByLabelText('Amount')!;
    fireEvent.change(totalSizeInput, {target: {value: totalSize.value}});

    const totalSizeUnit = within(totalSizeDiv).getByLabelText('Unit')!;
    fireEvent.change(totalSizeUnit, {target: {value: totalSize.unit}});

    // downloaded already
    const downloadedAlreadyDiv = screen.getByTestId('downloadedalready');

    const downloadedAlreadyInput = within(downloadedAlreadyDiv).getByLabelText('Amount')!;
    fireEvent.change(downloadedAlreadyInput, {target: {value: downloadedSoFar.value}});

    const downloadedAlreadyUnit = within(downloadedAlreadyDiv).getByLabelText('Unit')!;
    fireEvent.change(downloadedAlreadyUnit, {target: {value: downloadedSoFar.unit}});

    // speed
    const speedDiv = screen.getByTestId('speed');

    const speedInput = within(speedDiv).getByLabelText('Amount')!;
    fireEvent.change(speedInput, {target: {value: speed.value}});

    const speedUnit = within(speedDiv).getByLabelText('Unit')!;
    fireEvent.change(speedUnit, {target: {value: speed.unit}});

    // base
    const baseDiv = screen.getByTestId('base');
    const radioBtn = within(baseDiv).getByLabelText(base.toString())!;
    fireEvent.click(radioBtn);

    await new Promise(process.nextTick);
}

describe('test ETA', () => {
    test.each([
        { 
            totalSize: { unit: 'gigabyte (GB)', value: '1.2' },
            speed: { unit: 'megabyte/sec (MB/s)', value: '8' },
            downloadedSoFar: { unit: 'kilobyte (KB)', value: '520000' },
            base: 2
        },
        { 
            totalSize: { unit: 'gigabyte (GB)', value: '1.5' },
            speed: { unit: 'megabyte/sec (MB/s)', value: '20' },
            downloadedSoFar: { unit: 'kilobyte (KB)', value: '500000' },
            base: 10
        },
    ].map(({ totalSize, downloadedSoFar, speed, base }) => ({
        totalSize,
        downloadedSoFar,
        speed,
        base, 
        expectedEta: getEta(
            getBits(totalSize, base),
            getBits(downloadedSoFar, base),
            getBits(speed, base)
        )
    })))(
        'size = $totalSize.value $totalSize.unit, speed = $speed.value $speed.unit, downloaded = $downloadedSoFar.value $downloadedSoFar.unit, base = $base => ETA = $expectedEta',
        async (config: Config) => {
            render(<App/>);
            await setConfig(config);
            const actualEta = screen.getByTestId('eta').textContent;
            expect(actualEta).toBe(config.expectedEta);
        }
    );
})

import { getEta, getMeasurements } from '../Utilities';

describe('getMeasurements()', () => {
    describe.each([
        {
            base: 2, 
            tests: [
                {name: 'gigabyte', bits: 8589934592},
                {name: 'megabit', bits: 1048576},
                {name: 'kilobyte', bits: 8192}
            ]
        }, 
        {
            base: 10, 
            tests: [
                {name: 'gigabyte', bits: 8*(10**9)},
                {name: 'megabit', bits: 10**6},
                {name: 'kilobyte', bits: 8000}
            ]
        }
    ])
    ('Base: %j', ({base, tests}: {base: number, tests: { name: string, bits: number }[]}) => {
        const measurements = getMeasurements(base);

        test.each(tests)('$name = $bits bits', ({name, bits: expectedBits}) => {
            const actualBits = measurements.filter(({ name: measureName }) => measureName === name)[0].bits;
            expect(expectedBits).toBe(actualBits);
        });
    });
});

describe('getEta()', () => {
    const minuteInSeconds = 60;
    const hourInSeconds = minuteInSeconds * 60;
    const dayInSeconds = hourInSeconds * 24;

    test('should give ETA for an even divide with all times', () => {
        const expectedEta = '1 day, 3 hrs, 10 mins, 42 secs';
        const downloadedSoFar = 123456;
        const speed = 5936000;
        const etaInSeconds = dayInSeconds + (hourInSeconds*3) + (minuteInSeconds*10) + 42;
        const totalSize = (etaInSeconds)*speed + downloadedSoFar;

        const actualEta = getEta(totalSize, downloadedSoFar, speed);
        expect(actualEta).toBe(expectedEta);
    });

    test('should give ETA for an even divide with some times', () => {
        const expectedEta = '3 days, 43 mins, 9 secs';
        const downloadedSoFar = 123456;
        const speed = 5936000;
        const etaInSeconds = (dayInSeconds*3) + (minuteInSeconds*43) + 9;
        const totalSize = (etaInSeconds)*speed + downloadedSoFar;

        const actualEta = getEta(totalSize, downloadedSoFar, speed);
        expect(actualEta).toBe(expectedEta);
    });

    test('should give ETA with seconds rounded up for uneven divide', () => {
        const downloadedSoFar = 0;
        const speed = 2;
        const totalSize = 3; 
        // technically should take 1.5 seconds
        const expectedEta = '2 secs';

        const actualEta = getEta(totalSize, downloadedSoFar, speed);
        expect(actualEta).toBe(expectedEta);
    });

    test('should give ETA with seconds rounded up for fractional values', () => {
        const downloadedSoFar = 0;
        const speed = 1;
        const etaInSeconds = (minuteInSeconds*17) + 13;
        const totalSize = etaInSeconds + 0.2; 
        const expectedEta = '17 mins, 14 secs';

        const actualEta = getEta(totalSize, downloadedSoFar, speed);
        expect(actualEta).toBe(expectedEta);
    });

    describe('return empty string for invalid values', () => {
        test('should return empty string if speed is zero', () => {
            const actualEta = getEta(100, 10, 0);
            expect(actualEta).toBe('');
        });
        test('should return empty string if remaining is non-positive', () => {
            const actualEta = getEta(10, 100, 1);
            expect(actualEta).toBe('');
        });
    });
});

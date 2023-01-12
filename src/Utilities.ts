interface Measurement {
    name: string;
    abreviation: string;
    bits: number;
}

enum Base {
    TWO = 2,
    TEN = 10
}

const getMultiplier = (base: Base) => {
    switch(base){
        case 2:
            return 1024;
        case 10:
        default:
            return 1000;
    }
}

const prefixNames = [
    'kilo',
    'mega',
    'giga',
    'tera',
    'peta'
];

export const getMeasurements = (base: Base): Measurement[] => {
    const multiplier = getMultiplier(base);
    const measurements: Measurement[] = [];

    for (let i=0; i<prefixNames.length; i++){
        const prefixName = prefixNames[i];
        const abreviation = prefixName[0].toUpperCase();

        const bits = multiplier**(i+1);
        const bytes = bits*8;

        measurements.push({
            name: prefixName + "bit", 
            abreviation: abreviation + "b", 
            bits
        });
        measurements.push({
            name: prefixName + "byte", 
            abreviation: abreviation + "B", 
            bits: bytes
        });
    }

    return measurements;
}

export const getDateStr = (seconds: number) => {
    
    const deltaDate = new Date(0);
    deltaDate.setUTCSeconds(seconds);
    const epoch = new Date(0);

    const dateMethods: {method: (d: Date) => number, name: string}[] = [
        {
            method: (date) => date.getUTCFullYear(),
            name: 'year'
        },
        {
            method: (date) => date.getUTCMonth(),
            name: 'month'
        },
        {
            method: (date) => date.getUTCDate(),
            name: 'day'
        },
        {
            method: (date) => date.getUTCHours(),
            name: 'hr'
        },
        {
            method: (date) => date.getUTCMinutes(),
            name: 'min'
        },
        {
            method: (date) => date.getUTCSeconds(),
            name: 'sec'
        }
    ];

    const msgs = []

    for (const {method, name} of dateMethods){
        const diff = method(deltaDate) - method(epoch);
        if (diff === 1) {
            msgs.push(`${diff} ${name}`);
        } else if (1 < diff) {
            msgs.push(`${diff} ${name}s`);
        }
    }
    return msgs.join(', ');
}

export const getSpeedOptions = (measurements: Measurement[]) => measurements.map(
    ({name, abreviation, bits}) => ({ 
        displayName: `${name}/sec (${abreviation}/s)`, 
        value: bits, 
        isDefault: name==="kilobyte"
    })
);

export const getTotalSizeOptions = (measurements: Measurement[]) => measurements.map(
    ({name, abreviation, bits}) => ({ 
      displayName: `${name} (${abreviation})`,
      value: bits,
      isDefault: name==="gigabyte" 
    })
);

export const getDownloadedOptions = (measurements: Measurement[]) => measurements.map(
    ({name, bits, abreviation}) => ({ 
      displayName: `${name} (${abreviation})`,
      value: bits,
      isDefault: name==="megabyte" 
    })
);

export const getEta = (totalSize: number, downloadedSoFar: number, speed: number) => {
    const remainingSize = totalSize - downloadedSoFar;
    if (0 < speed && 0 < remainingSize){
        const seconds = Math.ceil(remainingSize/speed);
        return getDateStr(seconds);
      } else {
        return '';
      }
}

export const getTestId = (name: string) => name.replace(/ /g, '').toLowerCase();
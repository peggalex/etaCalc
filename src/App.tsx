import React, { useEffect, useMemo, useState } from 'react';
import './styles/App.css';
import { NumberWithUnit } from './components/numberWithUnit';
import { getDownloadedOptions, getEta, getMeasurements, getSpeedOptions, getTotalSizeOptions } from './Utilities';
import '7.css';
import html2canvas from 'html2canvas';
import { RadioGroup } from './components/radioGroup';

let isDragging = false;

const getWindowDiv = () => document.querySelector('.window') as HTMLElement;

const paint = (left: number, top: number) => {
  const windowDiv = getWindowDiv();
 html2canvas(windowDiv).then(function(canvas) {
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    windowDiv.before(canvas);
  });
};

const addDragEvent = ({clientX, clientY}: {clientX: number, clientY: number}, index=0) => {
  document.addEventListener(
    "mousemove", 
    (e) => dragging(e, clientX, clientY, index), 
    {once : true}
  );
}

const startDragging = (e: React.DragEvent<HTMLDivElement>) => {
  isDragging = true;      
  addDragEvent(e, 0);
};

const moveWindowDiv = (windowDiv: HTMLElement, dx: number, dy: number) => {
  const { left: styleLeftRaw, top: styleTopRaw } = (windowDiv as HTMLElement).style; 
  const [styleLeft, styleTop] = [styleLeftRaw, styleTopRaw].map(s => parseInt(s) || 0);

  const windowLeft = styleLeft + dx;
  const windowTop = styleTop + dy;
  
  windowDiv.style.left = `${windowLeft}px`;
  windowDiv.style.top = `${windowTop}px`;
}

const paintFromWindowDiv = (windowDiv: HTMLElement, dx: number, dy: number) => {

  const { left: divLeft, top: divTop } = windowDiv.getBoundingClientRect();

  const paintLeft = divLeft + dx;
  const paintTop = divTop + dy;

  paint(paintLeft, paintTop);
}

const dragging = (
  {clientX, clientY}: MouseEvent, 
  oldClientX: number,
  oldClientY: number,
  index: number = 0
) => {
  if (!isDragging){
    return;
  }
  const dx = clientX - oldClientX;
  const dy = clientY - oldClientY;

  const windowDiv = getWindowDiv();
  moveWindowDiv(windowDiv, dx, dy);

  if (index % 10 === 0){
    paintFromWindowDiv(windowDiv, dx, dy);
  }

  setTimeout(() => {
    addDragEvent({clientX, clientY}, index+1)
  }, 10);
}

const endDragging = () => {
  isDragging = false;
}

export function App() {
  const [base, setBase] = useState(10);

  const [speed, setSpeed] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [downloadedSoFar, setDownloadedSoFar] = useState(0);

  const [speedValidMsg, setSpeedValidMsg] = useState<string | null>(null);
  const [totalSizeValidMsg, setTotalSizeValidMsg] = useState<string | null>(null);
  const [downloadSoFarValidMsg, setDownloadSoFarValidMsg] = useState<string | null>(null);

  useEffect(() => {
    setSpeedValidMsg(speed <= 0 ? 'Speed must be positive' : null);
  }, [speed, setSpeedValidMsg]);


  useEffect(() => {
    let tmpTotalSizeValidMsg: string | null = null;
    if (speed <= 0){
      tmpTotalSizeValidMsg = 'Total size must be positive';
    }
    if (totalSize < downloadedSoFar){
      tmpTotalSizeValidMsg = 'Total size must be greater than or equal to downloaded so far';
    }
    setTotalSizeValidMsg(tmpTotalSizeValidMsg);
  }, [downloadedSoFar, speed, totalSize]);
  

  useEffect(() => {
    let tmpDownloadSoFarValidMsg: string | null = null;
    if (speed <= 0){
      tmpDownloadSoFarValidMsg = 'Downloaded so far must be non-negative';
    }
    if (totalSize < downloadedSoFar){
      tmpDownloadSoFarValidMsg = 'Downloaded so far must be less than or equal to total size';
    }
    setDownloadSoFarValidMsg(tmpDownloadSoFarValidMsg);
  }, [downloadedSoFar, speed, totalSize]);

  const percentDownloaded = useMemo(() => {
    if (totalSize === 0){
      return 0;
    }
    return Math.ceil(100*downloadedSoFar/(totalSize))
  }, [totalSize, downloadedSoFar]);

  const eta = useMemo(
    () => getEta(totalSize, downloadedSoFar, speed), 
    [downloadedSoFar, speed, totalSize]
  );

  const measurements = useMemo(() => getMeasurements(base), [base]);

  const speedOptions = useMemo(() => getSpeedOptions(measurements), [measurements]);
  const downloadedOptions = useMemo(() => getDownloadedOptions(measurements),[measurements]);
  const totalSizeOptions = useMemo(() => getTotalSizeOptions(measurements), [measurements]);

  useEffect(() => {
    document.onmouseup = endDragging;
  }, []);

  return <>
    <div className="activateWindows">
      <p>Activate Windows</p>
      <p>Go to Setting to activate Windows.</p>
    </div>
    <div className="window active">
      <div className="title-bar" onMouseDown={startDragging}>
        <div className="title-bar-text">ETA Calculator</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Restore"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body windowContent">
        <div className="row">
          <NumberWithUnit 
            name="Total size" 
            placeholder="1.5" 
            options={totalSizeOptions} 
            setState={setTotalSize}
            validationMsg={totalSizeValidMsg}
          />
          <NumberWithUnit 
            name="Downloaded already" 
            placeholder="256" 
            options={downloadedOptions} 
            setState={setDownloadedSoFar} 
            defaultValue={0}
            validationMsg={downloadSoFarValidMsg}
          />
        </div>
        <div className="row">
          <NumberWithUnit 
            name="Speed" 
            placeholder="512" 
            options={speedOptions} 
            setState={setSpeed}
            validationMsg={speedValidMsg}
          />
          <RadioGroup 
            name="Base" 
            options={[{value: '2'}, {value: '10', isDefault: true}]} 
            setState={(s: string) => setBase(parseInt(s))}
          />
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentDownloaded}>
          <div style={{width: `${percentDownloaded}%`}}></div>
        </div>
      </div>
        <div className="status-bar">
          <p className="status-bar-field">Percent Downloaded: {percentDownloaded}%</p>
          <p className="status-bar-field">ETA: <span data-testid='eta'>{eta || '--'}</span></p>
        </div>
    </div>
  </>
}

export default App;

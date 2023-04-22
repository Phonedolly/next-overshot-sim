import Image from 'next/image'
import { Outfit } from 'next/font/google'
import Graph from '@/components/graph'
import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { setConfig } from 'next/config'

const outfit = Outfit({ subsets: ['latin'] })

const REDUCE_RATE = 1;
const X_AMPLIFY_FACTOR = 600;
const DIFF_X = 0.53;

const INIT_VARS = {
  endTime: 5.00,
  deltaT: 0.001,
  dur: 0.01,
  inPoint: 1.00,
  startVar: 450,
  endVar: 545,
  freq: 7,
  decay: 3
}

export default function Home() {
  const [config, setConfig] = React.useState(INIT_VARS);
  const [graph, setGraph] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  function RunButton(props) {
    return (
      <motion.button
        className='text-white font-bold text-2xl w-48 bg-neutral-700 py-3 px-4 rounded-full'
        whileHover={{ scale: 1.1, transition: { duration: 0.25, } }} whileTap={{ scale: 1.00, transition: { duration: 0.05, ease: 'linear' } }} onClick={() => setConfig({ ...config, ...INIT_VARS })}

      >Reset All!</motion.button>
    )
  }

  useEffect(() => {
    function drawGraph() {
      const { endTime, deltaT, dur, inPoint, startVar, endVar, freq, decay } = config;
      let howToMove = [];
      let time = 0.00;

      let t = time - inPoint;
      /* draw at t < dur */
      for (; t <= dur; time += deltaT, t = time - inPoint) {
        const progress = (time / dur);
        howToMove.push([time * DIFF_X * X_AMPLIFY_FACTOR, (1200 - (easeInOutSine(progress) * (endVar - startVar)) + startVar)])
      }

      /* draw at time <=3.0 */
      for (; time <= endTime; time += deltaT, t = time - inPoint) {
        const amp = ((endVar - startVar) / dur);
        const w = freq * Math.PI
        const dst = -((endVar) + amp * (Math.sin((t - dur) * w) / Math.exp(decay * (t - dur)) / w));
        howToMove.push([time * DIFF_X * X_AMPLIFY_FACTOR, dst])
      }

      let pathStr = `M ${howToMove[0][0]} ${howToMove[0][1]} `;
      const points = [];
      for (let i = 1; i < howToMove.length - 2; i++) {
        pathStr += `Q ${howToMove[i + 1][0]} ${howToMove[i + 1][1]} ${howToMove[i + 2][0]} ${howToMove[i + 2][1]} `
        if (i % 10 == 0) {
          const point = <circle className='point' cx={howToMove[i + 1][0]} cy={howToMove[i + 1][1]} r={5} fill='transparent'></circle>
          points.push(point);
        }
      }
      const graph =
        <motion.svg className='p-1' viewBox={`150 ${-endVar * 2} 1600 1200`} fill='transparent'>
          <path d={pathStr} stroke='white' strokeWidth="10"></path>
        </motion.svg>
      return graph
    }
    console.log(1)
    setGraph(drawGraph());
  }, [refreshKey, config])
  function ten(){
    return "from-10%"
  }
  function ten1(){
    return "via-10%"
  }
  return (
    <main
      className={`flex flex-col items-center justify-between  min-h-screen p-24 ${outfit.className} bg-[hsl(0,0%,10%)]`}
    >
      <h1 className='text-5xl font-bold text-white'>
        After Effect Overshoot Expression Simulator
      </h1>
      <div className="flex flex-col gap-10 w-full max-w-[90vw] lg:max-w-[80vw] items-center justify-between text-sm lg:flex">
        {graph}
        <div className='grid grid-cols-2 justify-center items-center w-9/12 gap-5'>
          <div className='flex flex-col gap-3'>
            <label className='whitespace-nowrap text-white'><strong>End time: </strong>{config.endTime}s</label>
            <input type='range' min='0.00' max='5.00' step='0.0001' onChange={(e) => setConfig({ ...config, endTime: parseFloat(e.target.value) })} className='w-full' value={config.endTime} />
            <ResetButton handler={() => setConfig({ ...config, endTime: 5.00 })} />
          </div>
          <div className='flex flex-col gap-3'>
            <label className='whitespace-nowrap text-white'><strong>deltaT: </strong>{config.deltaT}s</label>
            <input type='range' min='0.001' max='1' step='0.0001' onChange={(e) => setConfig({ ...config, deltaT: parseFloat(e.target.value) })} className='w-full' value={config.deltaT} />
            <ResetButton handler={() => setConfig({ ...config, deltaT: 0.001 })} />
          </div>
          <div className='flex flex-col gap-3'>
            <div><label className='whitespace-nowrap text-white'><strong>dur: </strong>{config.dur}s</label></div>
            <input type='range' min='0.001' max='0.2' step='0.00001' onChange={(e) => setConfig({ ...config, dur: parseFloat(e.target.value) })} className='w-full' value={config.dur} />
            <ResetButton handler={() => setConfig({ ...config, dur: 0.01 })} />
          </div>
          <div className='flex flex-col gap-3'>
            <div><label className='whitespace-nowrap text-white'><strong>inPoint: </strong>{config.inPoint}s</label></div>
            <input type='range' min='0.001' max={config.endTime} step='0.0001' onChange={(e) => setConfig({ ...config, inPoint: parseFloat(e.target.value) })} className={`w-full bg-transparent appearance-none m-2 h-1 rounded-full  accent-neutral-100 cursor-pointer bg-gradient-to-r from-pink-500 ${ten()} via-neutral-700 ${ten1()} to-neutral-700 to-100% `} value={config.inPoint} />
            <ResetButton handler={() => setConfig({ ...config, inPoint: 1.00 })} />
          </div>
        </div>
        <RunButton />
      </div>
    </main>
  )
}

function ResetButton(props) {
  return (
    <motion.button className='text-white font-bold text-md w-32 bg-neutral-700 py-3 px-4 rounded-full' onClick={props.handler}
      whileHover={{ scale: 1.03, transition: { duration: 0.3, } }} whileTap={{ scale: 1.00, transition: { duration: 0.05, ease: 'linear' } }}
    >Reset</motion.button>
  )
}

import React from 'react'

import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar'

import 'react-circular-progressbar/dist/styles.css'

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100

  return (
    <div className="h-20 w-20">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        strokeWidth={8}
        styles={buildStyles({
          textSize: '24px',
          textColor: '#e45b7a',
          pathColor: '#10b981',
          trailColor: '#e5e7eb',
          strokeLinecap: 'round'
        })}
      />
    </div>
  )
}

export default Timer
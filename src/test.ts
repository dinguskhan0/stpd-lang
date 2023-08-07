import { readFileSync, watchFile } from 'fs'
import { evaluate, parse } from './index';
import { stdin } from 'process';

let running = false

function run() {
  running = true
  evaluate(parse(readFileSync('./randomnumber-min.stpd').toString())).then(exitCode => {
    console.log(`Program exited with code ${exitCode}. Press R to restart.`)
    running = false
  })
}

watchFile('./randomnumber-min.stpd', { interval: 10 }, () => {
  if (running) return
  console.log('File accessed: restarting...')
  run()
})

stdin.setRawMode(true)
stdin.on('data', (data) => {
  if (data.toString()[0]?.toLowerCase() === 'r') {
    if (!running) {
      console.log('Restarting...')
      run()
    }
  }
})

run()
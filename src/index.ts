import { stdout } from "process"

export type Instruction = { type: 'execute', value: CommandCode } | { type: 'input', value: number }

export enum CommandCode {
  EXIT = 0,

  SET_PTR_TO_INPUT = 10,
  ADD_INPUT_TO_PTR = 11,
  MOVE_PTR = 12,
  SET_INPUT_TO_PTR = 13,
  PTR_RANDI = 14,
  ADD_SHIFTED_TO_PTR = 15,
  FLIP_PTR_SIGN = 16,

  SET_PTR_TO_INDEX = 20,
  SET_INDEX_TO_PTR = 21,
  SKIP_IF_EQUAL = 22,
  SKIP_INPUT_TIMES = 23,
  SKIP_IF_NEGATIVE = 24,

  PRINT_CHARACTER = 30,
  PRINT_NUMBER = 31,
  GET_CHAR = 32,
}

export function parse (code: string): Instruction[] {
  const parsed: Instruction[] = []

  const filteredCode = code.replace(/[^!@#$>]/g, '')

  let acc = 0
  let sign = 1
  let num = []

  for (const char of filteredCode) {
    if (char === '#') {
      if (acc === 0) sign = 1
      acc += 1 * sign
      continue
    }
    if (char === '$') {
      if (acc === 0) sign = -1
      acc -= 1 * sign
      continue
    }
    if (char === '@') {
      num.push(acc)
      continue
    }
    if (char === '>') {
      num.push(acc)
      // console.log('set input to', parseInt(num.join('')) * sign)
      parsed.push({
        type: 'input',
        value: parseInt(num.join('')) * sign
      })
      acc = 0
      num = []
      continue
    }
    if (char === '!') {
      num.push(acc)
      // console.log('execute', parseInt(num.join('')) * sign)
      parsed.push({
        type: 'execute',
        value: parseInt(num.join('')) * sign
      })
      acc = 0
      num = []
      continue
    }
  }

  return parsed
}

export async function evaluate(instructions: Instruction[]) {
  const stack: { [ index: number ]: number } = { 0: 0 }
  let ptr_index = 0
  let input = 0
  let skips = 0

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]

    if (instruction.type === 'input') {
      input = instruction.value
    }
    if (instruction.type === 'execute') {
      if (skips > 0) {
        skips--
        input = 0
        continue
      }
      // console.log(input.toString().padStart(5, ' '),'>',CommandCode[instruction.value].padEnd(30, ' '), 'ptr[' + ptr_index + '] =', stack[ptr_index])
      switch (instruction.value) {
        case CommandCode.EXIT:
          return input;
        
        case CommandCode.SET_PTR_TO_INPUT:
          stack[ptr_index] = input
          break
        case CommandCode.ADD_INPUT_TO_PTR:
          stack[ptr_index] = (stack[ptr_index] || 0) + input
          break
        case CommandCode.MOVE_PTR:
          ptr_index += input
          break
        case CommandCode.SET_INPUT_TO_PTR:
          input = stack[ptr_index] || 0
          break
        case CommandCode.PTR_RANDI:
          stack[ptr_index] = Math.round(Math.random() * input)
          break
        case CommandCode.ADD_SHIFTED_TO_PTR:
          stack[ptr_index] = (stack[ptr_index] || 0) + (stack[ptr_index + input] || 0)
          break
        case CommandCode.FLIP_PTR_SIGN:
          stack[ptr_index] = (stack[ptr_index] || 0) * -1
          break

        case CommandCode.SET_PTR_TO_INDEX:
          stack[ptr_index] = i
          break
        case CommandCode.SET_INDEX_TO_PTR:
          i = stack[ptr_index]
          break
        case CommandCode.SKIP_IF_EQUAL:
          if ((stack[ptr_index] || 0) === input) skips = 1
          break
        case CommandCode.SKIP_INPUT_TIMES:
          skips += input
          break
        case CommandCode.SKIP_IF_NEGATIVE:
          if ((stack[ptr_index] || 0) < 0) skips = 1
          break

        case CommandCode.PRINT_CHARACTER:
          stdout.write(String.fromCodePoint(stack[ptr_index] || 0))
          break
        case CommandCode.PRINT_NUMBER:
          stdout.write(String(stack[ptr_index] || 0))
          break
        case CommandCode.GET_CHAR:
          process.stdin.setEncoding('utf8')
          process.stdin.setRawMode(true)
          await new Promise<void>(r => {
            process.stdin.once('data', (data) => {
              if (data.toString()[0] === '\r') {
                stack[ptr_index] = 10
                r()
                return
              }
              stack[ptr_index] = data.toString()[0].codePointAt(0) || 0
              r()
            })
          })
          break
      }
      if (instruction.value !== CommandCode.SET_INPUT_TO_PTR) {
        input = 0
      }
    }
  }
  return 0
}
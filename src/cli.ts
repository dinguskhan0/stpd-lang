#!/usr/bin/env node
import { program } from 'commander'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { evaluate, parse } from './index';

function generateNumberSequence (x: number): string {
  const digits = x.toString().split("").map(v => parseInt(v))
  if (x < 0) {
    digits.shift()
  }
  const sections = []

  for (let i = 0; i < digits.length; i++) {
    const diff = i === 0 ? digits[i] : digits[i] - digits[i - 1]
    if (diff > 0) {
      sections.push((x < 0 ? "$" : "#").repeat(diff))
    }
    else if (diff < 0) {
      sections.push((x < 0 ? "#" : "$").repeat(diff * -1))
    }
    else {
      sections.push('')
    }
  }

  return sections.join('@')
}

program
  .name('stpdc')
  .description('a CLI that can run stpd-lang. what more do you want from this description?')
  .version('1.3.3.7')

program.command('execute', { isDefault: true })
  .description('executes an stpd program')
  .argument('<path>', 'path of the file to execute')
  .action(async (path: string) => {
    if (!existsSync(path)) program.error(`file not found: "${path}"`)
    const code = readFileSync(path).toString()
    
    await evaluate(parse(code))
    process.exit()
  })

program.command('minify')
  .description('minifies an stpd program by removing all non-program characters')
  .argument('<path>', 'path of the file to be minified')
  .option('-o, --output <path>', 'path to output minified code. if unspecified, outputs to stdout')
  .action((path: string, options: { output: string | undefined }) =>  {
    if (!existsSync(path)) program.error(`file not found: "${path}"`)
    const code = readFileSync(path).toString()
    const filteredCode = code.replace(/[^!@#$>]/g, '')

    if (!options.output) console.log(filteredCode)
    else {
      writeFileSync(options.output, filteredCode)
    }
  })

program.command('generate')
  .description('helpers for generating stpd-lang code snippets such as character printing')
  .command('stdout <string>')
    .description('generates the commands to print <string>')
    .option('-r, --relative', 'uses relative offsets instead of absolute character codes, often shortening resulting code')
    .option('-m, --minified', 'minifies the result, removing whitespace and newlines')
    .action((str: string, options: { relative: boolean | undefined, minified: boolean | undefined }) => {
      let codePoints = str.split('').map(v => v.codePointAt(0) || 0)
      if (options.relative) {
        let last = 0
        codePoints = codePoints.map(c => {
          const r = c - last
          last = c
          return r
        })
      }

      const codePointSequences = codePoints.map(generateNumberSequence)
      const commands = codePointSequences.map((s, i) => {
        if (options.relative) {
          if (s.length === 0) {
            return '###@$$$!'
          }
          return `${s} > ${i === 0 ? '#@$!' : '#@!'} ###@$$$!`
        }
        return `${s} > #@$! ###@$$$!`
      })

      if (options.minified) {
        console.log(commands.map(command => command.replace(/\s/g, '')).join(''))
        return
      }
      console.log(commands.join('\n'))
    })
  .parent?.command('number <number>')
    .description('generates an stpd-lang formatted number from <number>')
    .action((num: number) => {
      if (!parseInt(num.toString())) program.error('invalid number!')
      console.log(generateNumberSequence(num))
    })

program.parse()
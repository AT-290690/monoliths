import { writeFileSync } from 'fs'
import {
  compileHtml,
  handleUnbalancedParens,
  interpredHtml,
  logErrorMessage,
  run,
} from './utils.js'

export const compile = (file, to, scripts) => {
  try {
    handleUnbalancedParens(file)
    const data = compileHtml(file, scripts)
    if (data) writeFileSync(to, data)
  } catch (err) {
    logErrorMessage(err.message)
  }
}

export const interpred = (file) => {
  try {
    handleUnbalancedParens(file)
    console.log(run(file))
  } catch (err) {
    logErrorMessage(err.message)
  }
}

export const interpredBrowser = (file, to) => {
  try {
    handleUnbalancedParens(file)
    const data = interpredHtml(file)
    if (data) writeFileSync(to, data)
  } catch (err) {
    logErrorMessage(err.message)
  }
}

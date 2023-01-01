import {
  compileHtml,
  handleUnbalancedParens,
  interpredHtml,
  run,
} from '../../language/misc/utils.js'

export const compile = (file, scripts, logErrorMessage) => {
  try {
    handleUnbalancedParens(file)
    return compileHtml(file, scripts)
  } catch (err) {
    logErrorMessage(err.message)
  }
}

export const interpred = (file, logErrorMessage) => {
  try {
    handleUnbalancedParens(file)
    return run(file)
  } catch (err) {
    logErrorMessage(err.message)
  }
}

export const interpredBrowser = (file, to, logErrorMessage) => {
  try {
    handleUnbalancedParens(file)
    return interpredHtml(file)
  } catch (err) {
    logErrorMessage(err.message)
  }
}

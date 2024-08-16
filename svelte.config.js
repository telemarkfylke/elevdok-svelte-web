import adapter from '@sveltejs/adapter-node'

const isMdWarning = (warning) => {
  // We assume that material design web is accessible by default - and supress warnings
  const lineToFind = `${warning.start.line}: `
  const warningLineStartsOnIndex = warning.frame.indexOf(lineToFind)
  const warningElement = warning.frame.substring(warningLineStartsOnIndex, warningLineStartsOnIndex + 80).replace(lineToFind, '')
  if (warningElement.includes('<md-')) { // If this is a material design web element
    return true // Asssume it's ok - its google after all (ohoh, that does not say so much)
  }
  return false
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  onwarn: (warning, handler) => {
    if (isMdWarning(warning)) return
    handler(warning)
  },
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter()
  }
}

export default config

import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MagicString from 'magic-string'
import { rolldown } from 'rolldown'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input = path.join(__dirname, 'input.js')
const outFileMeta = path.join(__dirname, 'out.meta.js')
const outFileMagic = path.join(__dirname, 'out.magic.js')

/**
 * @param {MagicString | import('rolldown').BindingMagicString} s
 * @param {string} code
 */
function applyEdits(s, code) {
  const fooDeclStart = code.indexOf('const Foo')
  const barDeclStart = code.indexOf('const Bar')

  // @ts-ignore
  s.prependLeft(fooDeclStart, 'export ')
  // @ts-ignore
  s.prependLeft(barDeclStart, 'export ')

  const exportStart = code.indexOf('export {')
  const exportEnd = code.indexOf('}', exportStart)
  const exportChunk = code.slice(exportStart, exportEnd)
  const matches = [...exportChunk.matchAll(/\bFoo\b|\bBar\b/g)]

  const firstSpecStart = exportStart + (matches[0].index ?? 0)
  const secondSpecStart = exportStart + (matches[1].index ?? 0)
  const firstSpecEnd = firstSpecStart + matches[0][0].length
  const secondSpecEnd = secondSpecStart + matches[1][0].length

  // @ts-ignore
  s.remove(firstSpecStart, secondSpecStart)
  // @ts-ignore
  s.remove(firstSpecEnd, secondSpecEnd)
}

/** @type {import('rolldown').Plugin} */
const pluginMeta = {
  name: 'meta-magicstring',
  renderChunk(code, chunk, outputOptions, meta) {
    assert(meta?.magicString, 'meta.magicString is missing')
    const s = meta.magicString
    applyEdits(s, code)
    return { code: s }
  },
}

/** @type {import('rolldown').Plugin} */
const pluginMagic = {
  name: 'js-magicstring',
  renderChunk(code) {
    const s = new MagicString(code)
    applyEdits(s, code)
    return { code: s.toString() }
  },
}

const bundleMeta = await rolldown({
  input,
  plugins: [pluginMeta],
  experimental: {
    nativeMagicString: true,
  },
})

const bundleMagic = await rolldown({
  input,
  plugins: [pluginMagic],
})

await bundleMeta.write({
  file: outFileMeta,
  format: 'es',
})

await bundleMagic.write({
  file: outFileMagic,
  format: 'es',
})

# Rolldown meta.magicString mismatch repro

This repro compares `meta.magicString` with `magic-string` when applying the **same edits in the same order**. It demonstrates a divergence in output.

## Run

```bash
pnpm install
pnpm run repro
```

## What it does

- Builds `input.js` twice with `rolldown`.
- Plugin A (`meta.magicString`) and Plugin B (`magic-string`) apply the **same edits**:
  - `prependLeft` on two declarations.
  - Removes two adjacent export-specifier ranges **in order** using original indices
- Writes two outputs for direct diff:
  - `out.meta.js` (meta.magicString)
  - `out.magic.js` (magic-string)

## Expected vs actual

Compare the two outputs:

```
out.meta.js:  export { Foo };
out.magic.js: export {  };
```

This indicates `meta.magicString` behaves differently from `magic-string` for the same sequence of operations.

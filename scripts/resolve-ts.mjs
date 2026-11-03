// Loaded by `npm test` (node --import). Lets node:test resolve extensionless
// relative imports to `.ts` files, the way Metro and tsc already do, so the
// source and test files need no `.ts` suffixes and tsconfig stays unchanged.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (err?.code === 'ERR_MODULE_NOT_FOUND' && /^\.{1,2}\//.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw err;
    }
  },
});

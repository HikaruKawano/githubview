import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

export default function createEmotionCache() {
  return createCache({ key: 'mui', prepend: true });
}

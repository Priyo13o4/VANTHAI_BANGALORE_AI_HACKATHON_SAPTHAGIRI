/**
 * src/utils/blur.ts
 * Driver.js blur overlay helpers.
 * CSS is in global.css — no inline styles.
 */

const BLUR_CLASS = 'vanthai-blur-active';

/** Apply full-page blur + dim. Chat widget excluded (fixed position, separate stacking context). */
export function applyPageBlur(): void {
  document.getElementById('page-blur-overlay')?.classList.add(BLUR_CLASS);
}

/** Remove page blur (called on popover dismiss or next user message). */
export function clearPageBlur(): void {
  document.getElementById('page-blur-overlay')?.classList.remove(BLUR_CLASS);
}

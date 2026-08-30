/**
 * Ref-counted body scroll lock.
 *
 * The mobile drawer and the "Message us" dialog can be open at the same time
 * (the dialog is triggered from inside the drawer). Each setting
 * `body.style.overflow` directly means whichever closes first releases the
 * lock the other still needs, so the page scrolls behind an open overlay.
 * Counting them fixes that without either overlay knowing about the other.
 */
let locks = 0;

export function lockBodyScroll(): () => void {
  locks += 1;
  document.body.style.overflow = 'hidden';

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.body.style.overflow = '';
  };
}

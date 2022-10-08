/* eslint prefer-rest-params: 0 */
/* eslint no-prototype-builtins: 0 */
// this is injected inline into pages in order for text truncation to work
// before the app is bootstrapped
import { MaxLinesHelper } from './max-lines.helper';
import { FontColor, ReadMore } from './text.types';

// this effectively disables the inline script in IE11 as the polyfills need to
// first be loaded (and we don't want to inline them).
if (Element.prototype.hasOwnProperty('replaceWith')) {
  const originalContent: string[][] = [];
  const loadMaxLines = () => {
    Array.prototype.slice
      .call(document.querySelectorAll('fl-text[data-max-lines]'))
      .forEach((el: HTMLElement, elIndex) => {
        if (!el.children[0]) {
          return;
        }
        const button = el.children[0].querySelector('button.ReadMoreButton');
        if (!button) {
          // First time we've truncated: save the original content
          originalContent[elIndex] = [];
          Array.prototype.slice
            .call(el.children[0].childNodes)
            .forEach((node, nodeIndex) => {
              if (node.nodeType === Node.TEXT_NODE) {
                originalContent[elIndex][nodeIndex] = node.textContent || '';
              }
            });
        } else if (originalContent[elIndex]?.length) {
          // We've truncated this text before (eg. pre vs. post font load)
          // There's original content that we can use to retruncate
          el.children[0].removeChild(button);
          Array.prototype.slice
            .call(el.children[0].childNodes)
            .forEach((node, nodeIndex) => {
              if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = originalContent[elIndex][nodeIndex];
              }
            });
        }
        const readMoreStyle =
          el.getAttribute('data-read-more') ?? ReadMore.NONE;
        const fontColor = el.getAttribute('data-read-color') ?? FontColor.DARK;
        new MaxLinesHelper(el.children[0] as HTMLElement).truncate(
          parseInt(el.getAttribute('data-max-lines') as string, 10),
          ReadMore[readMoreStyle.toUpperCase() as keyof typeof ReadMore],
          FontColor[fontColor.toUpperCase() as keyof typeof FontColor],
        );
      });
  };

  // Immediately truncate text so the button is visible
  loadMaxLines();
  if ((document as any).fonts) {
    // After fonts load, truncate text again.
    (document as any).fonts.ready.then(() => {
      // If the app is bootstrapped, the app code will handle truncation.
      // Doing it twice can result in race-condition bugs, so let's not.
      if (!window.webapp?.applicationBootstrapped) {
        loadMaxLines();
      }
    });
  }
}

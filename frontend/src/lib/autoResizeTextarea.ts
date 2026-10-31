/** Adjust textarea height to content between min and max (px). */
export function syncTextareaHeight(
  el: HTMLTextAreaElement,
  minPx: number,
  maxPx: number,
): void {
  el.style.height = 'auto';
  const next = Math.min(maxPx, Math.max(minPx, el.scrollHeight));
  el.style.height = `${next}px`;
}

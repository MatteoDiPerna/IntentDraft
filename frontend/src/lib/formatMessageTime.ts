/** Short time for chat bubbles (locale from browser). */
export function formatMessageTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
      new Date(iso),
    );
  } catch {
    return '';
  }
}

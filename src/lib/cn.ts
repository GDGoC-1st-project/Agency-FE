/** className 합치기. false·null·undefined는 빠집니다. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

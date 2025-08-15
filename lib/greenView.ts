export function isGreenViewEnabled() {
  return (process.env.USE_GREEN_VIEW ?? '1') === '1';
}

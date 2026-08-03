export function formatPlateLabel(template: string, numeral: string, year: string): string {
  return template.replace('{{numeral}}', numeral).replace('{{year}}', year)
}

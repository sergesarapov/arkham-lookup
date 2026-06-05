export type Side = string | null;

export interface ArkhamCard {
  code: string;
  name: string;
  type_name: string;
  traits: string | null;
  text: string | null;
  flavor: string | null;
  pack_name: string;
  faction_name: string;
  imagesrc?: string | null;
  backimagesrc?: string | null;
  double_sided?: boolean;
  back_name?: string | null;
  back_text?: string | null;
  back_flavor?: string | null;
}

export interface ArkhamPack {
  code: string;
  name: string;
  cycle_code: string;
  cycle_position: number;
  position: number;
}

export const CYCLE_POSITION_TO_CODE: Record<number, string> = {
  1:  'core',
  2:  'dwl',
  3:  'ptc',
  4:  'tfa',
  5:  'tcu',
  6:  'tde',
  7:  'tic',
  8:  'eoe',
  9:  'tsk',
  10: 'fhv',
  11: 'tdc',
  50: 'rtt',
};

export const CYCLE_PREFIX_MAP: Record<string, string> = {
  core: '01',
  dwl:  '02',
  ptc:  '03',
  tfa:  '04',
  tcu:  '05',
  tde:  '06',
  tic:  '07',
  eoe:  '08',
  tsk:  '09',
  fhv:  '10',
  tdc:  '11',
};

export const CAMPAIGN_PACK_CODES = new Set([
  'core',  'rcore',
  'dwl',
  'ptc',
  'tfa',
  'tcu',
  'tde',
  'tic',
  'eoec',
  'tskc',
  'fhvc',
  'tdcc',
  'rtnotz',
  'rtdwl',
  'rtptc',
  'rttfa',
  'rttcu',
]);

export function packPrefix(pack: ArkhamPack): string | undefined {
  if (pack.cycle_code === 'rtt') {
    return String(pack.cycle_position + pack.position - 1).padStart(2, '0');
  }
  return CYCLE_PREFIX_MAP[pack.cycle_code];
}

// Campaign expansions for split-box cycles start their card codes at 501, not 001.
const CAMPAIGN_EXPANSION_CODES = new Set(['eoec', 'tskc', 'fhvc', 'tdcc']);

export function packCardOffset(pack: ArkhamPack): number {
  return CAMPAIGN_EXPANSION_CODES.has(pack.code) ? 500 : 0;
}

export const RETURN_TO_PARENT_CYCLE: Record<string, string> = {
  rtnotz: 'core',
  rtdwl:  'dwl',
  rtptc:  'ptc',
  rttfa:  'tfa',
  rttcu:  'tcu',
};

export const CYCLE_DISPLAY_NAMES: Record<string, string> = {
  core: 'Core Set',
  dwl:  'The Dunwich Legacy',
  ptc:  'The Path to Carcosa',
  tfa:  'The Forgotten Age',
  tcu:  'The Circle Undone',
  tde:  'The Dream-Eaters',
  tic:  'The Innsmouth Conspiracy',
  eoe:  'Edge of the Earth',
  tsk:  'The Scarlet Keys',
  fhv:  'Feast of Hemlock Vale',
  tdc:  'The Drowned City',
};

export interface ArkhamCard {
  code: string;
  name: string;
  type_name: string;
  traits: string | null;
  text: string | null;
  flavor: string | null;
  pack_name: string;
  faction_name: string;
  double_sided?: boolean;
  back_name?: string | null;
  back_text?: string | null;
  back_flavor?: string | null;
}

export interface ArkhamPack {
  code: string;
  name: string;
  cycle_code: string;
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

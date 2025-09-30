export interface HPPart {
  'Model'?: string;
  'Processor Family'?: string;
  'Processor'?: string;
  'Memory'?: string;
  'Memory Type'?: string;
  'Internal Drive'?: string;
  'Display'?: string;
  'Graphics'?: string;
  'External I/O Ports'?: string;
  'Weight'?: string;
  'Warranty'?: string;
  'Screen Replacement Part # (Common)'?: string;
  'Battery Replacement Part # (Common)'?: string;
}

export interface SupplyChainEntry {
  'Model Series'?: string;
  'Model'?: string;
  'Generation'?: string | number;
  'Typical Final Assembly Location(s)'?: string;
  'Primary Assembly Partners (ODMs)'?: string;
  'Notes & Context'?: string;
}

export interface MapDef {
  id: string;
  name: string;
  subtitle?: string;
  src: string;
}

export interface MapsRender {
  renderEmbedded: () => void;
  renderGrid: () => void;
  renderThumbnails: () => void;
  openMapModal: (map: MapDef) => void;
  closeMapModal: () => void;
}

declare global {
  // augment the globalThis so modules can access these without casting to any
  var __announceLive: ((m: string) => void) | undefined;
  var __mapsRender: MapsRender | undefined;
}

export {};

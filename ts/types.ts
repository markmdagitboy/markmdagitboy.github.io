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
  [key: string]: any;
}

export interface SupplyChainEntry {
  'Model Series'?: string;
  'Model'?: string;
  'Generation'?: string | number;
  'Typical Final Assembly Location(s)'?: string;
  'Primary Assembly Partners (ODMs)'?: string;
  'Notes & Context'?: string;
  [key: string]: any;
}

export interface MapDef {
  id: string;
  name: string;
  subtitle?: string;
  src: string;
}

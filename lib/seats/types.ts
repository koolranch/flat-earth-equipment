export type SeatSection = 'assemblies' | 'cushions';

export type SeatProductType =
  | 'assembly'
  | 'cushion_back'
  | 'cushion_bottom'
  | 'cushion_set'
  | 'cushion_single';

export interface SeatDimensions {
  h_in?: number;
  w_in?: number;
  d_in?: number;
  length_in?: number;
  width_in?: number;
  thickness_in?: number;
}

export interface ParsedSeatRow {
  oem_part_number: string;
  brand: string;
  section: SeatSection;
  product_type: SeatProductType;
  compatible_models: string[];
  dimensions?: SeatDimensions;
  material?: 'Vinyl' | 'Fabric';
  has_seat_adjusters?: boolean;
  has_seat_switch?: boolean;
  replacement_back_cushion?: string;
  replacement_bottom_cushion?: string;
  cushion_description?: string;
}

export interface SeatProductRecord extends ParsedSeatRow {
  sku: string;
  slug: string;
  name: string;
  category: 'Seats' | 'Seat cushions';
  category_slug: 'seats' | 'seat-cushions';
  description: string;
  related_oem_parts: string[];
}

export interface EquipmentModelIndexEntry {
  brand: string;
  model: string;
  slug: string;
  assembly_oem_parts: string[];
  cushion_oem_parts: string[];
}

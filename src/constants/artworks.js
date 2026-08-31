/* ==========================================================================
   HOME & AWAY — EXHIBITION ARTWORK & AUCTION DATA CONFIGURATION
   ========================================================================== */

import artwork1 from '../assets/artworks/artwork_1.jpg';
import artwork2 from '../assets/artworks/artwork_2.jpg';
import artwork3 from '../assets/artworks/artwork_3.jpg';
import artwork4 from '../assets/artworks/artwork_4.jpg';

export const GALLERY_HEADER = {
  sectionLabel: 'EXHIBITION CATALOGUE & AUCTION',
  sectionTitle: 'CURATED SCULPTURES & LIVE LOTS',
  subtitle: 'IN PRIVATE PREVIEW FOR THE NOVEMBER 2026 LAGOS INAUGURAL EDITION. SUBMIT SILENT AUCTION BIDS DIRECTLY BELOW.',
};

export const ARTWORKS = [
  {
    id: 'artwork-01',
    lotNumber: 'LOT 01',
    title: 'KNOT OF RETURN',
    artist: 'ADEOLA NWABUEZE',
    year: '2026',
    medium: 'Cast Bronze & Raw Mineral Concrete',
    dimensions: '145 × 92 × 80 cm',
    image: artwork1,
    curatorialNote:
      'An intricate continuous bronze loop symbolizing the non-linear trajectories of diaspora movement, grounded upon a heavy mineral concrete pedestal.',
    estimate: '$18,000 – $24,000 USD',
    currentBid: 21500,
    bidCount: 7,
    status: 'LIVE BIDDING OPEN',
    minIncrement: 500,
  },
  {
    id: 'artwork-02',
    lotNumber: 'LOT 02',
    title: 'ANCESTRAL STACK I',
    artist: 'TUNDE OGUNLESI',
    year: '2025',
    medium: 'Hand-carved Terracotta & Black Smoke Ceramic',
    dimensions: '180 × 55 × 55 cm',
    image: artwork2,
    curatorialNote:
      'Stacking traditional vessel forms into an elongated vertical totem, bridging ancient West African ceramic methods with modern minimalist geometry.',
    estimate: '$12,000 – $16,000 USD',
    currentBid: 14000,
    bidCount: 5,
    status: 'LIVE BIDDING OPEN',
    minIncrement: 500,
  },
  {
    id: 'artwork-03',
    lotNumber: 'LOT 03',
    title: 'ETHEREAL CURVE',
    artist: 'YEJIDE OLANIYAN',
    year: '2026',
    medium: 'Polished Obsidian & Satin Brushed Brass',
    dimensions: '120 × 65 × 45 cm',
    image: artwork3,
    curatorialNote:
      'Harmonizing light and shadow through dual-textured ribbon forms, exploring spatial belonging between Lagos and London.',
    estimate: '$25,000 – $32,000 USD',
    currentBid: 28500,
    bidCount: 11,
    status: 'LIVE BIDDING OPEN',
    minIncrement: 1000,
  },
  {
    id: 'artwork-04',
    lotNumber: 'LOT 04',
    title: 'MEMORY GRID (DELTA)',
    artist: 'CHIDI AMADI',
    year: '2025',
    medium: 'Carved Ebony Wood & Hand-woven Copper Mesh',
    dimensions: '160 × 210 × 25 cm',
    image: artwork4,
    curatorialNote:
      'A monumental wall relief mapping industrial topographies and ecological memory across tactile timber facets and metallic weave.',
    estimate: '$30,000 – $40,000 USD',
    currentBid: 34000,
    bidCount: 9,
    status: 'LIVE BIDDING OPEN',
    minIncrement: 1000,
  },
];

export default ARTWORKS;

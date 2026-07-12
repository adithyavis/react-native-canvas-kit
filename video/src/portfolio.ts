export type PortfolioItem = {
  id: string;
  label: string;
  accent: string;
  ratio: number;
  source: string;
  image: boolean;
};

export const portfolio: PortfolioItem[] = [
  {
    id: 'instagram',
    label: 'Instagram Stories',
    accent: '#a855f7',
    ratio: 1.7,
    source: 'instagram.png',
    image: false,
  },
  {
    id: 'canva',
    label: 'Canva board',
    accent: '#38bdf8',
    ratio: 0.68,
    source: 'canva.png',
    image: false,
  },
  {
    id: 'gpay',
    label: 'Google Pay scratch',
    accent: '#34d399',
    ratio: 1.5,
    source: 'google-pay.png',
    image: false,
  },
  {
    id: 'snapseed',
    label: 'Snapseed',
    accent: '#f59e0b',
    ratio: 1.2,
    source: 'snapseed.png',
    image: false,
  },
  {
    id: 'reactflow',
    label: 'React Flow',
    accent: '#22d3ee',
    ratio: 0.7,
    source: 'react-flow.png',
    image: false,
  },
  {
    id: 'photo',
    label: 'Photo editor',
    accent: '#ff2d87',
    ratio: 1.3,
    source: 'photo-editor.png',
    image: false,
  },
];

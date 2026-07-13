export type PortfolioItem = {
  id: string;
  label: string;
  source: string;
  clipSeconds: number;
  ratio: number;
};

export const portfolio: PortfolioItem[] = [
  {
    id: 'instagram',
    label: 'Instagram crop',
    source: 'instagram_crop.mp4',
    clipSeconds: 5.85,
    ratio: 1.5,
  },
  {
    id: 'canva',
    label: 'Canva board',
    source: 'canva.mp4',
    clipSeconds: 4.37,
    ratio: 1.3,
  },
  {
    id: 'gpay',
    label: 'Google Pay scratch',
    source: 'gpay_scratch_card.mp4',
    clipSeconds: 3.23,
    ratio: 1.6,
  },
  {
    id: 'snapseed',
    label: 'Snapseed',
    source: 'snapseed.mp4',
    clipSeconds: 7.85,
    ratio: 1.35,
  },
  {
    id: 'docusign',
    label: 'Docusign',
    source: 'docusign.mp4',
    clipSeconds: 5.53,
    ratio: 1.45,
  },
];

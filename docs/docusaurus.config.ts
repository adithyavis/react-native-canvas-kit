import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'React Native Canvas Kit',
  tagline: 'A Skia-powered 2D scene-graph canvas for React Native',

  url: 'https://adithyavis.github.io',
  baseUrl: '/react-native-canvas-kit/',

  organizationName: 'adithyavis',
  projectName: 'react-native-canvas-kit',

  favicon: 'img/favicon.svg',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/adithyavis/react-native-canvas-kit/tree/main/docs/',
          lastVersion: 'current',
          versions: {
            'current': {
              label: '1.x (Reanimated 4)',
            },
            '0.x': {
              label: '0.x (Reanimated 3)',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Canvas Kit',
      logo: {
        alt: 'React Native Canvas Kit logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/adithyavis/react-native-canvas-kit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/intro' },
            { label: 'Installation', to: '/getting-started/installation' },
            { label: 'Quick Start', to: '/getting-started/quick-start' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Shapes', to: '/shapes/overview' },
            { label: 'Transformer', to: '/interactivity/transformer' },
            { label: 'Brushes', to: '/brushes/overview' },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/adithyavis/react-native-canvas-kit',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} React Native Canvas Kit.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

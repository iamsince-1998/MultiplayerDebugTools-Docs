// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MultiplayerDebugTools',
  tagline: 'Documentation for Unreal Engine plugins',
  favicon: 'img/logo.svg',

  url: 'https://iamsince-1998.github.io',
  baseUrl: '/MultiplayerDebugTools-Docs/',

  organizationName: 'iamsince-1998',
  projectName: 'MultiplayerDebugTools-Docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/iamsince-1998/MultiplayerDebugTools-Docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Plugins Docs',
        logo: {
          alt: 'Plugins Docs Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://store.steampowered.com/app/3621560/IndianOps/',
            label: 'IndianOps on Steam',
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
              { label: 'Introduction', to: '/' },
              { label: 'MultiplayerDebugTools', to: '/multiplayer-debug-tools/overview' },
            ],
          },
          {
            title: 'Connect',
            items: [
              { label: 'Fab Seller Page', href: 'https://www.fab.com/sellers/iamsince1998' },
              { label: 'Discord', href: 'https://discord.gg/vxn4gadpwC' },
              { label: 'Email', href: 'mailto:contact2iamsince1998@gmail.com' },
              { label: 'YouTube', href: 'https://www.youtube.com/@iamsince1998' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/iamsince1998' },
              { label: 'IndianOps on Steam', href: 'https://store.steampowered.com/app/3621560/IndianOps/' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Plugins Docs. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'python', 'typescript', 'csharp'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;

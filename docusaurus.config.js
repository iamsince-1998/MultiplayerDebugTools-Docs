// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

const repoFromEnv = process.env.GITHUB_REPOSITORY?.split('/')[1];
const repoName = repoFromEnv || 'MultiplayerDebugTools-Docs';
const baseUrlFromEnv = process.env.DOCS_BASE_URL;
const siteBaseUrl = baseUrlFromEnv || `/${repoName}/`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Plugins Docs',
  tagline: 'Documentation for Unreal Engine plugins',
  favicon: 'img/logo.svg',

  // GitHub Pages URL — update these with your GitHub username and repo name
  url: 'https://iamsince-1998.github.io',
  baseUrl: '/Plugins-Docs/',

  // GitHub Pages deployment config
  organizationName: 'iamsince-1998', // Your GitHub username
  projectName: 'MultiplayerDebugTools-Docs',                   // Your GitHub repo name
  // GitHub Pages serves folder-based routes more reliably than `.html` routes.
  // Keeping trailing slashes enabled prevents deep-link 404s on refresh.
  trailingSlash: true,

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
          routeBasePath: '/',  // Docs at root, no /docs prefix
          editUrl: 'https://github.com/iamsince-1998/MultiplayerDebugTools-Docs/edit/main/',
        },
        blog: false, // Disable blog
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
              { label: 'Replicated Containers', to: '/replicated-containers/overview' },
            ],
          },
          {
            title: 'Connect',
            items: [
              {
                label: 'Fab Seller Page',
                href: 'https://www.fab.com/sellers/iamsince1998',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/vxn4gadpwC',
              },
              {
                label: 'Email',
                href: 'mailto:contact2iamsince1998@gmail.com',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@iamsince1998',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/iamsince1998',
              },
              {
                label: 'yt - @iamsince1998',
                href: 'https://www.youtube.com/@iamsince1998',
              },
              {
                label: 'IndianOps on Steam',
                href: 'https://store.steampowered.com/app/3621560/IndianOps/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Plugins Docs. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'python', 'typescript'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;

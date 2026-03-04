/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '🏠 Home',
    },
    {
      type: 'category',
      label: 'MultiplayerDebugTools',
      collapsed: false,
      items: ['multiplayer-debug-tools/overview'],
    },
  ],
};

module.exports = sidebars;

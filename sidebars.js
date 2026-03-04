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
      label: 'Replicated Containers',
      collapsed: false,
      items: [
        'replicated-containers/overview',
        'replicated-containers/installation',
        'replicated-containers/quickstart-blueprint',
        'replicated-containers/quickstart-cpp',
        'replicated-containers/api-reference',
        'replicated-containers/how-it-works',
        'replicated-containers/dedicated-server',
        'replicated-containers/rules-and-gotchas',
        'replicated-containers/troubleshooting',
        'replicated-containers/changelog',
      ],
    },
  ],
};

module.exports = sidebars;

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-url': {
      url: (asset) => {
        // Rewrite asset paths to be relative to css/bundle.css
        if (asset.url.includes('../../assets/fonts') || asset.url.includes('../fonts')) {
          return asset.url.replace('../../assets/fonts', '../assets/fonts').replace('../fonts', '../assets/fonts');
        }
        // Handle paths from packages/design-system
        if (asset.url.includes('../../../assets/fonts')) {
          return asset.url.replace('../../../assets/fonts', '../assets/fonts');
        }
        return asset.url;
      },
    },
  },
};

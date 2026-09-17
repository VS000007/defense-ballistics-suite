const ghpages = require('gh-pages');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const repoUrl = process.env.GH_REPO_URL || 'https://github.com/VS000007/defense-ballistics-suite.git';

console.log('Publishing dist to gh-pages branch...');
ghpages.publish(distPath, {
  repo: repoUrl,
  branch: 'gh-pages',
  dotfiles: true,
  user: {
    name: 'VS000007',
    email: 'dev@defense.local'
  }
}, function(err) {
  if (err) {
    console.error('Publish error:', err);
    process.exit(1);
  } else {
    console.log('Successfully published to gh-pages!');
    process.exit(0);
  }
});

export default {
  helmet: true,
  copy: [
    `assets/icons/**.*`,
  ],
  isomorphic: {
    cwd: 'src',
    bootstrap: 'bootstrap.js',
    entries: [
      'components/*.js',
      'routes/index.js'
    ]
  },
}

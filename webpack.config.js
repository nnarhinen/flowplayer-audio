module.exports = {
  entry: './lib/engine.js',
  output: {
    path: __dirname + '/dist',
    filename: 'flowplayer.engine.audio.js'
  },
  resolve: {
    alias: {
      fs: 'empty/object'
    }
  }
};

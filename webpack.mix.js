const mix = require('laravel-mix');
const vueConfig = require('./vue.config.js');
const path = require('path');
let webpackConfig = vueConfig.configureWebpack;

webpackConfig.resolve.alias['@'] = path.resolve(__dirname, 'src');
webpackConfig.externals = { 'vue': 'Vue' };

mix.webpackConfig(webpackConfig).setPublicPath('public')
  .js('resources/js/index.js', 'js')
  .js('resources/js/initialLoad.js', 'js')
  .copy('dist/img', 'public/js/img');
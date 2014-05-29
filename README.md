[![Build Status](https://travis-ci.org/TargetProcess/screen-capture-extension.svg?branch=master)](https://travis-ci.org/TargetProcess/screen-capture-extension)

# Screen Capture Extension

Capture and annotate screenshots and create entities in your Targetprocess account.

## Installation

### Testing

Install from `release` folder as described here https://developer.chrome.com/extensions/getstarted#unpacked

### Development

```sh
$ npm install
$ bower install
$ gulp # dev mode, http://localhost:8080
$ gulp release # release mode, works locally release/index.html, generate .zip file in release-compressed/ folder
$ rm -rf node_modules/gulp-svgmin/node_modules/svgo # use patched svgo
```

Make sure to have no fallen tests before commit:

```sh
$ npm test
```

## Contributors

Aliaksei Shytkin, Vladimir Petriko, Alex Tsayun


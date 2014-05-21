# Targetprocess Chrome Extension

Capture screenshot and create entity for OnDemand account.

## Installation

### Testing

Install from `release` folder as described here https://developer.chrome.com/extensions/getstarted#unpacked

### Development

```sh
$ npm install
$ bower install
$ gulp # dev mode, http://localhost:8080
$ gulp release # release mode, works locally release/index.html
$ rm -rf node_modules/gulp-svgmin/node_modules/svgo # use patched svgo
```

Make sure to have no fallen tests before commit:

```sh
$ npm test
```

## Contributors

Aliaksei Shytkin, Vladimir Petriko, Alex Tsayun

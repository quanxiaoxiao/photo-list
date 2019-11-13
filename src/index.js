const fileType = require('file-type');
const sizeOf = require('image-size');
const path = require('path');
const fp = require('lodash/fp');
const fs = require('fs');

const getFilePaths = (pathname) => {
  const stats = fs.statSync(pathname);
  if (stats.isFile()) {
    return [pathname];
  }
  const list = fs.readdirSync(pathname);
  const len = list.length;
  const result = [];
  for (let i = 0; i < len; i++) {
    const file = list[i];
    result.push(...getFilePaths(path.join(pathname, file)));
  }
  return result;
};

const getPhotos = (filePaths) => {
  const len = filePaths.length;
  const result = [];
  for (let i = 0; i < len; i++) {
    const filePathItem = filePaths[i];
    const buf = fs.readFileSync(filePathItem);
    const type = fileType(buf.slice(0, Math.min(fileType.minimumBytes, buf.length)));
    if (type && /^image\/.+/.test(type.mime)) {
      const dimensions = sizeOf(filePathItem);
      result.push({
        pathname: filePathItem,
        width: dimensions.width,
        height: dimensions.height,
        mime: type.mime,
      });
    }
  }

  return result;
};

module.exports = (pathname) => fp.compose(
  getPhotos,
  getFilePaths,
)(pathname);

const DataUriParser = require('datauri/parser');
const path = require('path');

const getPhotoUri = (photo) => {
  const parser = new DataUriParser();
  const extName = path.extname(photo.originalname).toString();
  return parser.format(extName, photo.buffer);
}
const getImageGalleryUri = (image) => {
  const parser = new DataUriParser();
  const extName = path.extname(image.originalname).toString();
  return parser.format(extName, image.buffer);
}

const getCertificateUri = (certificate) => {
  const parser = new DataUriParser();
  const extName = path.extname(certificate.originalname).toString();
  return parser.format(extName, certificate.buffer);
}

module.exports = { getPhotoUri, getCertificateUri, getImageGalleryUri };

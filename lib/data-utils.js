module.exports = {
  customKeyArray2Object: function (array, key) {
    if (Array.isArray(array)) {
      let out = {}
      array.forEach(function (item) {
        out[item[key]] = item
      })
      return out
    }
    return array
  },
  validateExtension: function (file, ext) {
    return file.split('.').pop() === ext
  }
}

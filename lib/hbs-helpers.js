const moment = require('moment')

exports.helpers = {
  isEqual: function (v1, v2, options) {
    if (v1 === v2) return options.fn(this)
    return options.inverse(this)
  },
  contains: function (haystack, needle, options) {
    if (haystack.match(needle) !== null) return options.fn(this)
    return options.inverse(this)
  },
  defaultVal: (value, safeValue) => value || safeValue,
  log: function (value) {
    console.log(JSON.stringify(value))
    return value
  },
  isChecked: function (v1, v2) {
    if (v1 === v2) return 'checked'
    return ''
  },
  isSelected: function (v1, v2) {
    if (v1 === v2) return 'selected'
    return ''
  },
  modOf: function (index, mod, block) {
    if (parseInt(index) % (mod) === 0) return block.fn(this)
    else return block.inverse(this)
  },
  time: (time, options) => moment(time).format('Do MMMM YYYY') + options.fn(time),
  getYoutubeEmbedUrl: url => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2] && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}?rel=0}`
    else return ''
  }
}

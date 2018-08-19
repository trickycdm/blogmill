const moment = require('moment')
const dataUtils = require('data-utils')

exports.helpers = {
  isEqual: function (v1, v2, options) {
    if (v1 === v2) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  contains: function (haystack, needle, options) {
    if (haystack.match(needle) !== null) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  defaultVal: function (value, safeValue) {
    return value || safeValue
  },
  log: function (value) {
    console.log(JSON.stringify(value))
    return value
  },
  isChecked: function (v1, v2) {
    if (v1 === v2) { // dont === as the object id will be a string
      return 'checked'
    } else {
      return ''
    }
  },
  isSelected: function (v1, v2) {
    if (v1 === v2) { // dont === as the object id will be a string
      return 'selected'
    } else {
      return ''
    }
  },
  getAuthorName: function (id, users) {
    users = dataUtils.customKeyArray2Object(users, '_id')
    // return users[ id ].realname;
  },
  trimText: function (text, maxLength) {
    if (text) {
      var ret = text
      if (ret.length > maxLength) {
        ret = ret.substr(0, maxLength - 3) + '…'
      }
    }
    return ret
  },
  modOf: function (index, mod, block) {
    if (parseInt(index) % (mod) === 0) {
      return block.fn(this)
    } else {
      return block.inverse(this)
    }
  },
  time: (time, options) => {
    return moment(time).format('Do MMMM YYYY') + options.fn(time)
  },
  getYoutubeEmbedUrl: url => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    let match = url.match(regExp)
    if (match && match[2] && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}?rel=0}`
    else return ''
  }
}

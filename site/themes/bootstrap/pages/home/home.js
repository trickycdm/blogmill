const bm = require('bm')

exports.express = async (req, res) => {
  try {
    const td = await bm.getHomepage()
    td.carouselImages = [td.header_image_1, td.header_image_2, td.header_image_3]
    res.render('home/home', td)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

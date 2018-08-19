exports.express = async (req, res) => {
  try {
    const td = await _db.findOne('about', {})
    res.render('about/about', td)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

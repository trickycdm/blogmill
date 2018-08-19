exports.express = async (req, res) => {
  try {
    const td = {
      page: await _db.find('contactpage', {})
    }
    res.render('contact/contact', td)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

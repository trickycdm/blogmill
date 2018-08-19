exports.express = async (req, res) => {
  try {
    const td = {
      services: await _db.find('services', {}),
      page: await _db.find('servicespage', {})
    }
    res.render('services/services', td)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

exports.express = async (req, res) => {
  try {
    res.render('home/home')
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

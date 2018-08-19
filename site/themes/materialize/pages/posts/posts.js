const bm = require('bm')
exports.express = async (req, res) => {
  try {
    const td = {
      posts: await bm.getAllPosts(),
      page: await _db.find('postspage', {})
    }
    for (let post of td.posts) post.authorName = (await bm.getAuthorById(post.author_id)).real_name
    res.render('posts/posts', td)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

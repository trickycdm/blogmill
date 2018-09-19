exports.model = {
  blogListing1: {
    articles: [
      {href: 'airing-your-colors', cat: 'tech', img: '/site/public/img/article-1.jpg', alt: 'image', heading: 'Love lives on!', excerpt: 'really interesting excerpt'},
      {href: 'airing-your-colors', cat: 'junk', img: '/site/public/img/article-2.jpg', alt: 'image', heading: 'Some Things are out of your Control', excerpt: 'really interesting excerpt'},
      {href: 'airing-your-colors', cat: 'stuff', img: '/site/public/img/article-3.jpg', alt: 'image', heading: 'Airing your colors', excerpt: 'really interesting excerpt'}
    ]
  }
}

// this also uses a custom hbs helper to alternate the layout
exports.helpers = {
  modOf: function (index, mod, block) {
    if (parseInt(index) % (mod) === 0) {
      return block.fn(this)
    } else {
      return block.inverse(this)
    }
  }
}

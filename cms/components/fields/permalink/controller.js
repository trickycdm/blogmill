exports.preFieldRender = async (value, req = false) => `${req.protocol}://${req.get('host')}/${(req.originalUrl.indexOf('posts') !== -1 ? 'posts/' : '')}${value}`

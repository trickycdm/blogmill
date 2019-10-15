const schemaPath = `${ROOT}/cms/schemas`
const schema = {
  pages: [
    require(`${schemaPath}/config`).schema,
    require(`${schemaPath}/footer`).schema,
    require(`${schemaPath}/page-home`).schema,
    require(`${schemaPath}/page-posts`).schema,
    require(`${schemaPath}/posts`).schema,
    require(`${schemaPath}/post-categories`).schema,
    require(`${schemaPath}/page-post`).schema,
    require(`${schemaPath}/media`).schema,
    require(`${schemaPath}/users`).schema
  ]
}

module.exports = schema

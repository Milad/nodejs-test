const Joi = require('@hapi/joi')

const bookSchema = Joi.object().keys({
  id: Joi.number(),
  title: Joi.string().max(255).required(),
  release_date: Joi.date().required(),
  author: Joi.string().max(255).required(),
  description: Joi.string(),
  image: Joi.string()
})

module.exports = {
  bookSchema
}

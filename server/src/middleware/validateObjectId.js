import mongoose from 'mongoose'
import { HttpError } from './errorHandler.js'

export function validateObjectId(parameter = 'id') {
  return (request, _response, next) => {
    if (!mongoose.isValidObjectId(request.params[parameter])) {
      next(new HttpError(400, 'The requested ID is not valid.'))
      return
    }
    next()
  }
}

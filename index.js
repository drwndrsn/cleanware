const cleanware = (filters = {}) => {

    const middleware = (req,res,next) => {
        let bodyKeys = Object.keys(req.body)
        req.clean = req.clean || {}

        bodyKeys.forEach((input) => {
            if (filters[input]) { // if there's a filter for the input
                let result = req.body[input] // before transformations

                if (filters[input].every((transformation) => {
                    return result = transformation(result)
                })) {
                    req.clean[input] = result
                } else {
                    next(Error(`invalid ${input}`))
                }
            } else { // no filters specified
                req.clean[input] = req.body[input] // so it just passes through
            }
        })
        return next()
    }
    return middleware
}

module.exports = cleanware
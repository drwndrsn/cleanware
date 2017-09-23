const cleanware = (obj = {}) => {

    const middleware = (req,res,next) => {
        let bodyKeys = Object.keys(req.body)

        bodyKeys.forEach((e) => {
            if (obj[e]) {
                let result = req.body[e]

                if (obj[e].every((transformation) => {
                    return transformation(result)
                })) {
                    req.clean[e] = result
                } else {
                    next(Error(`invalid ${e}`))
                }
            } else { // no filter specified
                req.clean[e] = req.body[e] // so it just passes through
            }
        }
    }
    return middleware
}

module.exports = cleanware
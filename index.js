const cleanware = (filters = {}) => {

    const middleware = (req,res,next) => {
        req.unfiltered = req.unfiltered || []

        function clean (obj) {
            (Object.keys(obj)).forEach((input) => {
                if (typeof obj[input] === 'object') {
                    clean(obj[input])
                } else {
                    let filterKey = input
                    filterKey = input.split('_')[0] // pull filter from filter_inputName

                    if (filters[filterKey]) { // if there's a filter for the input
                        let result = obj[input], // before transformations
                            currentTransformation = 0

                        if (filters[filterKey].every((transformation, i) => {
                            currentTransformation = i
                            return result = transformation(result)
                        })) {
                            obj[input] = result
                        } else {
                            next(Error(`invalid ${input} at transformation ${currentTransformation + 1}`))
                        }
                    } else { // no filters specified
                        req.unfiltered.push(input) // keep track of which inputs passed through
                    }
                }
            })
        }
        clean(req.body)
        return next()
    }
    return middleware
}

module.exports = cleanware
const cleanware = (filters = {}) => {

    const middleware = (req,res,next) => {
        req.unfiltered = req.unfiltered || []
        let error = null

        function clean (obj) {
            (Object.keys(obj)).forEach((input) => {
                if (typeof obj[input] === 'object') {
                    clean(obj[input])
                } else {
                    let filterKey = input
                    // pull filter from filter_inputName
                    filterKey = input.split('_')[0] 
                    
                    // if there's a matching filter and the input is not empty 
                    if (filters[filterKey] && obj[input]) { 
                        // starting state before transformations
                        let result = obj[input], 
                            currentTransformation = 0

                        if (filters[filterKey].every((transformation, i) => {
                            currentTransformation = i
                            return result = transformation(result)
                        })) {
                            obj[input] = result
                        } else {
                            return error = Error(`invalid ${input} at transformation ${currentTransformation + 1}`)
                        }
                    } else {
                        // keep track of which inputs passed through
                        req.unfiltered.push(input) 
                    }
                }
            })
        }
        clean(req.body)
        return error ? next(error) : next()
    }
    return middleware
}

module.exports = cleanware
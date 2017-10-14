/**
 * Cleanware accepts a collection of filters to be applied on inputs.  Each filter is expected to be an array
 * of one or more functions that transform or sanitize an associated input.  Which filter is applied on
 * a particular input is determined by its naming convention: name_firstName would match the filter
 * with a key of "name", phone_business would match the filter "phone".
 * 
 * @param {Object} [filters={}] 
 * @returns {Function}
 */
const cleanware = (filters = {}) => {

    const middleware = (req,res,next) => {
        req.unfiltered = req.unfiltered || []
        let error = null

        /**
         * Named iife recursively applies the filters, mutating the object (req.body) passed by reference.
         * 
         * @param {Object} obj
         */
        ;(function clean (obj) {
            (Object.keys(obj)).forEach((input) => {
                if (typeof obj[input] === 'object') {
                    clean(obj[input])
                } else {
                    let filterKey = input
                    // pull filter from filter_inputName
                    filterKey = input.split('_')[0] 
                    
                    // if there's a matching filter and the input is not empty 
                    if (filters[filterKey] && obj[input]) { 
                        // initial state before transformations
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
                        // if the filter wasn't specified in the input's name, assume it should be processed
                        // by the 'default' filter if one is defined in the filters collection.
                        // The default filter really should really only be a single replace function, not an array.
                        // Cleanware-defaults defines it as a function that strips most common unsafe characters.
                        filters['default'] ? obj[input] = filters['default'](obj[input]) : req.unfiltered.push(input) 
                    }
                }
            })
        })(req.body)
        return error ? next(error) : next()
    }
    return middleware
}

module.exports = cleanware
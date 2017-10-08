# cleanware
Express middleware for sanitizing and transforming input

```
npm install --save cleanware cleanware-defaults
```

The cleanware middleware is initialized with a filters collection, which is a an object containing named arrays of transformations

```javascript
cleanDefaults = require('cleanware-defaults')
cleanware = require('cleanware')(cleanDefaults)
// ...
app.post('/form', cleanware, function (req, res, next) {
  // ...
})
```

## example
[cleanware-defaults](https://github.com/drwndrsn/cleanware-defaults) contains a filter for processing a US phone number:

```javascript
    phone: [
        // remove all non-digits
        s => s.replace(/\D/g, ''),
        // strip a leading 1 
        s => s.length === 11 ? s.replace(/^1/,'') : s,
        // make sure the result is 10 digits or fail
        s => s.length === 10 ? s : 0
    ]
```
The transformation functions are applied in order.  So here it's removing all non-digits, removing a leading 1 if one exists, and validating that the result is an expected 10 digit phone number.  If any one of the transformations fail, an error will be routed to the Express error handler via next(e).

If a form were submitted via action="/form" containing an input like "phone_home" given a value of +1 (222) 555-6789, req.body.phone_home will be converted to just 2225556789.

For now cleanware does not check for whether an input is required or optional.  It skips on null or empty.

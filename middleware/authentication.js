const jwt = require('jsonwebtoken')

const isLoggedIn = (req, res, next) => {
    const token = req.cookies.jwt

    if(token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if(err){
                res.locals.user = null
                res.redirect('/login?status=tokenexpired')
            }else{
                res.locals.user = decodedToken
                console.log("Token Is :")
                console.log(decodedToken)
                next()
            }
        })        
    } else {
        res.locals.user = null
        res.redirect('/login?status=notlogin')
    }

}

module.exports = isLoggedIn
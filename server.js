const express = require('express')
const app = express()
const fs = require('fs')
const {uuid} = require('uuidv4')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require ('bcrypt')
const isLoggedIn = require('./middleware/authentication')
const PORT = 5000

app.set('view engine', 'ejs')
app.set('views', './public/views')

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cookieParser())

// CEK DATA USER MELALUI API MENGGUNAKAN POSTMAN
app.get('/api/user', (req, res) => {
    const data = fs.readFileSync('./data/users.json', 'utf-8')
    const readData = JSON.parse(data)
    res.status(200).json(readData)
})

//ROUTING KE LANDING PAGE LOCALHOST:3000
app.get('/', (req, res) => {
    const token = req.cookies.jwt

    jwt.verify(token, 'secret', (err, decodedToken) => {
        res.locals.user = decodedToken
    })

    res.render('index',{
        pageTitle: "Main",
        token
    })
})


// ROUTING KE HALAMAN GAME 
app.get('/game', isLoggedIn, (req, res) => {
    res.render('game',{
        pageTitle: "Rock Paper Scissors"
    })
})

//ROUTING KE HALAMAN SIGNUP 
app.get('/signup', (req, res) => {
    const data = fs.readFileSync('./data/users.json', 'utf-8')
    const readData = JSON.parse(data)
    res.render('signup',{
        pageTitle: "SIGNUP",
    })
})


//METHOD POST UNTUK SIGNUP USER BARU
app.post('/signup', async (req, res) => {    
    const {nama , email, password} = req.body
    const hashedPassword = await bcrypt.hash(password,10)
    const data = fs.readFileSync('./data/users.json', 'utf-8')
    const readData = JSON.parse(data)
    const newUser = {
        id: uuid(),
        nama,
        email,
        password: hashedPassword
    }
    readData.push(newUser)
    fs.writeFileSync('./data/users.json', JSON.stringify(readData, null, 4))
    res.redirect('/')
})


//ROUTING KE HALAMAN LOGIN
app.get('/login', (req, res) => {
    const status = req.query.status
    if(!status){
    res.render('login',{
        pageTitle: "LOGIN",
        status
        })        
    }else if(status=="emailnotfound"){
            res.render('login',{
                pageTitle: "LOGIN",
                message : "Email Not Found",
                status
                })  
    }else if(status=="passwordnotmatch"){
            res.render('login',{
                pageTitle: "LOGIN",
                message : "Wrong Password",
                status
                })  
    }else if(status=="notlogin"){
            res.render('login',{
                pageTitle: "LOGIN",
                message : "Please Login First",
                status
                })  
    }else if(status=="tokenexpired"){
        res.render('login',{
            pageTitle: "LOGIN",
            message : "Your Session is Expired, Please Login Again",
            status
            })  
    }else if(status=="editsuccsess"){
        res.render('login',{
            pageTitle: "LOGIN",
            message : "Your Account Has Been Edited, Please Login Again",
            status
            })  
        }else{
            res.render('login',{
                pageTitle: "LOGIN",
                message : "You are not logged in, please login to Start The Game",
                })   
        }
})


//METHOD POST UNTUK LOGIN USER
app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const data = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'))
    const findUser = await data.find((i) => i.email == email)      

    if(findUser){
        const validPassword = await bcrypt.compare(req.body.password, findUser.password)  
             
        if(validPassword){            
            const token = jwt.sign({
                username: findUser.nama,
                email : findUser.email,
                id: findUser.id
            }, 'secret', {
                expiresIn : 60*60*24
            })
            res.cookie('jwt', token, { maxAge:1000*60*60*24})
            res.redirect('/')
        }else{
            res.redirect('/login?status=passwordnotmatch')
        }
    }else{
        res.redirect('/login?status=emailnotfound')
    }
})

// ROUTING KE HALAMAN EDIT ACCOUNT
app.get('/edit', isLoggedIn, (req, res) => {
    const {id} = req.query
    const data = fs.readFileSync('./data/users.json', 'utf-8')
    const readData = JSON.parse(data)

    const dataFind = readData.find((i) => {
        return i.id == id
    })
    res.render('edit', {
        pageTitle: "Edit Account",
        dataFind
    })
})

// METHOD POST UNTUK EDIT DATA USER
app.post('/edit', async (req, res) => {
    const {id} = req.query
    const {nama , email, password} = req.body
    const hashedPassword = await bcrypt.hash(password,10)
    const data = fs.readFileSync('./data/users.json', 'utf-8')
    const readData = JSON.parse(data)

    const dataFind = readData.find((i) => {
        return i.id == id
    })
    const dataIndex = readData.findIndex((i) => {
        return i.id == id
    })

    const dataEdited = {
        id :id,
        nama: nama,
        email: email,
        password: (req.body.password == "") ? dataFind.password : hashedPassword
    }

    readData[dataIndex] = dataEdited
    fs.writeFileSync('./data/users.json', JSON.stringify(readData, null, 4))
    res.cookie('jwt', '', {maxAge:1})
    res.redirect('/login?status=editsuccsess')
})


// app.get('/logout', (req, res) => {
//     res.cookie('jwt', '', {maxAge:1})
//     res.redirect('/')
// })

//METHOD LOGOUT USER
app.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge:1})
    res.redirect('/login')
})


app.listen(PORT, () =>{
    console.log(`Server Running at PORT ${PORT}`)
})
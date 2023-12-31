const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//---to get the user count  here
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//----
//http://localhost:3000/api/v1/users
//------
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

//-----
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//----
//http://localhost:3000/api/v1/users/621329a9231b2e06579dd074
//-----
router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');//get everything accept password here
   //const user = await User.findById(req.params.id).select('name phone email');  //get only this items
    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})
//-----
//-----
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//---
//http://localhost:3000/api/v1/users
//-----
// {
//     "name":"akshay",
//     "email":"akshay1@gmail.com",
//     "password":"12345qwerty",
//     "phone":"8767997707",
//     "isAdmin": false,
//     "street": "banglore",
//     "apartment": "home",
//     "zip": "102010",
//     "city": "banglore",
//     "country": "India"

// }
router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})
//---to get the user count  here
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//----
//http://localhost:3000/api/v1/users/621329a9231b2e06579dd074

// {
//     "name":"akshay",
//     "email":"akshay1@gmail.com",
//     "password":"12345qwerty",
//     "phone":"8767997707111",
//     "isAdmin": false,
//     "street": "banglore",
//     "apartment": "home11",
//     "zip": "102010",
//     "city": "banglore",
//     "country": "India"

// }
router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//-----LOGIN
//---http://localhost:3000/api/v1/users/login
//-----data here
// {
//     "email":"akshay@gmail.com",
//     "password":"12345qwerty"
// }
router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({user: user.email , token: token}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})

//http://localhost:3000api/v1/users/register
//---DATA HERE
// {
//     "name":"akshay",
//     "email":"akshay@gmail.com",
//     "password":"12345qwerty",
//     "phone":"8767997707",
//     "isAdmin": false,
//     "street": "banglore",
//     "apartment": "home",
//     "zip": "102010",
//     "city": "banglore",
//     "country": "India"

// }
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})
//---to get the user count  here
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//http://localhost:3000api/v1/users/621329e6231b2e06579dd076
router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})


//---to get the user count  here
//---while getting the count make sure u are logged in as admin user
//---then set the token in the autherisation--->bearer token
//--http://localhost:3000/api/v1/users/get/count
router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})


module.exports =router;
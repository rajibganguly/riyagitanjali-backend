const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const Department = require('../models/department');
const yup = require('yup');
const { Timestamp } = require('mongodb');
const { sendRegistrationEmail } = require('../service/emailService');


/***
 * @description: REGISTER USER Function
 * @param: [email, password, name, role_type, phone_number]
 */
exports.registerUser = async function (req, res, next) {
    console.log('registerUser==========================', req.body);
    

    try {
        // Define schema for request body validation using Yup
        const schema = yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().required(),
            name: yup.string().required(),
            role_type: yup.string().required(),
            phone_number: yup.string(),
            blockflat: yup.string(),
            payment: yup.boolean()
        });

        // Validate request body against the schema
        await schema.validate(req.body);
        

        const { email, password, name, role_type, phone_number, blockflat } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).json({ statusTxt: "error", message: "User already registered with this email." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 5);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role_type,
            phone_number,
            blockflat,
            payment: false,
            timestamp: new Date().toISOString()
        });

        console.log('newUser==========================', newUser);
        // Save the new user to the database
        await newUser.save();        
        await sendRegistrationEmail(newUser?.email, newUser?.password, newUser?.phone_number, newUser?.name, newUser?.blockflat);

        // Generate a token for the user
        const tokenPayload = {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            role_type: newUser.role_type
        };

        const token = jwt.sign(tokenPayload, 'your_secret_key', { expiresIn: '1h' });
        return res.status(201).json({ statusTxt: "success", message: "Registration successful!", token, payment: newUser.payment });
        
    } catch (err) {
        // Yup validation error
        if (err.name === 'ValidationError') {
            return res.status(422).json({ statusTxt: "error", message: err.errors });
        }
        console.error(err);
        return res.status(500).json({ statusTxt: "error", message: "An error occurred while processing your request." });
    }
};


/***
 * @description: LOGIN USER Function
 * @param: [email, password, role_type]
 */
exports.loginUser = async function (req, res, next) {
    try {
        // Define schema for request body validation using Yup
        const schema = yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().required(),
            role_type: yup.string().required()
        });

        // Validate request body against the schema
        await schema.validate(req.body);

        const { email, password, role_type } = req.body;
        const user = await User.findOne({ email }).exec();

    
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                user.last_login = new Date();
                await user.save();

                const tokenPayload = {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role_type: user.role_type
                };
                

                const token = jwt.sign(tokenPayload, 'your_secret_key', { expiresIn: '1h' });
                
                return res.status(200).json({ statusTxt: "success", message: "Login successful!", token, payment: user.payment });
            } else {
                return res.status(401).json({ statusTxt: "error", message: "Wrong password!" }); // 401 for Unauthorized
            }
        } else {
            return res.status(404).json({ statusTxt: "error", message: "This Email Is not registered!" }); // 404 for Not Found
        }
    } catch (err) {
        // Yup validation error
        if (err.name === 'ValidationError') {
            return res.status(422).json({ statusTxt: "error", message: err.errors.join(', ') }); // 422 for Unprocessable Entity
        }
        console.error(err);
        return res.status(500).json({ statusTxt: "error", message: "An error occurred while processing your request." });
    }
};




// User Profile
exports.getProfile = async function (req, res, next) {
    console.log("profile");
    const userId = req.body.id; // Assuming the user ID is sent in the request body
    try {
        const data = await User.findById(userId);
        // console.log("data");
        console.log(data);
        if (!data) {
            return res.status(404).json({ statusTxt: "error", message: "User not found." });
        }
        const profileData = {
            name: data.name,
            email: data.email,
            role_type: data.role_type,
            dep_id: data.dep_id,
            phone_number: data.phone_number,
            designation: data.designation,
            photo: data.photo
        };
        res.json({ statusTxt: "success", message: "Profile retrieved successfully.", profileData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ statusTxt: "error", message: "An error occurred while processing your request." });
    }
};




// User Logout
exports.logoutUser = function (req, res, next) {
    console.log("logout")
    //localStorage.removeItem('token');
    // Clear session or token here
    res.redirect('/');
};


/***
 * @description: RESET PASSWORD USER Function
 * @param: [email, password, confirm_password]
 */
exports.resetPassword = async function (req, res, next) {
    const { confirm_password, password } = req.body;

    const email = req.query.email;

    if (password !== confirm_password) {
        return res.status(400).json({ statusTxt: "error", message: "Password doesnot matched." });
    }

    

    try {
        // Validate email
        if (!email) {
            return res.status(400).json({ statusTxt: "error", message: "Email is required." });
        }

        // Validate email format
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ statusTxt: "error", message: "Invalid email format." });
        }

        // Check if the email is registered
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ statusTxt: "error", message: "This Email Is not registered!" });
        } else {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 5);

            // Update password
            user.password = hashedPassword;
            await user.save();

            console.log('Success');
            return res.json({ statusTxt: "success", message: "Password changed!" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ statusTxt: "error", message: "An error occurred while processing your request." });
    }
};


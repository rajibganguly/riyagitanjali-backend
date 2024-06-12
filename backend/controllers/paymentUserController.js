const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const Payments = require('../models/payments');
const bcrypt = require('bcrypt');
const Department = require('../models/department');
const yup = require('yup');
const { Timestamp } = require('mongodb');


/***
 * @description: PAYMENTS SUCCESSFUL
 * @param: [email, userId, payment]
 */
exports.paymentDone = async function (req, res, next) {
    const { email, userPaymentId, userId, payFor } = req.body;
    const id = userId


    try {

        

        // Define schema for request body validation using Yup
        const schema = yup.object().shape({
            _id: yup.string(),
            email: yup.string().email().required(),
            userPaymentId: yup.string().required(),
            userId: yup.string().required(),
            payFor: yup.string().required()
        });

        // Validate request body against the schema
        const validData = await schema.validate(req.body, { abortEarly: false });   
        const { id } = validData.userId;
        const availUser = await User.findOne({ email, id }).exec()

        console.log(validData)

        if(!validData) {
            return res.status(404).json({ statusTxt: "Error", message: err.message });
        }

        if(!availUser) {
            return res.status(404).json({ statusTxt: "Error1", message: err.message });
        }

        // Create a new Payment
        const newPayment = new Payments({
            email,
            userPaymentId,
            userId,
            payFor,
            timestamp: new Date().toISOString()
        });

        if(availUser) {    
            // Save the new user to the database
            await Payments.updateOne(newPayment);        
            return res.status(201).json({ statusTxt: "success", message: "Payment successful!", data: validData });
        } else {
            return res.status(404).json({ statusTxt: "Error2", message: "Email not available" });
        }

        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ statusTxt: "Error3", message: err.message });
    }
};



    // catch (err) {
    //     // Yup validation error
    //     if (err.name === 'ValidationError') {
    //         return res.status(422).json({ statusTxt: "error", message: err.errors });
    //     }
    //     console.error(err);
    //     return res.status(500).json({ statusTxt: "error", message: "An error occurred while processing your request." });
    // }





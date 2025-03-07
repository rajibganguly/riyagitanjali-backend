const nodemailer = require('nodemailer');
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user');
const Task = require('../models/task');
const Meeting = require('../models/meeting');


// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.NOTIFICATION_EMAIL, // Your Gmail email address
//         pass: process.env.NOTIFICATION_EMAIL_PASSWORD // Your Gmail password
//     }
// });

// Function to send registration email
exports.sendRegistrationEmail = async (email, password, phone, name, blockflat) => {
    console.log('EMAILSERVICE===', email, password, phone, name, blockflat);
    let testAccount = await nodemailer.createTestAccount();
    

    // Create a transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass  // generated ethereal password
        }
    });
    
    try {
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RiyaGitanjali Mail</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0;padding: 0;font-family: 'Roboto', sans-serif; color: #2d2d2d; background-color: #F4F5FF; display: flex; justify-content: center;">
            <section style="background-color: #F4F5FF; display: flex; justify-content: center;">
                <div style="width: 80%; margin: 0 10%;">
                    <div style="background-color: #fff; padding: 32px; height: fit-content; border-radius: 4px; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; margin-top: 20px;">
                        <div style="margin-bottom: 30px;">
                            <div style="display: flex; align-items: center; column-gap: 2px; margin-left: -6px;">
                                <h1 style="color: rgb(10, 0, 119);">RiyaGitanjali</h1>
                            </div>
                        </div>
                        <div>
                            <p style="margin: 0 0 8px;">Dear Owner,</p>
                            <h2 style="margin-top: 0px;">Welcome to RiyaGitanjali!</h2>
                            <hr>
                            <p>You are added under the ${name} Owner. Your flat number is: ${blockflat}. Your phone number is: ${phone}.</p>
                            <p>Your registration was successful.</p>
                            <p><b>Email:</b> ${email}</p>
                            <p><b>Password:</b> ${password}</p>
                        </div>
                    </div>
                    <div style="background-color: transparent; padding: 10px 32px 48px; height: fit-content;">
                        
                        <p style="font-size: 11px;margin-top: 0;">You have received this email because you are registered at RiyaGitanjali, to ensure the implementation of our Terms of Service and (or) for other legitimate matters.</p>
                        <a style="font-size: 11px;color: rgb(103, 103, 103);" href="#">Privacy Policy</a>
                        <p style="font-size: 11px;">© 2024 RiyaGitanjali - Strictly confidential</p>
                    </div>
                </div>
            </section>
        </body>
        </html>
        `;

        let info = await transporter.sendMail({
            from: '"RiyaGitanjali" <rajibganguly@rediffmail.com>',
            to: email,
            subject: 'Admin message',
            html: htmlContent
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // console.log('Email sent: ', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Error sending email');
    }
};


// Function to send meeting added email
exports.sendMeetingAddedEmail = async (emails, meetingDetails, flag) => {
    try {
        if (emails && emails.length > 0) {
            const updateText = flag === 'update' ? 'Updated' : 'Added';
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Warcat Mail</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0;padding: 0;font-family: 'Roboto', sans-serif; color: #2d2d2d;">
                <section style="background-color: #F4F5FF; display: flex; justify-content: center;">
                    <div style="width: 80%; margin: 0 10%;">
                        <div style="background-color: #fff; padding: 32px; height: fit-content; border-radius: 4px;box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; margin-top: 20px;">
                            <div style="margin-bottom: 30px;">
                                <div style="display: flex; align-items: center; column-gap: 2px; margin-left: -6px;">
                                    <img src="https://develop.d1g0aga5817ond.amplifyapp.com/static/media/logo-dark-sm-removebg-preview.028e6f8b4a37ccf919cc.png" alt="" height="54px">
                                    <h1 style="color: rgb(10, 0, 119);">WARCAT</h1>
                                </div>
                            </div>
                            <div>
                                <p style="margin: 0 0 8px;">Dear User,</p>
                                <h2 style="margin-top: 0px;">Your meeting has been ${updateText} successfully.</h2>
                                <hr>
                                <p>Meeting Details:</p>
                                <b>
                                    <p>Topic: ${meetingDetails.meetingTopic}</p>
                                    <p>Date: ${meetingDetails.selectDate}</p>
                                    <p>Time: ${meetingDetails.selectTime}</p>
                                </b>
                            </div>
                        </div>
                        <div style="background-color: transparent; padding: 10px 32px 48px; height: fit-content;">
                            
                            <p style="font-size: 11px;margin-top: 0;">You have received this email because you are registered at WARCAT, to ensure the implementation of our Terms of Service and (or) for other legitimate matters.</p>
                            <a style="font-size: 11px;color: rgb(103, 103, 103);" href="#">Privacy Policy</a>
                            <p style="font-size: 11px;">© 2024 WARCAT - War-room Assistant for Report Compilation & Task tracking. 2024.</p>
                        </div>
                    </div>
                </section>
            </body>
            </html>
            `;

            let info = await transporter.sendMail({
                from: '"Warcat" <admin@warcat.com>',
                to: emails.join(','),
                subject: `Meeting ${updateText} Successfully`,
                html: htmlContent
            });

            // console.log('Email sent: ', info.messageId);
        } else {
            console.error('No emails provided');
        }
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Error sending email');
    }
};


// Function to send task added email
exports.sendTaskAddedEmail = async (emails, taskDetails, flag) => {
    try {
        const updateText = flag === 'update' ? 'Updated' : 'Added';
        let emailBody = `<p>Dear User,</p>
                         <h2 style="margin-top: 0px;">Your task has been ${updateText} successfully.</h2>
                         <hr>
                         <p>Task Details:</p>`;

        taskDetails.forEach((task, index) => {
            emailBody += `<p>Task: ${index + 1}<br>
                          Title: <b>${task.task_title}</b><br>
                          Target Date: <b>${task.target_date}</b></p>`;
        });

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Warcat Mail</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0;padding: 0;font-family: 'Roboto', sans-serif; color: #2d2d2d;">
            <section style="background-color: #F4F5FF; display: flex; justify-content: center;">
                <div style="width: 80%; margin: 0 10%;">
                    <div style="background-color: #fff; padding: 32px; height: fit-content; border-radius: 4px; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; margin-top: 20px;">
                        <div style="margin-bottom: 30px;">
                            <div style="display: flex; align-items: center; column-gap: 2px; margin-left: -6px;">
                                <img src="https://develop.d1g0aga5817ond.amplifyapp.com/static/media/logo-dark-sm-removebg-preview.028e6f8b4a37ccf919cc.png" alt="" height="54px">
                                <h1 style="color: rgb(10, 0, 119);">WARCAT</h1>
                            </div>
                        </div>
                        <div>
                            ${emailBody}
                        </div>
                    </div>
                    <div style="background-color: transparent; padding: 10px 32px 48px; height: fit-content;">
                        
                        <p style="font-size: 11px; margin-top: 0;">You have received this email because you are registered at WARCAT, to ensure the implementation of our Terms of Service and (or) for other legitimate matters.</p>
                        <a style="font-size: 11px; color: rgb(103, 103, 103);" href="#">Privacy Policy</a>
                        <p style="font-size: 11px;">© 2024 WARCAT - War-room Assistant for Report Compilation & Task tracking. 2024.</p>
                    </div>
                </div>
            </section>
        </body>
        </html>
        `;

        let info = await transporter.sendMail({
            from: '"Warcat" <admin@warcat.com>',
            to: emails.join(', '),
            subject: `Task ${updateText} Successfully`,
            html: htmlContent
        });

        //console.log('Email sent: ', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Error sending email');
    }
};


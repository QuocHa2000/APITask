const nodemailer = require('nodemailer');

module.exports.sendMail = function(from, to, subject, html) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: '18521308@gm.uit.edu.vn', // generated ethereal user
            pass: '1804635309', // generated ethereal password
        },
    });
    transporter.sendMail({
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    });
}
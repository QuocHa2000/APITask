const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const templatePath = path.join(__dirname, '../public/src/mail.html');
let template = '';
fs.readFile(templatePath, (err, data) => {
    template = data.toString();
});

module.exports.sendEmail = function(sendMailInput) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.user, // generated ethereal user
            pass: process.env.pass, // generated ethereal password
        },
    });
    const body = template
        .replace('{{name}}', sendMailInput.name)
        .replace(/{{link}}/g, sendMailInput.link)
        .replace('{{code}}', sendMailInput.code);

    transporter.sendMail({
        from: sendMailInput.from, // sender address
        to: sendMailInput.to, // list of receivers
        subject: sendMailInput.subject, // Subject line
        html: body, // html body
    });
};
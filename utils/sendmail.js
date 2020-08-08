const nodemailer = require('nodemailer');
const hbs = require('nodemailer-handlebars');
const fs = require('fs');
const path = require('path');
const templatePath = path.join(__dirname, '../views/mail.html');
let template = '';
fs.readFile(templatePath, (err, data) => {
    template = data.toString();
});

module.exports.sendEmail = function(from, to, subject, name, code, link) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.user, // generated ethereal user
            pass: process.env.pass, // generated ethereal password
        },
    });
    const body = template.replace("{{name}}", name).replace(/{{link}}/g, link).replace("{{code}}", code);

    transporter.sendMail({
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
    });
}
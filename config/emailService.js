import http from 'http'
import nodemailer from 'nodemailer'


//configure the SMTP Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use true for port 465, false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // Allow self-signed certificates
  }
});


// Function to send email 
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to, //list of receivers
      subject, //Subject line
      text,  //plain text body
      html  //html body
    });

    return { success: true, messageId: info.messageId }
  } catch (error) {

    console.error("Error to send email", error);
    return { success: false, error: error.message }

  }
}

export default sendEmail;
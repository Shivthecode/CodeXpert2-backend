const nodemailer = require('nodemailer');
const dns = require('dns');

// 🔴 RENDER FIX: Yeh line Node.js ko force karegi ki IPv4 use kare (IPv6 ENETUNREACH error fix)
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'codexpert.work@gmail.com',   
      pass: 'kzvktmrjhrksxnkz'            
    }
  });

  const mailOptions = {
    from: 'codexpert.work@gmail.com',
    to: email,
    subject: 'CodeXpert - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email} using IPv4!`);
  } catch (error) {
    console.error("Nodemailer failed to send email: ", error);
    throw error; 
  }
};

module.exports = sendEmail;
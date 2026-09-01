const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,              // Wapas 465 use karenge jo zyada secure hai
    secure: true,           
    auth: {
      user: 'codexpert.work@gmail.com',   
      pass: 'kzvktmrjhrksxnkz'            
    },
    // 🔴 ULTIMATE FIX: Nodemailer ko strictly IPv4 use karne ka order
    family: 4 
  });

  const mailOptions = {
    from: 'codexpert.work@gmail.com',
    to: email,
    subject: 'CodeXpert - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email} via IPv4!`);
  } catch (error) {
    console.error("Nodemailer failed to send email: ", error);
    throw error; 
  }
};

module.exports = sendEmail;
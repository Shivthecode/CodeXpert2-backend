const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,              // 🔴 Port 587 use karenge
    secure: false,          // 🔴 587 ke liye secure false hota hai
    requireTLS: true,       // 🔴 TLS on karenge
    auth: {
      user: 'codexpert.work@gmail.com',   
      pass: 'kzvktmrjhrksxnkz'            
    },
    family: 4               // 🔴 IPv6 block karne ke liye (Ye zaroori hai)
  });

  const mailOptions = {
    from: 'codexpert.work@gmail.com',
    to: email,
    subject: 'CodeXpert - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email} via Port 587 & IPv4!`);
  } catch (error) {
    console.error("Nodemailer failed to send email: ", error);
    throw error; 
  }
};

module.exports = sendEmail;
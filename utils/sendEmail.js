const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  // 1. Yahan hum transporter banate hain jo Gmail se connect karega
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'codexpert.work@gmail.com',     // 🔴 Yahan apna poora Gmail address likho (jisse app password banaya hai)
      pass: 'kzvk tmrj hrks xnkz'       // 🔴 Yahan abhi jo tumhe 16-digit ka App Password mila hai, wo daalo
    }
  });

  // 2. Yahan email ki details set hoti hain ki kya bhejwana hai
  const mailOptions = {
    from: 'codexpert.work@gmail.com',       // 🔴 Wahi Gmail address yahan bhi aayega
    to: email,                           // Ye wo email hai jo user forgot password mein enter karega
    subject: 'CodeXpert - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
  };

  // 3. Yahan email actual mein send ho jati hai
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
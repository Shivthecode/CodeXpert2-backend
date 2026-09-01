const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  // 1. Transporter banate hain (Render aur production ke liye optimize kiya hua)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Explicit SMTP server add kiya
    port: 465,              // Secure port
    secure: true,           // 465 ke liye true rakhte hain
    auth: {
      user: 'codexpert.work@gmail.com',   // Tumhara Gmail address
      pass: 'kzvktmrjhrksxnkz'            // 🔴 16-digit App Password (Bina spaces ke)
    }
  });

  // 2. Email ki details
  const mailOptions = {
    from: 'codexpert.work@gmail.com', 
    to: email, 
    subject: 'CodeXpert - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
  };

  // 3. Email send karna (with Error Handling)
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`); // Agar pass ho gaya toh Render log me dikhega
  } catch (error) {
    console.error("Nodemailer failed to send email: ", error); // Agar fail hua toh asli wajah dikhegi
    throw error; // Error ko aage bhejna zaroori hai taaki frontend par "Failed to send" dikhe
  }
};

module.exports = sendEmail;
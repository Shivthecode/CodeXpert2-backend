const axios = require('axios');

const sendEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: 'CodeXpert', 
          email: 'codexpert.work@gmail.com' 
        },
        to: [{ email: email }],
        subject: 'CodeXpert - Password Reset OTP',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Password Reset Code</h2>
            <p>Your OTP for resetting your CodeXpert password is:</p>
            <h1 style="color: #4285F4; letter-spacing: 5px;">${otp}</h1>
            <p>It is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        `
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY, // 🔴 QUOTES HATA DIYE HAIN!
          'content-type': 'application/json'
        }
      }
    );

    console.log(`Email successfully sent to ${email} via Brevo API!`);
    return response.data;
  } catch (error) {
    console.error("Brevo API failed to send email: ", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
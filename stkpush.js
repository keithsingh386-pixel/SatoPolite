const axios = require('axios');

// Use Supabase or temp storage for payment status
let payments = {};

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { phone, amount, accountRef, name, email, event: eventName, qty, ticketType } = JSON.parse(event.body);

  try {
    // 1. Get Daraja token
    const auth = Buffer.from(`${process.env.MPESA_KEY}:${process.env.MPESA_SECRET}`).toString('base64');
    const { data: { access_token } } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    // 2. STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14);
    const password = Buffer.from(
      `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString('base64');

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline for Till
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.BUSINESS_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${process.env.URL}/.netlify/functions/callback`,
        AccountReference: accountRef,
        TransactionDesc: `Sato Polite: ${ticketType}`
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // Store for polling
    payments[stkRes.data.CheckoutRequestID] = { paid: false, details: { name, phone, amount, eventName, qty } };

    return { statusCode: 200, body: JSON.stringify(stkRes.data) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ errorMessage: err.response?.data?.errorMessage || 'STK Push failed' }) };
  }
};

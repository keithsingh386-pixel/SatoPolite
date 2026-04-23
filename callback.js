exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const result = body.Body.stkCallback;

  if (result.ResultCode === 0) {
    // Payment success - save to DB, send QR via WhatsApp API
    console.log('Payment success:', result);
    // TODO: Save to Supabase + send WhatsApp
  }

  return { statusCode: 200, body: 'OK' };
};

exports.handler = async (event) => {
  const checkoutId = event.queryStringParameters.checkoutId;
  // In prod: check Supabase DB. For now:
  return { statusCode: 200, body: JSON.stringify({ paid: false }) };
};

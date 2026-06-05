const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { msisdn, click_id } = req.body;

  if (!msisdn || !click_id) {
    return res.status(400).json({ success: false, error: 'missing_fields' });
  }

  console.log(`[request-pin] msisdn=${msisdn} click_id=${click_id}`);

  const { data: existing, error: queryError } = await supabase
    .from('leads')
    .select('id')
    .eq('msisdn', msisdn)
    .eq('status', 'converted')
    .maybeSingle();

  if (queryError) {
    console.error(`[request-pin] dedup query error: ${queryError.message}`);
    return res.status(200).json({ success: false, error: 'db_error', message: queryError.message });
  }

  if (existing) {
    console.log(`[request-pin] duplicate blocked: ${msisdn}`);
    return res.status(200).json({ success: false, error: 'already_registered' });
  }

  let carrierData;
  try {
    const response = await fetch(process.env.REQUEST_PIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn })
    });
    carrierData = await response.json();
    console.log(`[request-pin] carrier response: ${JSON.stringify(carrierData)}`);
  } catch (err) {
    console.error(`[request-pin] carrier fetch error: ${err.message}`);
    return res.status(200).json({ success: false, error: 'carrier_error', message: err.message });
  }

  if (!carrierData.request_id) {
    console.error(`[request-pin] no request_id: ${JSON.stringify(carrierData)}`);
    return res.status(200).json({ success: false, error: 'carrier_error', message: 'No request_id in carrier response' });
  }

  const { error: insertError } = await supabase.from('leads').insert({
    msisdn,
    click_id,
    request_id: carrierData.request_id,
    status: 'pending'
  });

  if (insertError) {
    console.error(`[request-pin] insert failed: ${insertError.message}`);
    return res.status(200).json({ success: false, error: 'db_error', message: insertError.message });
  }

  console.log(`[request-pin] lead inserted for ${msisdn}, request_id=${carrierData.request_id}`);

  return res.status(200).json({ success: true, request_id: carrierData.request_id });
};

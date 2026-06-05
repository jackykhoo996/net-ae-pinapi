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
  let carrierRaw = '';
  try {
    // Carrier expects GET with query params; msisdn sent without leading +
    const url = new URL(process.env.REQUEST_PIN_API_URL);
    url.searchParams.set('offer_id', '4910');
    url.searchParams.set('aff_id', '598');
    url.searchParams.set('click_id', click_id);
    url.searchParams.set('pub_id', '');
    url.searchParams.set('gid', '299');
    url.searchParams.set('shortcode', '1741');
    url.searchParams.set('keyword', 'gd');
    url.searchParams.set('telco', 'etisalat');
    url.searchParams.set('action', 'pin_request');
    url.searchParams.set('msisdn', msisdn.replace(/^\+/, ''));
    url.searchParams.set('country', 'uae');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('domain_name', process.env.DOMAIN_NAME || '');
    const response = await fetch(url.toString());
    carrierRaw = await response.text();
    try {
      carrierData = JSON.parse(carrierRaw);
    } catch (_) {
      console.error(`[request-pin] carrier non-JSON: ${carrierRaw.slice(0, 200)}`);
      return res.status(200).json({ success: false, error: 'carrier_error', message: 'Invalid carrier response' });
    }
    console.log(`[request-pin] carrier response: ${carrierRaw}`);
  } catch (err) {
    console.error(`[request-pin] carrier fetch error: ${err.message}`);
    return res.status(200).json({ success: false, error: 'carrier_error', message: err.message });
  }

  if (!carrierData.request_id) {
    console.error(`[request-pin] no request_id: ${carrierRaw}`);
    return res.status(200).json({ success: false, error: 'carrier_error', message: 'No request_id in carrier response' });
  }

  const { error: insertError } = await supabase.from('leads').insert({
    msisdn,
    click_id,
    request_id: carrierData.request_id,
    status: 'pending',
    carrier_request_raw: carrierRaw
  });

  if (insertError) {
    console.error(`[request-pin] insert failed: ${insertError.message}`);
    return res.status(200).json({ success: false, error: 'db_error', message: insertError.message });
  }

  console.log(`[request-pin] lead inserted for ${msisdn}, request_id=${carrierData.request_id}`);

  return res.status(200).json({ success: true, request_id: carrierData.request_id });
};

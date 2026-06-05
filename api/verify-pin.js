const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { pin, request_id, click_id, msisdn } = req.body;

  if (!pin || !request_id || !click_id || !msisdn) {
    return res.status(400).json({ success: false, error: 'missing_fields' });
  }

  console.log(`[verify-pin] msisdn=${msisdn} request_id=${request_id} click_id=${click_id}`);

  let carrierData;
  try {
    // Carrier expects GET with query params; msisdn sent without leading +
    const url = new URL(process.env.VERIFY_PIN_API_URL);
    url.searchParams.set('offer_id', '4910');
    url.searchParams.set('aff_id', '598');
    url.searchParams.set('click_id', click_id);
    url.searchParams.set('pub_id', '');
    url.searchParams.set('gid', '299');
    url.searchParams.set('shortcode', '1741');
    url.searchParams.set('keyword', 'gd');
    url.searchParams.set('telco', 'etisalat');
    url.searchParams.set('action', 'pin_verify');
    url.searchParams.set('msisdn', msisdn.replace(/^\+/, ''));
    url.searchParams.set('country', 'uae');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('pin_code', pin);
    url.searchParams.set('request_id', request_id);
    url.searchParams.set('domain_name', process.env.DOMAIN_NAME || '');
    const response = await fetch(url.toString());
    carrierData = await response.json();
    console.log(`[verify-pin] carrier response: ${JSON.stringify(carrierData)}`);
  } catch (err) {
    console.error(`[verify-pin] carrier fetch error: ${err.message}`);
    return res.status(200).json({ success: false, error: 'carrier_error', message: err.message });
  }

  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('msisdn', msisdn)
    .eq('request_id', request_id)
    .maybeSingle();

  // Accept multiple carrier success patterns (result_code:0, code:0, status:'success', success:true)
  const isSuccess = carrierData.result_code === 0 ||
                    carrierData.code === 0 ||
                    carrierData.status === 'success' ||
                    carrierData.success === true;

  if (!isSuccess) {
    if (lead) {
      await supabase.from('leads').update({ status: 'failed' }).eq('id', lead.id);
    }
    console.log(`[verify-pin] invalid PIN for ${msisdn}`);
    return res.status(200).json({ success: false, error: 'invalid_pin' });
  }

  if (lead) {
    await supabase
      .from('leads')
      .update({ status: 'converted', converted_at: new Date().toISOString() })
      .eq('id', lead.id);
  }

  const postbackUrl = (process.env.VOLUUM_POSTBACK_URL || '').replace('{click_id}', click_id);
  if (!postbackUrl) {
    console.error('[verify-pin] VOLUUM_POSTBACK_URL not configured — skipping postback');
    return res.status(200).json({ success: true });
  }

  let postbackStatus = null;
  let postbackBody = null;
  let postbackSuccess = false;

  try {
    const postbackRes = await fetch(postbackUrl);
    postbackStatus = postbackRes.status;
    postbackBody = await postbackRes.text();
    postbackSuccess = postbackRes.ok;
    console.log(`[verify-pin] postback fired: status=${postbackStatus} body=${postbackBody}`);
  } catch (err) {
    console.error(`[verify-pin] postback error: ${err.message}`);
    postbackBody = err.message;
  }

  if (lead) {
    await supabase.from('postback_logs').insert({
      lead_id: lead.id,
      postback_url: postbackUrl,
      http_status: postbackStatus,
      response_body: postbackBody,
      success: postbackSuccess
    });
  }

  return res.status(200).json({ success: true });
};

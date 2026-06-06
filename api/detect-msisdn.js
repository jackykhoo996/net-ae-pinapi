module.exports = (req, res) => {
  // Etisalat UAE and common carrier MSISDN header names
  const candidates = [
    'x-up-calling-line-id',
    'x-msisdn',
    'msisdn',
    'x-subscriber-id',
    'x-forwarded-msisdn',
    'x-acr-msisdn',
    'x-wap-msisdn',
    'x-isdn',
    'x-user-id',
  ];

  let detected = null;
  for (const h of candidates) {
    const val = req.headers[h];
    if (!val) continue;
    let n = val.replace(/[\s\-\(\)]/g, '');
    if (n.startsWith('+971'))      n = n.slice(4);
    else if (n.startsWith('00971')) n = n.slice(5);
    else if (n.startsWith('971') && n.length === 12) n = n.slice(3);
    if (n.startsWith('0'))         n = n.slice(1);
    if (/^5\d{8}$/.test(n)) { detected = n; break; }
  }

  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown';
  console.log(`[detect-msisdn] ip=${ip} detected=${detected}`);

  return res.status(200).json({ msisdn: detected });
};

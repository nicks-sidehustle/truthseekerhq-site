export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = 18; // TruthSeekerHQ list
  const WELCOME_TEMPLATE_ID = 12; // TruthSeekerHQ welcome template

  try {
    // Add contact to list
    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [BREVO_LIST_ID],
        attributes: {
          SOURCE: 'truthseekerhq',
          SIGNUP_DATE: new Date().toISOString()
        },
        updateEnabled: true
      })
    });

    const contactData = await contactResponse.json().catch(() => ({}));
    const isDuplicate = contactData.code === 'duplicate_parameter';
    
    if (!contactResponse.ok && !isDuplicate) {
      return res.status(400).json({ error: contactData.message || 'Subscription failed' });
    }

    // Send welcome email only to new subscribers
    if (!isDuplicate) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: WELCOME_TEMPLATE_ID,
          to: [{ email: email }],
          params: { EMAIL: email }
        })
      }).catch(() => {});
    }

    return res.status(200).json({ 
      success: true, 
      message: isDuplicate ? 'Already subscribed!' : 'Welcome to the truth! Check your inbox.'
    });
  } catch (err) {
    console.error('Brevo API error:', err);
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
}

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
        listIds: [4], // TruthSeekerHQ Newsletter list
        updateEnabled: true
      })
    });

    const isNew = contactResponse.ok || contactResponse.status === 201 || contactResponse.status === 204;
    let isDuplicate = false;
    
    if (!isNew) {
      const data = await contactResponse.json();
      isDuplicate = data.code === 'duplicate_parameter';
      if (!isDuplicate) {
        return res.status(400).json({ error: data.message || 'Subscription failed' });
      }
    }

    // Send welcome email to ALL subscribers (new or returning)
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateId: 1,
        to: [{ email: email }]
      })
    });

    const emailSent = emailResponse.ok;

    return res.status(200).json({ 
      success: true, 
      message: isDuplicate ? 'Already subscribed' : 'Subscribed!',
      emailSent: emailSent
    });
  } catch (err) {
    console.error('Brevo API error:', err);
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
}

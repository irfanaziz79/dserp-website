export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { companyName, email, phone } = req.body;

  if (!email || !companyName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('New lead:', { companyName, email, phone, timestamp: new Date() });

    return res.status(200).json({ 
      success: true, 
      message: 'Lead captured successfully' 
    });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return res.status(500).json({ error: 'Failed to capture lead' });
  }
}

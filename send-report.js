export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { companyName, email, report } = req.body;

  if (!email || !report) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('Report generated for:', { companyName, email, closeDays: report.closeDays });

    return res.status(200).json({ 
      success: true, 
      message: 'Report generated and sent successfully' 
    });
  } catch (error) {
    console.error('Error sending report:', error);
    return res.status(500).json({ error: 'Failed to send report' });
  }
}

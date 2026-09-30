export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const {
      name,
      contact,
      state,
      city,
      message,
    } = req.body || {};

    // Validation
    if (
      !name?.trim() ||
      !contact?.trim() ||
      !state?.trim() ||
      !city?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields.',
      });
    }

    // Create inquiry object
    const inquiry = {
      leadName: name.trim(),
      company: '',
      phone: contact.trim(),
      email: '',
      state: state.trim(),
      city: city.trim(),
      source: 'Website',
      pipelineStage: 'New',
      owner: '',
      lastFollowUp: null,
      nextFollowUp: null,
      leadResponseMessage: message.trim(),
      createdAt: new Date().toISOString(),
    };

    /*
      IMPORTANT:

      Vercel serverless functions cannot reliably
      modify src/database/inquiry.json permanently.

      This is where persistent storage should be connected.
    */

    return res.status(200).json({
      success: true,
      message: 'Inquiry received successfully.',
      inquiry,
    });

  } catch (error) {
    console.error('Inquiry API error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    });
  }
}

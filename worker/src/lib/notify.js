const SUPABASE_URL = process.env.SUPABASE_URL;
const WORKER_SECRET = process.env.WORKER_WEBHOOK_SECRET || '';

async function notifyScanComplete(scanId) {
  try {
    const url = `${SUPABASE_URL}/functions/v1/send-scan-email`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Secret': WORKER_SECRET,
      },
      body: JSON.stringify({ scanId }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[NOTIFY] Failed to send email for scan ${scanId}:`, errText);
    } else {
      const result = await response.json();
      console.log(`[NOTIFY] Email sent to ${result.email} for scan ${scanId}`);
    }
  } catch (err) {
    console.error(`[NOTIFY] Error sending notification for scan ${scanId}:`, err.message);
  }
}

module.exports = { notifyScanComplete };

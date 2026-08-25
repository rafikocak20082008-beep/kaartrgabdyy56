const webpush = require('web-push');

const VAPID_PUBLIC  = 'BDltnsFzAWLSsK0BgCV1GZhuL-Dpt6Z5qP8nqKcIi5ecvi6kmjY4OZyimTarGliYJ4z8YfWdL6604bn5nKxWPNs';
const VAPID_PRIVATE = 'mYKG-VcDjqdRh95i_sO0Bs-EpwbOublcot76YZxqQt0';

webpush.setVapidDetails('mailto:marketing@vvegemak.nl', VAPID_PUBLIC, VAPID_PRIVATE);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { subscriptions, title, body } = req.body || {};
  if (!subscriptions?.length) return res.status(400).json({ error: 'geen abonnementen' });

  const payload = JSON.stringify({
    title: title || 'VVEgemak — Tijd om te flyeren!',
    body: body || 'Er staat een buurt klaar om geflyerd te worden.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    requireInteraction: true
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload, { TTL: 86400 }))
  );

  const ok = results.filter(r => r.status === 'fulfilled').length;
  const fail = results.filter(r => r.status === 'rejected').length;

  res.json({ sent: ok, failed: fail });
};

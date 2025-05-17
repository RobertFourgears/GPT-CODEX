
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

const guideData = require('./guideMap.json').guides;

function getGuideLinks(slugs) {
  return guideData.filter(g => slugs.includes(g.slug)).map(g => g.link);
}

async function zohoWebhookHandler(req, res) {
  const { metadata, customer_email } = req.body;

  let slugs = [];
  let tag = '';
  if (metadata && metadata.vault) {
    slugs = guideData.map(g => g.slug);
    tag = 'vault';
  } else if (metadata && metadata.guideSlug) {
    slugs = [metadata.guideSlug];
    tag = metadata.guideSlug;
  } else {
    return res.status(400).send('Missing metadata');
  }

  const links = getGuideLinks(slugs);

  const transporter = nodemailer.createTransport({
    service: 'Zoho',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: customer_email,
    subject: `Your guide${tag === 'vault' ? 's' : ''} are ready`,
    text: `Here are your guide link(s):\n\n${links.join('\n')}`
  });

  await axios.post('https://www.zohoapis.com/crm/v2/Contacts/upsert', {
    data: [{
      Email: customer_email,
      Tag: tag
    }]
  }, {
    headers: {
      Authorization: `Zoho-oauthtoken ${process.env.Z_API_KEY}`
    }
  });

  res.status(200).send('ok');
}

module.exports = zohoWebhookHandler;

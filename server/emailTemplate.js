function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Splits newline-separated text into a <ul> list, or a plain <p> if single line.
function toList(str) {
  if (!str || !str.trim()) return '';
  const items = str.trim().split('\n').filter(s => s.trim()).map(esc);
  if (items.length === 1) {
    return `<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #3C4043;">${items[0]}</p>`;
  }
  return `<ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6; color: #3C4043;">${
    items.map((item, i) => `<li style="margin-bottom: ${i < items.length - 1 ? '8px' : '0'};">${item}</li>`).join('')
  }</ul>`;
}

// Splits newline-separated text into separate <p> tags.
function toParas(str) {
  if (!str || !str.trim()) return '';
  const paras = str.trim().split('\n').filter(s => s.trim()).map(esc);
  return paras.map((p, i) =>
    `<p style="margin: 0${i < paras.length - 1 ? ' 0 12px 0' : ''}; font-size: 15px; line-height: 1.6; color: #3C4043;">${p}</p>`
  ).join('');
}

const TREND_SVG = {
  up:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1E8E3E" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>`,
  flat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#5F6368" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M22 12l-4-4v3H3v2h15v3z"/></svg>`,
  down: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#D93025" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/></svg>`,
};

const MORALE_MAP = {
  1: { trend: 'down', label: 'Rough Week' },
  2: { trend: 'down', label: 'Under Pressure' },
  3: { trend: 'flat', label: 'Holding Steady' },
  4: { trend: 'up',   label: 'Good Momentum' },
  5: { trend: 'up',   label: 'Firing on All Cylinders' },
};

module.exports = function generateEmail({ weekLabel, metrics, progress, blockers, focus, morale, ask }) {
  const m = MORALE_MAP[morale] || MORALE_MAP[3];
  const validMetrics = (metrics || []).filter(r => r.label || r.value);

  const font = `Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  function sectionLabel(title, color) {
    return `<p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${color}; border-bottom: 1px solid #F1F3F4; padding-bottom: 8px; font-family: ${font};">${title}</p>`;
  }

  function section(title, body, color = '#5F6368', topPad = '32px') {
    if (!body) return '';
    return `
    <tr>
      <td style="padding: ${topPad} 0 8px 0; font-family: ${font};">
        ${sectionLabel(title, color)}
        ${body}
      </td>
    </tr>`;
  }

  const metricsHtml = validMetrics.length > 0 ? `
    <tr>
      <td style="padding: 24px 0 8px 0; font-family: ${font};">
        ${sectionLabel('Key Metrics', '#5F6368')}
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          ${validMetrics.map((r, i) => {
            const border = i < validMetrics.length - 1 ? 'border-bottom: 1px solid #F1F3F4;' : '';
            return `
          <tr>
            <td style="padding: 12px 0; ${border} font-size: 14px; color: #3C4043; font-family: ${font};">${esc(r.label)}</td>
            <td style="padding: 12px 0; ${border} font-size: 16px; font-weight: 500; color: #202124; text-align: right; font-family: ${font};">${esc(r.value)}</td>
          </tr>`;
          }).join('')}
        </table>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Update &#8212; ${esc(weekLabel)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; -webkit-font-smoothing: antialiased;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E0E0E0; box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1A73E8; padding: 32px 32px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: #8AB4F8; font-family: ${font};">Weekly Update</p>
              <h1 style="margin: 0; font-family: ${font}; font-size: 28px; font-weight: 400; color: #FFFFFF; letter-spacing: -0.2px; line-height: 1.2;">${esc(weekLabel)}</h1>
            </td>
          </tr>

          <!-- Morale strip -->
          <tr>
            <td style="background-color: #E8F0FE; padding: 16px 32px; border-bottom: 1px solid #E0E0E0;">
              <p style="margin: 0; font-size: 14px; color: #1967D2; font-family: ${font}; font-weight: 500;">
                ${TREND_SVG[m.trend]}&nbsp;&nbsp;<strong style="font-weight: 700;">Morale:</strong> ${m.label}&nbsp;<span style="color: #669DF6; font-weight: 400; font-size: 13px;">(${morale}/5)</span>
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 16px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${metricsHtml}
                ${section('Progress &amp; Wins', toList(progress))}
                ${section('Blockers &amp; Challenges', toList(blockers), '#D93025')}
                ${section('Focus for Next Week', toList(focus))}
                ${section('The Ask', toParas(ask), '#E37400')}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F9FA; padding: 20px 32px; border-top: 1px solid #E0E0E0; font-family: ${font};">
              <p style="margin: 0; font-size: 12px; color: #80868B; text-align: center; letter-spacing: 0.3px;">
                Sent via Weekly Updater &#8212; ${esc(weekLabel)}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

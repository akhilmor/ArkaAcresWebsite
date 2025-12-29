interface BookingData {
  bookingId: string
  unitName: string
  unitSlug: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  checkIn?: string | null
  checkOut?: string | null
  eventDate?: string | null
  startTime?: string | null
  endTime?: string | null
  eventType?: string | null
  guests?: number | null
  notes?: string | null
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function getGuestReceiptEmail(data: BookingData) {
  const subject = `Arka Acres — Request Received (ID: ${data.bookingId})`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C0552F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: 600; color: #666; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Arka Acres</h1>
    </div>
    <div class="content">
      <h2>We received your request!</h2>
      <p>Thank you, ${data.guestName}, for your booking request. We've received it and will review it shortly.</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <div class="detail-row">
          <span class="label">Booking ID:</span> ${data.bookingId}
        </div>
        <div class="detail-row">
          <span class="label">Unit:</span> ${data.unitName}
        </div>
        ${data.checkIn && data.checkOut
          ? `
        <div class="detail-row">
          <span class="label">Check-in:</span> ${formatDate(data.checkIn)}
        </div>
        <div class="detail-row">
          <span class="label">Check-out:</span> ${formatDate(data.checkOut)}
        </div>
        ${data.guests ? `<div class="detail-row"><span class="label">Guests:</span> ${data.guests}</div>` : ''}
        `
          : data.eventDate
          ? `
        <div class="detail-row">
          <span class="label">Event Date:</span> ${formatDate(data.eventDate)}
        </div>
        ${data.startTime && data.endTime ? `<div class="detail-row"><span class="label">Time:</span> ${data.startTime} - ${data.endTime}</div>` : ''}
        ${data.eventType ? `<div class="detail-row"><span class="label">Event Type:</span> ${data.eventType}</div>` : ''}
        ${data.guests ? `<div class="detail-row"><span class="label">Attendees:</span> ${data.guests}</div>` : ''}
        `
          : ''}
      </div>

      <p><strong>What happens next?</strong></p>
      <p>We'll review your request and confirm availability. You'll receive a confirmation email once your booking is approved.</p>

      <div class="footer">
        <p>Questions? Contact us:</p>
        <p>Email: arkaacres@gmail.com<br>Phone: (469) 536-9020</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
Arka Acres - Booking Request Received

Thank you, ${data.guestName}, for your booking request. We've received it and will review it shortly.

Booking Details:
- Booking ID: ${data.bookingId}
- Unit: ${data.unitName}
${data.checkIn && data.checkOut
  ? `- Check-in: ${formatDate(data.checkIn)}
- Check-out: ${formatDate(data.checkOut)}
${data.guests ? `- Guests: ${data.guests}` : ''}`
  : data.eventDate
  ? `- Event Date: ${formatDate(data.eventDate)}
${data.startTime && data.endTime ? `- Time: ${data.startTime} - ${data.endTime}` : ''}
${data.eventType ? `- Event Type: ${data.eventType}` : ''}
${data.guests ? `- Attendees: ${data.guests}` : ''}`
  : ''}

What happens next?
We'll review your request and confirm availability. You'll receive a confirmation email once your booking is approved.

Questions? Contact us:
Email: arkaacres@gmail.com
Phone: (469) 536-9020
  `.trim()

  return { subject, html, text }
}

export function getGuestConfirmedEmail(data: BookingData) {
  const subject = `Your booking is confirmed — Arka Acres (ID: ${data.bookingId})`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C0552F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: 600; color: #666; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Arka Acres</h1>
    </div>
    <div class="content">
      <div class="success">
        <h2 style="margin: 0; color: #155724;">✓ Your booking is confirmed!</h2>
      </div>
      
      <p>Dear ${data.guestName},</p>
      <p>We're excited to confirm your booking at Arka Acres. We look forward to hosting you!</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">Confirmed Booking Details</h3>
        <div class="detail-row">
          <span class="label">Booking ID:</span> ${data.bookingId}
        </div>
        <div class="detail-row">
          <span class="label">Unit:</span> ${data.unitName}
        </div>
        ${data.checkIn && data.checkOut
          ? `
        <div class="detail-row">
          <span class="label">Check-in:</span> ${formatDate(data.checkIn)}
        </div>
        <div class="detail-row">
          <span class="label">Check-out:</span> ${formatDate(data.checkOut)}
        </div>
        ${data.guests ? `<div class="detail-row"><span class="label">Guests:</span> ${data.guests}</div>` : ''}
        `
          : data.eventDate
          ? `
        <div class="detail-row">
          <span class="label">Event Date:</span> ${formatDate(data.eventDate)}
        </div>
        ${data.startTime && data.endTime ? `<div class="detail-row"><span class="label">Time:</span> ${data.startTime} - ${data.endTime}</div>` : ''}
        ${data.eventType ? `<div class="detail-row"><span class="label">Event Type:</span> ${data.eventType}</div>` : ''}
        ${data.guests ? `<div class="detail-row"><span class="label">Attendees:</span> ${data.guests}</div>` : ''}
        `
          : ''}
      </div>

      <p><strong>Next steps:</strong></p>
      <p>We'll send you additional details and directions closer to your stay/event date. If you have any questions, please don't hesitate to reach out.</p>

      <div class="footer">
        <p>Contact us:</p>
        <p>Email: arkaacres@gmail.com<br>Phone: (469) 536-9020</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
Arka Acres - Booking Confirmed

✓ Your booking is confirmed!

Dear ${data.guestName},

We're excited to confirm your booking at Arka Acres. We look forward to hosting you!

Confirmed Booking Details:
- Booking ID: ${data.bookingId}
- Unit: ${data.unitName}
${data.checkIn && data.checkOut
  ? `- Check-in: ${formatDate(data.checkIn)}
- Check-out: ${formatDate(data.checkOut)}
${data.guests ? `- Guests: ${data.guests}` : ''}`
  : data.eventDate
  ? `- Event Date: ${formatDate(data.eventDate)}
${data.startTime && data.endTime ? `- Time: ${data.startTime} - ${data.endTime}` : ''}
${data.eventType ? `- Event Type: ${data.eventType}` : ''}
${data.guests ? `- Attendees: ${data.guests}` : ''}`
  : ''}

Next steps:
We'll send you additional details and directions closer to your stay/event date. If you have any questions, please don't hesitate to reach out.

Contact us:
Email: arkaacres@gmail.com
Phone: (469) 536-9020
  `.trim()

  return { subject, html, text }
}

export function getOwnerNewRequestEmail(data: BookingData) {
  const dates = data.checkIn && data.checkOut
    ? `${formatDate(data.checkIn)} to ${formatDate(data.checkOut)}`
    : data.eventDate
    ? formatDate(data.eventDate)
    : 'N/A'

  const subject = `New booking request — ${data.unitName} — ${dates} (ID: ${data.bookingId})`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C0552F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: 600; color: #666; }
    .action { background: #C0552F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">New Booking Request</h1>
    </div>
    <div class="content">
      <h2>New booking request received</h2>
      <p>A new booking request has been submitted and is pending your review.</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">Booking Information</h3>
        <div class="detail-row">
          <span class="label">Booking ID:</span> ${data.bookingId}
        </div>
        <div class="detail-row">
          <span class="label">Unit:</span> ${data.unitName}
        </div>
        ${data.checkIn && data.checkOut
          ? `
        <div class="detail-row">
          <span class="label">Check-in:</span> ${formatDate(data.checkIn)}
        </div>
        <div class="detail-row">
          <span class="label">Check-out:</span> ${formatDate(data.checkOut)}
        </div>
        ${data.guests ? `<div class="detail-row"><span class="label">Guests:</span> ${data.guests}</div>` : ''}
        `
          : data.eventDate
          ? `
        <div class="detail-row">
          <span class="label">Event Date:</span> ${formatDate(data.eventDate)}
        </div>
        ${data.startTime && data.endTime ? `<div class="detail-row"><span class="label">Time:</span> ${data.startTime} - ${data.endTime}</div>` : ''}
        ${data.eventType ? `<div class="detail-row"><span class="label">Event Type:</span> ${data.eventType}</div>` : ''}
        ${data.guests ? `<div class="detail-row"><span class="label">Estimated Attendees:</span> ${data.guests}</div>` : ''}
        `
          : ''}
      </div>

      <div class="details">
        <h3 style="margin-top: 0;">Guest Contact Information</h3>
        <div class="detail-row">
          <span class="label">Name:</span> ${data.guestName}
        </div>
        <div class="detail-row">
          <span class="label">Email:</span> ${data.guestEmail}
        </div>
        ${data.guestPhone ? `<div class="detail-row"><span class="label">Phone:</span> ${data.guestPhone}</div>` : ''}
      </div>

      ${data.notes
        ? `
      <div class="details">
        <h3 style="margin-top: 0;">Additional Notes</h3>
        <p>${data.notes}</p>
      </div>
      `
        : ''}

      <p><strong>Action required:</strong> Please review this booking in the admin panel and confirm or cancel as appropriate.</p>
      
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/admin')}/admin" class="action">Review in Admin Panel</a>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
New Booking Request - Arka Acres

A new booking request has been submitted and is pending your review.

Booking Information:
- Booking ID: ${data.bookingId}
- Unit: ${data.unitName}
${data.checkIn && data.checkOut
  ? `- Check-in: ${formatDate(data.checkIn)}
- Check-out: ${formatDate(data.checkOut)}
${data.guests ? `- Guests: ${data.guests}` : ''}`
  : data.eventDate
  ? `- Event Date: ${formatDate(data.eventDate)}
${data.startTime && data.endTime ? `- Time: ${data.startTime} - ${data.endTime}` : ''}
${data.eventType ? `- Event Type: ${data.eventType}` : ''}
${data.guests ? `- Estimated Attendees: ${data.guests}` : ''}`
  : ''}

Guest Contact Information:
- Name: ${data.guestName}
- Email: ${data.guestEmail}
${data.guestPhone ? `- Phone: ${data.guestPhone}` : ''}

${data.notes ? `Additional Notes:\n${data.notes}\n` : ''}

Action required: Please review this booking in the admin panel and confirm or cancel as appropriate.
  `.trim()

  return { subject, html, text }
}


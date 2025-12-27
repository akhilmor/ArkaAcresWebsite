import { prisma } from '@/lib/prisma'
import { sendEmailResend } from './email'
import { sendSmsTwilio } from './sms'
import { getGuestReceiptEmail, getGuestConfirmedEmail, getOwnerNewRequestEmail } from '@/lib/emailTemplates'
import { VISIT_CONFIG } from '@/content/siteContent'
import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

interface NotificationResult {
  ok: boolean
  providerMessageId?: string
  error?: string
  logId?: string
}

interface BookingWithUnit {
  id: string
  unitId: string
  unit: {
    name: string
    slug: string
    type: string
  }
  name: string
  email: string
  phone: string | null
  checkIn: Date | null
  checkOut: Date | null
  eventDate: Date | null
  startTime: string | null
  endTime: string | null
  eventType: string | null
  guests: number | null
  notes: string | null
}

function formatBookingData(booking: BookingWithUnit) {
  return {
    bookingId: booking.id,
    unitName: booking.unit.name,
    unitSlug: booking.unit.slug,
    guestName: booking.name,
    guestEmail: booking.email,
    guestPhone: booking.phone,
    checkIn: booking.checkIn?.toISOString().split('T')[0] || null,
    checkOut: booking.checkOut?.toISOString().split('T')[0] || null,
    eventDate: booking.eventDate?.toISOString().split('T')[0] || null,
    startTime: booking.startTime || null,
    endTime: booking.endTime || null,
    eventType: booking.eventType || null,
    guests: booking.guests || null,
    notes: booking.notes || null,
  }
}

// Check if NotificationLog table exists (optional feature)
async function isNotificationLogAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM NotificationLog LIMIT 1`
    return true
  } catch (error: any) {
    // Table doesn't exist or other error
    return false
  }
}

async function logNotification(
  bookingId: string,
  audience: 'owner' | 'guest',
  channel: 'email' | 'sms',
  messageType: string,
  status: 'sent' | 'failed',
  provider: 'resend' | 'smtp' | 'twilio',
  providerMessageId?: string,
  errorMessage?: string
): Promise<string | null> {
  // Check if table exists first
  const tableExists = await isNotificationLogAvailable()
  if (!tableExists) {
    serverLogBuffer.warn('[NOTIFY] NotificationLog table not available, skipping log', {
      bookingId,
      audience,
      channel,
    })
    return null
  }

  try {
    const log = await prisma.notificationLog.create({
      data: {
        bookingId,
        audience,
        channel,
        messageType,
        status,
        provider,
        providerMessageId: providerMessageId || null,
        errorMessage: errorMessage || null,
      },
    })

    return log.id
  } catch (error: any) {
    // If table doesn't exist or other Prisma error, log but don't throw
    serverLogBuffer.warn('[NOTIFY] Failed to log notification (table may not exist)', {
      bookingId,
      error: error?.message,
    })
    return null
  }
}

async function checkIdempotency(
  bookingId: string,
  audience: 'owner' | 'guest',
  channel: 'email' | 'sms',
  messageType: string,
  force: boolean = false
): Promise<boolean> {
  if (force) return false // Force resend

  const tableExists = await isNotificationLogAvailable()
  if (!tableExists) {
    return false // If table doesn't exist, allow send
  }

  try {
    const existing = await prisma.notificationLog.findFirst({
      where: {
        bookingId,
        audience,
        channel,
        messageType,
        status: 'sent',
      },
    })

    return !!existing
  } catch (error: any) {
    // If table doesn't exist, allow send
    return false
  }
}

export async function sendGuestReceipt(booking: BookingWithUnit, force: boolean = false): Promise<NotificationResult> {
  const bookingData = formatBookingData(booking)

  // Check idempotency
  const alreadySent = await checkIdempotency(booking.id, 'guest', 'email', 'guest_receipt', force)
  if (alreadySent) {
    serverLogBuffer.info('[NOTIFY] Guest receipt email already sent, skipping', { bookingId: booking.id })
    return { ok: true, error: 'Already sent (idempotency)' }
  }

  const template = getGuestReceiptEmail(bookingData)
  const result = await sendEmailResend(booking.email, template.subject, template.html, template.text)

  const logId = await logNotification(
    booking.id,
    'guest',
    'email',
    'guest_receipt',
    result.ok ? 'sent' : 'failed',
    result.provider === 'none' ? 'resend' : (result.provider || 'resend'),
    result.providerMessageId,
    result.error
  )

  // Update booking quick status (this should always work)
  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        guestEmailStatus: result.ok ? 'sent' : 'failed',
        guestEmailError: result.error || null,
        guestEmailSentAt: result.ok ? new Date() : null,
        lastNotificationError: result.error || null,
      },
    })
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId: booking.id,
      error: error?.message,
    })
    // Don't throw - notification was attempted
  }

  return { ...result, logId: logId || undefined }
}

export async function sendGuestConfirmed(booking: BookingWithUnit, force: boolean = false): Promise<NotificationResult> {
  const bookingData = formatBookingData(booking)

  // Check idempotency
  const alreadySent = await checkIdempotency(booking.id, 'guest', 'email', 'guest_confirmed', force)
  if (alreadySent) {
    serverLogBuffer.info('[NOTIFY] Guest confirmed email already sent, skipping', { bookingId: booking.id })
    return { ok: true, error: 'Already sent (idempotency)' }
  }

  const template = getGuestConfirmedEmail(bookingData)
  const result = await sendEmailResend(booking.email, template.subject, template.html, template.text)

  const logId = await logNotification(
    booking.id,
    'guest',
    'email',
    'guest_confirmed',
    result.ok ? 'sent' : 'failed',
    result.provider === 'none' ? 'resend' : (result.provider || 'resend'),
    result.providerMessageId,
    result.error
  )

  // Update booking quick status
  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        guestEmailStatus: result.ok ? 'sent' : 'failed',
        lastNotificationError: result.error || null,
      },
    })
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId: booking.id,
      error: error?.message,
    })
  }

  return { ...result, logId: logId || undefined }
}

export async function sendOwnerNewRequest(booking: BookingWithUnit, force: boolean = false): Promise<NotificationResult> {
  const bookingData = formatBookingData(booking)

  // Check idempotency
  const alreadySent = await checkIdempotency(booking.id, 'owner', 'email', 'owner_new_request', force)
  if (alreadySent) {
    serverLogBuffer.info('[NOTIFY] Owner email already sent, skipping', { bookingId: booking.id })
    return { ok: true, error: 'Already sent (idempotency)' }
  }

  const env = getEnvSafe()
  const ownerEmail = env.OWNER_EMAIL || 'arkaacres@gmail.com'
  const template = getOwnerNewRequestEmail(bookingData)
  const result = await sendEmailResend(ownerEmail, template.subject, template.html, template.text)

  const logId = await logNotification(
    booking.id,
    'owner',
    'email',
    'owner_new_request',
    result.ok ? 'sent' : 'failed',
    result.provider === 'none' ? 'resend' : (result.provider || 'resend'),
    result.providerMessageId,
    result.error
  )

  // Update booking quick status
  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        ownerEmailStatus: result.ok ? 'sent' : 'failed',
        ownerEmailError: result.error || null,
        ownerEmailSentAt: result.ok ? new Date() : null,
        lastNotificationError: result.error || null,
      },
    })
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId: booking.id,
      error: error?.message,
    })
  }

  return { ...result, logId: logId || undefined }
}

export async function sendOwnerSms(booking: BookingWithUnit, force: boolean = false): Promise<NotificationResult> {
  // Check idempotency
  const alreadySent = await checkIdempotency(booking.id, 'owner', 'sms', 'owner_new_request', force)
  if (alreadySent) {
    serverLogBuffer.info('[NOTIFY] Owner SMS already sent, skipping', { bookingId: booking.id })
    return { ok: true, error: 'Already sent (idempotency)' }
  }

  const bookingData = formatBookingData(booking)
  let sms = `New Booking: ${booking.unit.name}\n`
  sms += `ID: ${booking.id}\n`
  sms += `${booking.name} (${booking.email})`
  if (booking.phone) sms += ` - ${booking.phone}`
  sms += `\n`

  if (booking.checkIn && booking.checkOut) {
    sms += `${bookingData.checkIn} to ${bookingData.checkOut}`
    if (booking.guests) sms += `, ${booking.guests} guests`
  } else if (booking.eventDate) {
    sms += `${bookingData.eventDate}`
    if (booking.startTime && booking.endTime) {
      sms += ` ${booking.startTime}-${booking.endTime}`
    }
    if (booking.guests) sms += `, ${booking.guests} attendees`
  }

  const env = getEnvSafe()
  const ownerPhone = env.OWNER_PHONE || env.SMS_TO_NUMBER || '+14695369020'
  const result = await sendSmsTwilio(ownerPhone, sms)

  const logId = await logNotification(
    booking.id,
    'owner',
    'sms',
    'owner_new_request',
    result.ok ? 'sent' : 'failed',
    'twilio',
    result.providerMessageId,
    result.error
  )

  // Update booking quick status
  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        ownerSmsStatus: result.ok ? 'sent' : 'failed',
        ownerSmsError: result.error || null,
        ownerSmsSentAt: result.ok ? new Date() : null,
        lastNotificationError: result.error || null,
      },
    })
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId: booking.id,
      error: error?.message,
    })
  }

  return { ...result, logId: logId || undefined }
}

export async function sendGuestSmsReceipt(booking: BookingWithUnit, force: boolean = false): Promise<NotificationResult> {
  if (!booking.phone) {
    return { ok: false, error: 'No phone number provided' }
  }

  const env = getEnvSafe()
  if (!env.ENABLE_GUEST_SMS) {
    return { ok: false, error: 'Guest SMS disabled' }
  }

  // Check idempotency
  const alreadySent = await checkIdempotency(booking.id, 'guest', 'sms', 'guest_receipt', force)
  if (alreadySent) {
    serverLogBuffer.info('[NOTIFY] Guest SMS receipt already sent, skipping', { bookingId: booking.id })
    return { ok: true, error: 'Already sent (idempotency)' }
  }

  const bookingData = formatBookingData(booking)
  let sms = `Arka Acres: We received your booking request (ID: ${booking.id}). We'll confirm shortly.`
  if (booking.checkIn && booking.checkOut) {
    sms += ` Check-in: ${bookingData.checkIn}`
  } else if (booking.eventDate) {
    sms += ` Event: ${bookingData.eventDate}`
  }

  const result = await sendSmsTwilio(booking.phone, sms)

  const logId = await logNotification(
    booking.id,
    'guest',
    'sms',
    'guest_receipt',
    result.ok ? 'sent' : 'failed',
    'twilio',
    result.providerMessageId,
    result.error
  )

  // Update booking quick status
  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        guestSmsStatus: result.ok ? 'sent' : 'failed',
        lastNotificationError: result.error || null,
      },
    })
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId: booking.id,
      error: error?.message,
    })
  }

  return { ...result, logId: logId || undefined }
}

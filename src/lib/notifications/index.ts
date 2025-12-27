import { prisma } from '@/lib/prisma'
import { sendEmail, SendEmailResult } from './email'
import { sendSms, SendSmsResult } from './sms'
import { getGuestReceiptEmail, getGuestConfirmedEmail, getOwnerNewRequestEmail } from '@/lib/emailTemplates'
import { getEnvSafe } from '@/lib/env'
import { serverLogBuffer } from '@/lib/serverLogBuffer'

export type NotificationStatus = 'sent' | 'failed' | 'not_sent' | 'disabled'

export interface NotificationSummary {
  guestEmail: NotificationStatus
  ownerEmail: NotificationStatus
  ownerSms: NotificationStatus
  guestSms: NotificationStatus
  warnings: string[]
}

export interface BookingWithUnit {
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

// Check if NotificationLog table exists
async function isNotificationLogAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM NotificationLog LIMIT 1`
    return true
  } catch {
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
  errorCode?: string,
  errorMessage?: string
): Promise<string | null> {
  const tableExists = await isNotificationLogAvailable()
  if (!tableExists) {
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
        errorMessage: errorCode ? `${errorCode}: ${errorMessage || ''}`.trim() : errorMessage || null,
      },
    })
    return log.id
  } catch (error: any) {
    serverLogBuffer.warn('[NOTIFY] Failed to log notification', {
      bookingId,
      error: error?.message,
    })
    return null
  }
}

async function updateBookingStatus(
  bookingId: string,
  updates: {
    ownerEmailStatus?: NotificationStatus
    ownerEmailError?: string | null
    ownerEmailSentAt?: Date | null
    ownerSmsStatus?: NotificationStatus
    ownerSmsError?: string | null
    ownerSmsSentAt?: Date | null
    guestEmailStatus?: NotificationStatus
    guestEmailError?: string | null
    guestEmailSentAt?: Date | null
    guestSmsStatus?: NotificationStatus
    guestSmsError?: string | null
  }
): Promise<void> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(updates.ownerEmailStatus && {
          ownerEmailStatus: updates.ownerEmailStatus === 'sent' ? 'sent' : updates.ownerEmailStatus === 'failed' ? 'failed' : 'not_sent',
          ownerEmailError: updates.ownerEmailError || null,
          ownerEmailSentAt: updates.ownerEmailSentAt || null,
        }),
        ...(updates.ownerSmsStatus && {
          ownerSmsStatus: updates.ownerSmsStatus === 'sent' ? 'sent' : updates.ownerSmsStatus === 'failed' ? 'failed' : 'not_sent',
          ownerSmsError: updates.ownerSmsError || null,
          ownerSmsSentAt: updates.ownerSmsSentAt || null,
        }),
        ...(updates.guestEmailStatus && {
          guestEmailStatus: updates.guestEmailStatus === 'sent' ? 'sent' : updates.guestEmailStatus === 'failed' ? 'failed' : 'not_sent',
          guestEmailError: updates.guestEmailError || null,
          guestEmailSentAt: updates.guestEmailSentAt || null,
        }),
        ...(updates.guestSmsStatus && {
          guestSmsStatus: updates.guestSmsStatus === 'sent' ? 'sent' : updates.guestSmsStatus === 'failed' ? 'failed' : 'not_sent',
          guestSmsError: updates.guestSmsError || null,
        }),
      },
    })
  } catch (error: any) {
    // Schema might not have all fields - that's OK
    serverLogBuffer.warn('[NOTIFY] Failed to update booking status', {
      bookingId,
      error: error?.message,
    })
  }
}

/**
 * Send all notifications for a booking
 * Returns clean summary with one log line per booking
 */
export async function sendBookingNotifications(
  booking: BookingWithUnit,
  force: boolean = false
): Promise<NotificationSummary> {
  const env = getEnvSafe()
  const bookingData = formatBookingData(booking)
  const summary: NotificationSummary = {
    guestEmail: 'not_sent',
    ownerEmail: 'not_sent',
    ownerSms: 'not_sent',
    guestSms: 'not_sent',
    warnings: [],
  }

  // Guest receipt email
  try {
    const template = getGuestReceiptEmail(bookingData)
    const result = await sendEmail({
      to: booking.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    const status: NotificationStatus = result.ok ? 'sent' : result.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED' ? 'disabled' : 'failed'
    summary.guestEmail = status

    if (!result.ok && result.errorCode) {
      if (result.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED') {
        summary.warnings.push('NO_EMAIL_PROVIDER_CONFIGURED')
      }
    }

    await logNotification(
      booking.id,
      'guest',
      'email',
      'guest_receipt',
      result.ok ? 'sent' : 'failed',
      result.provider === 'resend' ? 'resend' : result.provider === 'smtp' ? 'smtp' : 'resend',
      result.providerMessageId,
      result.errorCode,
      result.error
    )

    await updateBookingStatus(booking.id, {
      guestEmailStatus: status,
      guestEmailError: result.errorCode || result.error || null,
      guestEmailSentAt: result.ok ? new Date() : null,
    })
  } catch (error: any) {
    serverLogBuffer.error('[NOTIFY] Guest email exception', {
      bookingId: booking.id,
      error: error?.message,
    })
    summary.guestEmail = 'failed'
  }

  // Owner email
  try {
    const template = getOwnerNewRequestEmail(bookingData)
    const result = await sendEmail({
      to: env.OWNER_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    const status: NotificationStatus = result.ok ? 'sent' : result.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED' ? 'disabled' : 'failed'
    summary.ownerEmail = status

    if (!result.ok && result.errorCode) {
      if (result.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED') {
        // Only add warning once if not already present
        if (!summary.warnings.includes('NO_EMAIL_PROVIDER_CONFIGURED')) {
          summary.warnings.push('NO_EMAIL_PROVIDER_CONFIGURED')
        }
      }
    }

    await logNotification(
      booking.id,
      'owner',
      'email',
      'owner_new_request',
      result.ok ? 'sent' : 'failed',
      result.provider === 'resend' ? 'resend' : result.provider === 'smtp' ? 'smtp' : 'resend',
      result.providerMessageId,
      result.errorCode,
      result.error
    )

    await updateBookingStatus(booking.id, {
      ownerEmailStatus: status,
      ownerEmailError: result.errorCode || result.error || null,
      ownerEmailSentAt: result.ok ? new Date() : null,
    })
  } catch (error: any) {
    serverLogBuffer.error('[NOTIFY] Owner email exception', {
      bookingId: booking.id,
      error: error?.message,
    })
    summary.ownerEmail = 'failed'
  }

  // Owner SMS
  try {
    const result = await sendSms({
      to: env.SMS_TO_NUMBER || env.OWNER_PHONE,
      body: formatOwnerSmsMessage(booking, bookingData),
    })

    const status: NotificationStatus = result.ok ? 'sent' : result.errorCode === 'TWILIO_NOT_CONFIGURED' ? 'disabled' : 'failed'
    summary.ownerSms = status

    if (!result.ok && result.errorCode === 'TWILIO_NOT_CONFIGURED') {
      summary.warnings.push('TWILIO_NOT_CONFIGURED')
    }

    await logNotification(
      booking.id,
      'owner',
      'sms',
      'owner_new_request',
      result.ok ? 'sent' : 'failed',
      'twilio',
      result.providerMessageId,
      result.errorCode,
      result.error
    )

    await updateBookingStatus(booking.id, {
      ownerSmsStatus: status,
      ownerSmsError: result.errorCode || result.error || null,
      ownerSmsSentAt: result.ok ? new Date() : null,
    })
  } catch (error: any) {
    serverLogBuffer.error('[NOTIFY] Owner SMS exception', {
      bookingId: booking.id,
      error: error?.message,
    })
    summary.ownerSms = 'failed'
  }

  // Guest SMS (only if enabled and phone provided)
  if (env.ENABLE_GUEST_SMS && booking.phone) {
    try {
      const result = await sendSms({
        to: booking.phone,
        body: `Arka Acres: We received your booking request (ID: ${booking.id}). We'll confirm shortly.`,
      })

      const status: NotificationStatus = result.ok ? 'sent' : result.errorCode === 'TWILIO_NOT_CONFIGURED' ? 'disabled' : 'failed'
      summary.guestSms = status

      if (!result.ok && result.errorCode === 'TWILIO_NOT_CONFIGURED') {
        if (!summary.warnings.includes('TWILIO_NOT_CONFIGURED')) {
          summary.warnings.push('TWILIO_NOT_CONFIGURED')
        }
      }

      await logNotification(
        booking.id,
        'guest',
        'sms',
        'guest_receipt',
        result.ok ? 'sent' : 'failed',
        'twilio',
        result.providerMessageId,
        result.errorCode,
        result.error
      )
    } catch (error: any) {
      serverLogBuffer.error('[NOTIFY] Guest SMS exception', {
        bookingId: booking.id,
        error: error?.message,
      })
      summary.guestSms = 'failed'
    }
  } else {
    summary.guestSms = 'not_sent'
  }

  // One clean summary log line
  const sentCount = [
    summary.guestEmail,
    summary.ownerEmail,
    summary.ownerSms,
    summary.guestSms,
  ].filter(s => s === 'sent').length

  const failedCount = [
    summary.guestEmail,
    summary.ownerEmail,
    summary.ownerSms,
    summary.guestSms,
  ].filter(s => s === 'failed').length

  const disabledCount = [
    summary.guestEmail,
    summary.ownerEmail,
    summary.ownerSms,
    summary.guestSms,
  ].filter(s => s === 'disabled').length

  serverLogBuffer.info('[NOTIFY] Booking notifications summary', {
    bookingId: booking.id,
    sent: sentCount,
    failed: failedCount,
    disabled: disabledCount,
    warnings: summary.warnings,
  })

  return summary
}

function formatOwnerSmsMessage(booking: BookingWithUnit, bookingData: any): string {
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

  return sms
}

// Legacy exports for backward compatibility
export async function sendGuestReceipt(booking: BookingWithUnit, force: boolean = false) {
  const summary = await sendBookingNotifications(booking, force)
  return {
    ok: summary.guestEmail === 'sent',
    error: summary.guestEmail === 'disabled' ? 'NO_EMAIL_PROVIDER_CONFIGURED' : summary.guestEmail === 'failed' ? 'SEND_FAILED' : undefined,
  }
}

export async function sendOwnerNewRequest(booking: BookingWithUnit, force: boolean = false) {
  const summary = await sendBookingNotifications(booking, force)
  return {
    ok: summary.ownerEmail === 'sent',
    error: summary.ownerEmail === 'disabled' ? 'NO_EMAIL_PROVIDER_CONFIGURED' : summary.ownerEmail === 'failed' ? 'SEND_FAILED' : undefined,
  }
}

export async function sendOwnerSms(booking: BookingWithUnit, force: boolean = false) {
  const summary = await sendBookingNotifications(booking, force)
  return {
    ok: summary.ownerSms === 'sent',
    error: summary.ownerSms === 'disabled' ? 'TWILIO_NOT_CONFIGURED' : summary.ownerSms === 'failed' ? 'SEND_FAILED' : undefined,
  }
}

export async function sendGuestSmsReceipt(booking: BookingWithUnit, force: boolean = false) {
  const summary = await sendBookingNotifications(booking, force)
  if (summary.guestSms === 'not_sent') {
    return { ok: false, error: 'Guest SMS disabled or no phone number' }
  }
  return {
    ok: summary.guestSms === 'sent',
    error: summary.guestSms === 'disabled' ? 'TWILIO_NOT_CONFIGURED' : summary.guestSms === 'failed' ? 'SEND_FAILED' : undefined,
  }
}

export async function sendGuestConfirmed(booking: BookingWithUnit, force: boolean = false) {
  const env = getEnvSafe()
  const bookingData = formatBookingData(booking)
  const template = getGuestConfirmedEmail(bookingData)
  
  const result = await sendEmail({
    to: booking.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })

  const status: NotificationStatus = result.ok ? 'sent' : result.errorCode === 'NO_EMAIL_PROVIDER_CONFIGURED' ? 'disabled' : 'failed'

  await logNotification(
    booking.id,
    'guest',
    'email',
    'guest_confirmed',
    result.ok ? 'sent' : 'failed',
    result.provider === 'resend' ? 'resend' : result.provider === 'smtp' ? 'smtp' : 'resend',
    result.providerMessageId,
    result.errorCode,
    result.error
  )

  await updateBookingStatus(booking.id, {
    guestEmailStatus: status,
    guestEmailError: result.errorCode || result.error || null,
    guestEmailSentAt: result.ok ? new Date() : null,
  })

  return {
    ok: result.ok,
    error: result.errorCode || result.error,
  }
}


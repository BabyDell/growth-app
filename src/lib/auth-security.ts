"use server"
import prisma from "@/config/prisma"

const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15

/**
 * Checks if a login attempt should be rate limited based on recent failed attempts
 * from the same email address or IP address.
 * 
 * @param email The email address being used for login
 * @returns Boolean indicating if the request should be rate limited
 */
export async function isRateLimited(email: string): Promise<boolean> {
  const ip = await getClientIP()
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  
  // Check for existing rate limit record
  const emailAttempts = await prisma.authAttempt.count({
    where: {
      identifier: email,
      success: false,
      createdAt: {
        gte: windowStart
      }
    }
  })
  
  // Also check IP-based attempts to prevent attackers from trying different emails
  const ipAttempts = await prisma.authAttempt.count({
    where: {
      ipAddress: ip,
      success: false,
      createdAt: {
        gte: windowStart
      }
    }
  })
  
  return emailAttempts >= MAX_LOGIN_ATTEMPTS || ipAttempts >= MAX_LOGIN_ATTEMPTS * 2
}

/**
 * Masks an email address for logging purposes to protect user privacy
 * Example: j***@example.com
 */
export async function maskEmail(email: string): Promise<string> {
  const [username, domain] = email.split('@')
  if (!username || !domain) return '***@***'
  
  return `${username.charAt(0)}${'*'.repeat(username.length - 1)}@${domain}`
}

/**
 * Gets the client IP address from the request headers
 * Falls back to a placeholder if not available
 */
export async function getClientIP(): Promise<string> {
  // In a real implementation, you would extract this from request headers
  // This is a simplified version
  const headersResult = await headers()
  const forwardedFor = headersResult.get('x-forwarded-for')
  const realIp = headersResult.get('x-real-ip')
  
  return forwardedFor?.split(',')[0] || realIp || '0.0.0.0'
}

// Helper function to get request headers
async function headers() {
  // This is a simplified implementation
  // In a real app, you would use the headers from the request object
  return {
    get(name: string): string | null {
      // In production, you would access the actual headers
      console.log('Getting header:', name)
      return null
    }
  }
}

/**
 * Records authentication events for security monitoring and audit purposes
 * 
 * @param event The authentication event details to log
 */
export async function logAuthEvent(event: {
    type: 'login_success' | 'login_failed' | 'signup' | 'logout' | 'password_reset' | 'password_change';
    userId?: string;
    email?: string;
    ip: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      // Store the event in the database
      await prisma.authAttempt.create({
        data: {
          identifier: event.email || event.userId || 'unknown',
          ipAddress: event.ip,
          userAgent: event.userAgent || '',
          success: event.type.includes('success'),
          eventType: event.type,
        }
      })
      
      // For critical security events, you might want additional logging
      if (event.type === 'password_reset' || event.type === 'password_change') {
        // In a production system, you might send alerts or notifications here
        console.info(`Security event: ${event.type} for user ${event.userId || event.email}`)
      }
      
    } catch (error) {
      // Log the error but don't expose it to the user
      console.error('Failed to log auth event:', error)
      // In production, you might want to send this to an error monitoring service
    }
  }

// Firebase Admin SDK for server-side token verification
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'

let adminApp: App

function getAdminApp(): App {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured')
    }

    adminApp = initializeApp({
      credential: cert(JSON.parse(serviceAccount))
    })
  }

  return adminApp || getApps()[0]
}

// Verify Firebase ID token and return decoded token
export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
  try {
    const auth = getAuth(getAdminApp())
    const decodedToken = await auth.verifyIdToken(idToken)
    return decodedToken
  } catch (error: any) {
    console.error('Firebase token verification failed:', {
      code: error?.code,
      message: error?.message,
      // Log first 50 chars of token for debugging (safe - doesn't expose full token)
      tokenPrefix: idToken?.substring(0, 50) + '...'
    })
    return null
  }
}

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let app: App | undefined
let adminAuth: Auth | undefined

// Initialize Firebase Admin only once
function getAdminApp(): App {
  if (!app && getApps().length === 0) {
    try {
      // Parse the service account key, handling escaped newlines
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
      const serviceAccount = JSON.parse(serviceAccountJson.replace(/\\n/g, '\n'))

      app = initializeApp({
        credential: cert(serviceAccount),
      })
    } catch (error) {
      console.error('Firebase Admin init error:', error)
      throw new Error('Failed to initialize Firebase Admin')
    }
  }
  return app || getApps()[0]
}

function getAdminAuth(): Auth {
  if (!adminAuth) {
    getAdminApp()
    adminAuth = getAuth()
  }
  return adminAuth
}

export { getAdminAuth }

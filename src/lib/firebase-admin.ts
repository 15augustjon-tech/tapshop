import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let app: App | undefined
let adminAuth: Auth | undefined

function getAdminApp(): App {
  if (app) return app

  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    return app
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountJson) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
    throw new Error('Firebase Admin not configured')
  }

  try {
    // Handle both raw JSON and escaped JSON
    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountJson)
    } catch {
      // Try replacing escaped newlines
      serviceAccount = JSON.parse(serviceAccountJson.replace(/\\n/g, '\n'))
    }

    if (!serviceAccount.project_id) {
      console.error('Invalid service account: missing project_id')
      throw new Error('Invalid Firebase service account')
    }

    app = initializeApp({
      credential: cert(serviceAccount),
    })

    console.log('Firebase Admin initialized for project:', serviceAccount.project_id)
    return app
  } catch (error) {
    console.error('Firebase Admin init error:', error)
    throw new Error('Failed to initialize Firebase Admin')
  }
}

function getAdminAuth(): Auth {
  if (!adminAuth) {
    getAdminApp()
    adminAuth = getAuth()
  }
  return adminAuth
}

export { getAdminAuth }

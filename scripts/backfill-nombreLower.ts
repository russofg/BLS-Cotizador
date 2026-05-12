/**
 * Backfill script: adds `nombreLower` field to all cliente documents that are missing it.
 *
 * Run ONCE before deploying PR1 to production:
 *   npx tsx scripts/backfill-nombreLower.ts
 *
 * Safe to re-run: documents that already have `nombreLower` are skipped (0 writes).
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON, OR
 *   - Application Default Credentials configured via `gcloud auth application-default login`
 *   - FIREBASE_PROJECT_ID env var (or set it in .env.local)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const COLLECTION = 'clientes';
const BATCH_SIZE = 400; // Firestore max is 500 writes per batch

async function main() {
  // Initialize Firebase Admin if not already done
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (credPath) {
      const serviceAccount = await import(credPath, { assert: { type: 'json' } });
      initializeApp({ credential: cert(serviceAccount.default) });
    } else if (projectId) {
      initializeApp({ projectId });
    } else {
      console.error(
        'ERROR: Set FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS before running this script.'
      );
      process.exit(1);
    }
  }

  const db = getFirestore();

  console.log(`Scanning ${COLLECTION} collection for docs missing \`nombreLower\`...`);
  const snapshot = await db.collection(COLLECTION).get();

  const toUpdate = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.nombreLower === undefined || data.nombreLower === null;
  });

  console.log(`Total docs: ${snapshot.size}. Docs needing backfill: ${toUpdate.length}.`);

  if (toUpdate.length === 0) {
    console.log('Nothing to backfill. Exiting.');
    return;
  }

  let updated = 0;
  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = toUpdate.slice(i, i + BATCH_SIZE);

    for (const doc of chunk) {
      const nombre: string = doc.data().nombre ?? '';
      batch.update(doc.ref, { nombreLower: nombre.trim().toLowerCase() });
    }

    await batch.commit();
    updated += chunk.length;
    console.log(`  Committed ${updated}/${toUpdate.length} docs...`);
  }

  console.log(`Done. ${updated} documents updated.`);
}

main().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});

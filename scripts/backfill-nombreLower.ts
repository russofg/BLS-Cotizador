/**
 * Backfill script: adds `nombreLower` field to all cliente documents that are missing it.
 *
 * Run ONCE before deploying to production:
 *   npx tsx scripts/backfill-nombreLower.ts
 *
 * Safe to re-run: documents that already have `nombreLower` are skipped (0 writes).
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env') });

const COLLECTION = 'clientes';
const BATCH_SIZE = 400;

async function main() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        'ERROR: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in .env.local'
      );
      process.exit(1);
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
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

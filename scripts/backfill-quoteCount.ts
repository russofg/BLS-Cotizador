/**
 * Backfill script: computes real quoteCount for every cliente document.
 *
 * Run ONCE before deploying to production:
 *   npx tsx scripts/backfill-quoteCount.ts
 *
 * Safe to re-run: always recomputes from current cotizaciones state.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

config({ path: resolve(process.cwd(), '.env') });

const CLIENTES_COLLECTION = 'clientes';
const COTIZACIONES_COLLECTION = 'cotizaciones';
const BATCH_SIZE = 400;

async function main() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('ERROR: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in .env');
      process.exit(1);
    }

    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  const db = getFirestore();

  // 1. Count quotes per client
  console.log('📊 Reading all cotizaciones...');
  const quotesSnap = await db.collection(COTIZACIONES_COLLECTION).get();
  const countByClient = new Map<string, number>();

  for (const doc of quotesSnap.docs) {
    const data = doc.data();
    const clienteId = data.clienteId ?? data.cliente_id;
    if (clienteId) {
      countByClient.set(clienteId, (countByClient.get(clienteId) ?? 0) + 1);
    }
  }

  console.log(`📋 ${quotesSnap.size} cotizaciones → ${countByClient.size} clientes con cotizaciones`);

  // 2. Write quoteCount to each cliente document
  const clientesSnap = await db.collection(CLIENTES_COLLECTION).get();
  console.log(`👥 Updating ${clientesSnap.size} clientes...`);

  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of clientesSnap.docs) {
    const count = countByClient.get(doc.id) ?? 0;
    batch.update(doc.ref, { quoteCount: count });
    batchCount++;
    updated++;

    if (batchCount === BATCH_SIZE) {
      await batch.commit();
      console.log(`  ✅ Committed batch (${updated} docs so far)`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Done. Updated quoteCount on ${updated} cliente documents.`);
}

main().catch(err => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  try {
    const projectId = "cotizador-bls";
    const clientEmail = "firebase-adminsdk-fbsvc@cotizador-bls.iam.gserviceaccount.com";
    let privateKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWVy7veUkXjik8\\n55S2jJDC6zJGN7O/UfVS3Ix+gLZ+DGCjdjUzA83UN/lXy1veT0Y7iSK+rf+sPxYl\\n/y5V3Kk1Om4ezParFHvIBgXlqCx+s49aKbdDx/uHipR2BRDo8p4t9Axg4A+raxZK\\njGuC/t2jd3iBiyjhc3XDhJVgZb48lw5UetcM5kB/Du/zJCgK6sfskRED1yxepxXt\\nfv5Q97JW4jQB6uHMuZ05YxYVLrWyXSHJw+Hdj7ez/tKXhxjjqFzhivSOFxDawaNR\\nWwLhB2w1Ana0gqOK452byHihLxxRI7x5qDXVXYg6YOv50oRIIasGtMyBs6osQ8E8\\nIWmwY5gzAgMBAAECggEAASyeOKcUlfeONnbiVrFiHnuF9nt0p9SGJWk6EyW9qgFi\\nZMDKjvCq7XwOeeEdOVvjJtaBdl5P/A9Tie7EN6L8vyp3f9oq3ZAEbR/RPtE1t3tq\\nnm8SmBTmmRa9IhUEvNC8WcSK5ejevHvhdsX6GCNO9adjUzLiquFUjSaKr+ahtSh7\\nxFR6NYc4VjxWr/+5C7hbbX49y95kAEFhBdzYmgtOKl4eTl0a2Y+fmM9a7INT3rM4\\n9WZue9rtGMqm2y3DDZO/Wzp0CfhHkyDyTkF27S08wX4DFaTRmF4EMnuTU6gSFTS5\\n5fEtsTsWTxxTFrpHXm+kyF21Ns/Lnk9ipmOC2Rv5YQKBgQD9CHyj6laYpzuvV9FL\\nlC4YfbhMOmjelMOfrhm2nHSRsOQ/MojD49Z0+pGzvpTnRm5ls/1OCWsDyDo+lgLW\\niDpyLl3V5Lb0ytHU1EbM2Q3CWuBKDUu9/PqgRKAmxGUaPytFvprNUIzIidqiur5p\\nBm/UV5l+osvnIqix7lZubDfzAwKBgQDY2o4w4+RNG4DjMi9KfpuDjCOoWKB2oDVs\\ngppBp0zbEHEN3Y3A0goxtIqgexbogTEG2PoPam46/Pm6tiNXJzfEjvC2zPbku2xV\\nsR/QJPO9OLW2hh2TxUgZkaeus0zwe8SZwWfDyS3IsBBE8MRxMcl4c5HPvugadymc\\np78Bto0nEQKBgQDngi5X4v5cKRZItbZ+yhLqwYwv4nk0vTPHE4nfNILLEeejkt7j\\nK8B5wxAwPr0KZbx4PRgToDZTfY0c2i+6jWW8NoQQQXTLwA4ABkDJCAa4vmDcIBIe\\nwCmnHWLSVXqTaxxycZQ9KefFS6vIm8e/W+5Rf9ymqtiYn3NtaL2XxlfidQKBgFWo\\n/8IQQ36x/pfAmy2yFXxBP1SgrcIuRuw2KvkEPTfLptzzR6uDTMOVraz28nWlkthB\\nnYW5ZRGoHH3EtPEYbM8YJ74N+PkhkAnJjeeKsT1tyVnwYH6ez3xKLRK1gQ791Qtn\\nerW8InnEEqko8nBEWnFaNZ76qnTJ3YYkPS9QDTIBAoGBAKbm3g0sQnzpTJhGbWNs\\nUx6POzIuCHdhvvV9hOLKYxBddkEtDZ7UaK8lGRxD/Ig38QN3hM1XvN6OxpgcvJQ5\\neCUKtIQrJerO77NN6etQDj24lxNaFGz595Y+U0K8A+6uLWKx4160KJBDnQGocLd+\\nxunrAHHwtXnmJQ3BvHxuyasK\\n-----END PRIVATE KEY-----\\n";
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    if (!projectId || !clientEmail || !privateKey) {
      console.warn("Firebase Admin SDK no está inicializado completamente. Faltan variables de entorno (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
    } else {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log("Firebase Admin inicializado correctamente.");
    }
  } catch (error) {
    console.error("Error inicializando Firebase Admin SDK:", error);
  }
}
const adminDb = getFirestore();
getAuth();

export { adminDb as a };

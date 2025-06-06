// Custom environment variable declarations for CardiCare
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DRUG_INTERACTION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

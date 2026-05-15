/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { uid: string; email?: string; emailVerified?: boolean } | null;
  }
}

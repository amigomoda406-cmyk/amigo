// src/app/(store)/error.tsx

'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page" style={{ padding: '64px 16px', textAlign: 'center' }}>
      <motion.div
        className="error-page__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="error-page__icon" style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 className="error-page__title" style={{ marginBottom: '8px' }}>Une erreur est survenue</h2>
        <p className="error-page__message" style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Nous travaillons à résoudre ce problème.
        </p>
        
        <div className="error-page__actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--gradient-accent)', border: 'none', color: 'white', borderRadius: '8px' }}
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--color-bg-elevated)', color: 'white', borderRadius: '8px' }}>
            <Home size={16} />
            Accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

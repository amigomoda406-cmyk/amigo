// src/app/(store)/loading.tsx

export default function Loading() {
  return (
    <div className="home-skeleton">
      {/* Hero Skeleton */}
      <div className="skeleton" style={{ height: '420px', borderRadius: 0 }} />
      
      {/* Section Skeleton */}
      <div style={{ padding: '32px 16px' }}>
        <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '20px' }} />
        <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              <div className="skeleton" style={{ width: '150px', height: '180px', borderRadius: '16px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '120px', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: '16px', width: '80px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

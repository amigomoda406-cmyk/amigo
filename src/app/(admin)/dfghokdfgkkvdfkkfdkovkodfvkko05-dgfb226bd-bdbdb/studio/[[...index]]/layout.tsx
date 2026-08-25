// src/app/studio/[[...index]]/layout.tsx
export const metadata = {
  title: 'Sanity Studio',
  description: 'Sanity Studio for Amigo Moda',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

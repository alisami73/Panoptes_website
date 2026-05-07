export default function AccessDeniedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,80,96,0.1)',
          border: '1px solid rgba(255,80,96,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          fontSize: 32,
        }}
      >
        🔒
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.3em',
          color: 'rgba(255,80,96,0.8)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Accès refusé
      </div>

      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 48,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}
      >
        Lien invalide ou expiré
      </h1>

      <p style={{ color: 'rgba(232,237,242,0.65)', fontSize: 18, maxWidth: 480, lineHeight: 1.6, margin: '0 0 40px' }}>
        Votre lien d&apos;accès n&apos;est plus valide. Demandez un nouvel accès en remplissant le formulaire.
      </p>

      <a
        href="/#access"
        style={{
          background: '#00C2CB',
          color: '#0D1B2A',
          fontWeight: 700,
          padding: '16px 40px',
          borderRadius: 6,
          textDecoration: 'none',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 16,
        }}
      >
        Demander un accès
      </a>
    </div>
  )
}

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '28px'
            }}>
              ✈
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#ffffff' }}>
              Voyage Travel Platform
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              The application encountered a temporary display state. You can restore the session below.
            </p>
            {this.state.error && (
              <div style={{
                backgroundColor: '#030712',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#f87171',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '24px',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#06b6d4',
                color: '#04131b',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

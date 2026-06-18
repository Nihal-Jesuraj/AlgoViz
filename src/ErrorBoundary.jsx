import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#222', color: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f87171' }}>React Application Crashed</h1>
          <p style={{ fontSize: '18px' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ background: '#000', padding: '15px', overflow: 'auto', color: '#a78bfa' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

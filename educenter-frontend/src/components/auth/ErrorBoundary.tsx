import React from 'react';

type State = { hasError: boolean; error?: any };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: any, _info: any) {
    // TODO: send to logging
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 24}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace: 'pre-wrap'}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;

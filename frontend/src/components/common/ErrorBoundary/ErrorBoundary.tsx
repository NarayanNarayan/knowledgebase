import * as React from 'react';
import { Button } from '../Button';
import { Card, CardContent, CardFooter } from '../Card';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className={styles.container}>
          <Card variant="outlined" padding="lg">
            <CardContent>
              <h2 className={styles.title}>Something went wrong</h2>
              <p className={styles.message}>{this.state.error.message}</p>
              {process.env.NODE_ENV === 'development' && (
                <pre className={styles.stack}>{this.state.error.stack}</pre>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={this.resetError}>Try again</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}


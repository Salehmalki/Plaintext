import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary captured error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-800 font-sans"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-900 m-0">
              حدث خطأ أثناء تشغيل التطبيق
            </h2>
            <p className="text-sm text-slate-600">
              {this.state.error?.message || 'يرجى إعادة المحاولة لتحديث الصفحة.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-2.5 px-5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function mountApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element #root not found in document!');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('App successfully mounted into #root');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Fatal error rendering root:', error);
    rootElement.innerHTML = `
      <div style="direction:rtl;padding:24px;color:#991b1b;background:#fef2f2;border:2px solid #ef4444;border-radius:14px;margin:20px auto;max-width:550px;text-align:center;font-family:sans-serif;">
        <h3 style="margin-top:0;">تعذر تشغيل التطبيق</h3>
        <p style="font-family:monospace;direction:ltr;background:#fff;padding:8px;border-radius:6px;border:1px solid #fecdd3;">${error?.message || String(err)}</p>
        <button onclick="window.location.reload()" style="padding:8px 16px;background:#dc2626;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">إعادة تحميل الصفحة</button>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    }).catch(err => {
      console.warn("Failed to load web-vitals", err);
    });
  }
}

// Global Performance Tracker Setup
export function initPerformanceTelemetry() {
  if (typeof window === 'undefined') return;
  
  reportWebVitals((metric) => {
    // In a real startup, send this to Datadog, Sentry, or Google Analytics
    if (metric.value > 2500) {
      console.warn(`[Sovg'a Telemetry] ⚠️ Poor performance detected on ${metric.name}: ${Math.round(metric.value)}ms`);
    } else {
      // console.log(`[Sovg'a Telemetry] ${metric.name}: ${Math.round(metric.value)}ms`);
    }
  });
}

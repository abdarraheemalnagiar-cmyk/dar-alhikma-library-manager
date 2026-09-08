type ClientErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

// Reports a client-side error for logging/observability.
// Currently logs to the console; wire this up to your own error-tracking
// service (Sentry, LogRocket, a custom endpoint, etc.) if you want alerting.
export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[client-error]", message, {
    route: window.location.pathname,
    ...context,
    ...(stack !== undefined && { stack }),
  });
}

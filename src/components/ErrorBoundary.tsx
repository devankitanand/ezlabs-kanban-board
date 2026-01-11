import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        const lastErrorTime = sessionStorage.getItem("lastErrorTime");
        const now = Date.now();

        // Prevent infinite reload loops: check if last error was less than 5 seconds ago
        if (lastErrorTime && now - parseInt(lastErrorTime) < 5000) {
            console.error("Crash loop detected, stopping auto-refresh.");
            // We purposefully do not reload here to allow the fallback UI to be seen
            // and to stop the browser from freezing.
            return;
        }

        sessionStorage.setItem("lastErrorTime", now.toString());

        // Attempt auto-refresh
        window.location.reload();
    }

    public render() {
        if (this.state.hasError) {
            const lastErrorTime = sessionStorage.getItem("lastErrorTime");
            const now = Date.now();
            const isLoop = lastErrorTime && now - parseInt(lastErrorTime) < 5000;

            if (!isLoop) {
                // If we are about to reload, we might render nothing or a loader
                return null;
            }

            // Fallback UI if we are in a crash loop
            return (
                <div style={{ padding: "20px", textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
                    <h1>Something went wrong.</h1>
                    <p>We detected a crash loop and stopped auto-refreshing.</p>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem("lastErrorTime");
                            window.location.reload();
                        }}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "5px"
                        }}
                    >
                        Try Refreshing Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

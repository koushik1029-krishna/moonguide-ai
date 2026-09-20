import { Component } from "react";
import Button from "./ui/Button.jsx";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep unexpected render errors off the screen. Do not display stack traces.
  }

  handleReload = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <p className="brand-kicker">Moon's Food Store</p>
          <h1>MoonGuide AI hit an unexpected problem</h1>
          <p>
            Please reload the page. If this continues, ask a store employee for help.
            Your saved chat may still be available after reload.
          </p>
          <Button type="button" onClick={this.handleReload}>
            Reload MoonGuide AI
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

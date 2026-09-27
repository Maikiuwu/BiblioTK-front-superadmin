import { Component } from "react";

export default class AppErrorBoundary extends Component {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error("Uncaught application error", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<main className="grid min-h-screen place-items-center p-6 text-center" role="alert">
					<div>
						<h1 className="text-xl font-semibold">No se pudo cargar la aplicación</h1>
						<p className="mt-2">Actualiza la página para volver a intentarlo.</p>
					</div>
				</main>
			);
		}

		return this.props.children;
	}
}
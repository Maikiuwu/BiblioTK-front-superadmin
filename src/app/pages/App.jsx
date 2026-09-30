import { lazy, Suspense, useEffect, useState } from "react";
import { PanelLayout } from "bibliotk-ui";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { getCurrentSession, logoutUser } from "../../service/LoginService.js";

import Home from "./Home.jsx";

// El resumen llega en el paquete inicial; la dona de usuarios se descarga aparte
const cargarUserDashboard = () => import("./UserDashboard.jsx");
const UserDashboard = lazy(cargarUserDashboard);

// La sesión se pide apenas carga el módulo, sin esperar al primer render
const sesionInicial = getCurrentSession().then(
	(session) => ({ session }),
	(error) => ({ error }),
);

const LOGIN_URL = import.meta.env.VITE_LOGIN_APP_URL ?? "http://localhost:5172";

function getSessionUser(session) {
	return session?.user ?? session ?? null;
}

function getSessionRole(user) {
	return String(user?.rol ?? user?.role ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "");
}

function ProtectedApp() {
	const [user, setUser] = useState(null);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		let isActive = true;

		sesionInicial.then(({ session, error }) => {
			if (!isActive) return;

			if (error) {
				setStatus("unauthenticated");
				return;
			}

			const currentUser = getSessionUser(session);
			setUser(currentUser);
			setStatus(
				getSessionRole(currentUser) === "superadmin" ? "ready" : "forbidden",
			);
		});

		return () => {
			isActive = false;
		};
	}, []);

	useEffect(() => {
		// Sin sesión o con otro rol: esta app no tiene "/" propio, se vuelve a la landing.
		// El motivo viaja por la URL porque no hay forma de pasar estado de React entre apps.
		if (status === "unauthenticated") {
			window.location.assign(`${LOGIN_URL}/login?motivo=sesion_expirada`);
		} else if (status === "forbidden") {
			window.location.assign(`${LOGIN_URL}/login?motivo=sin_permiso`);
		} else if (status === "ready") {
			// Con el panel en pantalla, la dona se baja cuando el navegador queda libre
			if ("requestIdleCallback" in window) {
				requestIdleCallback(cargarUserDashboard);
			} else {
				setTimeout(cargarUserDashboard, 200);
			}
		}
	}, [status]);

	async function handleLogout() {
		try {
			await logoutUser();
		} finally {
			window.location.assign(LOGIN_URL);
		}
	}

	if (status !== "ready") return null;

	return (
		<Routes>
			<Route
				element={
					<PanelLayout
						navItems={[
							{ to: "/HomeSuperAdmin", label: "Resumen", end: true },
							{ to: "/usuarios", label: "Usuarios" },
						]}
						homePath="/HomeSuperAdmin"
						userLabel={user?.email ?? user?.correo}
						onLogout={handleLogout}
					>
						<Suspense fallback={null}>
							<Outlet />
						</Suspense>
					</PanelLayout>
				}
			>
				<Route path="/HomeSuperAdmin" element={<Home />} />
				<Route path="/usuarios" element={<UserDashboard />} />
			</Route>
			<Route path="*" element={<Navigate to="/HomeSuperAdmin" replace />} />
		</Routes>
	);
}

function App() {
	return <ProtectedApp />;
}

export default App;

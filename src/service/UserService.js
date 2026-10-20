const usersDashboardUrl =
	import.meta.env.VITE_USERS_DASHBOARD_URL ??
	"http://localhost:3004/DashboardBibliotk/Udashboard";

export async function getUserRoleStats() {
	let response;

	try {
		// La cookie de sesión viaja con la petición: el dashboard solo responde a un superadministrador
		response = await fetch(usersDashboardUrl, {
			credentials: "include",
			cache: "no-store",
		});
	} catch {
		throw new Error("No se pudo conectar con el servicio de estadísticas.");
	}

	if (!response.ok) {
		throw new Error("No se pudieron obtener las estadísticas de usuarios.");
	}

	return await response.json();
}

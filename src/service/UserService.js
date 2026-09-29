const usersDashboardUrl =
	import.meta.env.VITE_USERS_DASHBOARD_URL ??
	"http://localhost:3004/DashboardBibliotk/Udashboard";

export async function getUserRoleStats() {
	let response;

	try {
		response = await fetch(usersDashboardUrl, {
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

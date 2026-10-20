const usersDashboardUrl =
	import.meta.env.VITE_USERS_DASHBOARD_URL ??
	"http://localhost:3004/DashboardBibliotk/Udashboard";

// Las cuentas viven en el mismo servicio: /DashboardBibliotk/Usuarios
const usuariosUrl = usersDashboardUrl.replace(/Udashboard$/, "Usuarios");

// La cookie de sesión viaja con cada petición: el dashboard solo responde a un superadministrador
async function pedir(url, opciones, mensajeError) {
	let response;

	try {
		response = await fetch(url, {
			credentials: "include",
			cache: "no-store",
			...opciones,
		});
	} catch {
		throw new Error("No se pudo conectar con el servicio de usuarios.");
	}

	const cuerpo = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(cuerpo.message ?? mensajeError);
	}

	return cuerpo;
}

export function getUserRoleStats() {
	return pedir(
		usersDashboardUrl,
		{},
		"No se pudieron obtener las estadísticas de usuarios.",
	);
}

export async function listUsuarios() {
	const { usuarios } = await pedir(
		usuariosUrl,
		{},
		"No se pudo obtener la lista de usuarios.",
	);
	return usuarios ?? [];
}

export function cambiarRolUsuario(id, rol) {
	return pedir(
		`${usuariosUrl}/${id}/rol`,
		{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ rol }),
		},
		"No se pudo cambiar el rol.",
	);
}

import { ArrowsClockwise } from "@phosphor-icons/react/ArrowsClockwise";
import { UsersThree } from "@phosphor-icons/react/UsersThree";
import { Alert, Button, DonutChart } from "bibliotk-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserRoleStats } from "../../service/UserService.js";

// El color sigue al rol (nunca a su posición): si un rol queda en 0 los demás no cambian de color
const roles = [
	{ key: "admin", label: "Bibliotecarios", color: "var(--color-role-admin)" },
	{ key: "usuario", label: "Usuarios", color: "var(--color-role-usuario)" },
	{
		key: "superadmin",
		label: "Super administradores",
		color: "var(--color-role-superadmin)",
	},
];

function UserDashboard() {
	const [roleStats, setRoleStats] = useState({
		admin: 0,
		usuario: 0,
		superadmin: 0,
	});
	const [status, setStatus] = useState("loading");
	const [errorMessage, setErrorMessage] = useState("");
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const loadRoleStats = useCallback(() => {
		setStatus("loading");

		getUserRoleStats()
			.then((data) => {
				if (!isMountedRef.current) return;
				setRoleStats({
					admin: Number(data?.roles?.admin ?? 0),
					usuario: Number(data?.roles?.usuario ?? 0),
					superadmin: Number(data?.roles?.superadmin ?? 0),
				});
				setStatus("success");
			})
			.catch((error) => {
				if (!isMountedRef.current) return;
				console.error("Error al obtener roles:", error);
				setErrorMessage(error.message);
				setStatus("error");
			});
	}, []);

	useEffect(() => {
		loadRoleStats();
	}, [loadRoleStats]);

	const totalUsers = useMemo(
		() => Object.values(roleStats).reduce((total, value) => total + value, 0),
		[roleStats],
	);

	const segments = useMemo(
		() => roles.map((role) => ({ ...role, value: roleStats[role.key] ?? 0 })),
		[roleStats],
	);

	return (
		<>
			<header className="motion-safe:animate-rise">
				<h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-pine-950">
					Usuarios registrados
				</h1>
				<p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
					Consulta la distribución de usuarios según su rol en la biblioteca.
				</p>
			</header>

			{status === "loading" && (
				<div
					aria-busy="true"
					className="mt-10 rounded-[28px] bg-sand-50 p-6 shadow-[inset_0_0_0_1px_var(--color-sand-200)] md:p-10"
				>
					<span className="block h-4 w-32 animate-pulse rounded-full bg-sand-200" />
					<div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
						<span className="mx-auto block size-60 animate-pulse rounded-full border-[28px] border-sand-200 sm:size-64 md:size-72" />
						<div className="grid gap-3">
							{roles.map((role) => (
								<span
									key={role.key}
									className="block h-12 w-full animate-pulse rounded-2xl bg-sand-200"
								/>
							))}
						</div>
					</div>
					<p className="sr-only">Cargando distribución de usuarios</p>
				</div>
			)}

			{status === "error" && (
				<div className="mt-10 rounded-[28px] bg-sand-50 p-6 shadow-[inset_0_0_0_1px_var(--color-sand-200)] md:p-10">
					<Alert tone="error">
						No se pudieron obtener las estadísticas de usuarios. {errorMessage}
					</Alert>
					<Button className="mt-6" onClick={loadRoleStats}>
						<ArrowsClockwise aria-hidden="true" className="size-[18px]" />
						Reintentar
					</Button>
				</div>
			)}

			{status === "success" && (
				<section className="mt-10 rounded-[28px] bg-sand-50 p-6 shadow-[inset_0_0_0_1px_var(--color-sand-200)] motion-safe:animate-rise md:p-10 [animation-delay:80ms]">
					{totalUsers === 0 ? (
						<div className="grid place-items-center gap-3 py-12 text-center">
							<span className="grid size-12 place-items-center rounded-2xl bg-pine-900 text-honey-300">
								<UsersThree aria-hidden="true" className="size-6" />
							</span>
							<strong className="font-display text-xl font-extrabold tracking-[-0.03em] text-pine-950">
								Aún no hay usuarios registrados
							</strong>
							<p className="max-w-xs text-sm text-ink-soft">
								Cuando alguien cree una cuenta, su rol aparecerá en esta
								distribución.
							</p>
						</div>
					) : (
						<figure className="m-0">
							<figcaption className="text-sm font-medium text-ink-soft">
								Usuarios por rol
							</figcaption>
							<DonutChart
								className="mt-8"
								segments={segments}
								totalLabel={
									totalUsers === 1 ? "usuario en total" : "usuarios en total"
								}
							/>
						</figure>
					)}
				</section>
			)}
		</>
	);
}

export default UserDashboard;

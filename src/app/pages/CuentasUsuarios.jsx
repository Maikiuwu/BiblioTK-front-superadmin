import { ArrowsClockwise } from "@phosphor-icons/react/ArrowsClockwise";
import {
	Alert,
	Button,
	cn,
	formatDate,
	inputClasses,
	TextField,
} from "bibliotk-ui";
import { useEffect, useMemo, useState } from "react";
import {
	cambiarRolUsuario,
	listUsuarios,
} from "../../service/UserService.js";

const nombresRol = {
	usuario: "Lector",
	admin: "Bibliotecario",
	superadmin: "Superadministrador",
};
const opcionesRol = Object.entries(nombresRol);

const sinTildes = (texto) =>
	texto
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const nombreCompleto = (usuario) =>
	`${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim() ||
	usuario.email ||
	"Sin nombre";

// Todas las cuentas con su rol. El superadministrador elige otro rol y guarda; la propia cuenta
// no se puede cambiar (así siempre queda al menos un superadministrador)
function CuentasUsuarios({ onCambio }) {
	const [usuarios, setUsuarios] = useState([]);
	const [estado, setEstado] = useState("cargando");
	const [error, setError] = useState("");
	const [recarga, setRecarga] = useState(0);
	const [busqueda, setBusqueda] = useState("");
	const [filtroRol, setFiltroRol] = useState("todos");
	const [pendientes, setPendientes] = useState({});
	const [guardando, setGuardando] = useState(null);
	const [aviso, setAviso] = useState(null);

	useEffect(() => {
		let activo = true;

		listUsuarios().then(
			(lista) => {
				if (!activo) return;
				setUsuarios(lista);
				setPendientes({});
				setEstado("listo");
			},
			(problema) => {
				if (!activo) return;
				setError(problema.message);
				setEstado("error");
			},
		);

		return () => {
			activo = false;
		};
	}, [recarga]);

	function recargar() {
		setEstado("cargando");
		setAviso(null);
		setRecarga((n) => n + 1);
	}

	const visibles = useMemo(() => {
		const texto = sinTildes(busqueda.trim());

		return usuarios.filter(
			(usuario) =>
				(filtroRol === "todos" || usuario.rol === filtroRol) &&
				(!texto ||
					sinTildes(
						`${nombreCompleto(usuario)} ${usuario.email ?? ""} ${usuario.nombreUsuario ?? ""}`,
					).includes(texto)),
		);
	}, [usuarios, busqueda, filtroRol]);

	async function guardar(usuario) {
		const rol = pendientes[usuario.id];
		setGuardando(usuario.id);
		setAviso(null);

		try {
			await cambiarRolUsuario(usuario.id, rol);
			setUsuarios((lista) =>
				lista.map((u) => (u.id === usuario.id ? { ...u, rol } : u)),
			);
			setPendientes((actuales) => {
				const copia = { ...actuales };
				delete copia[usuario.id];
				return copia;
			});
			setAviso({
				tono: "success",
				texto: `${nombreCompleto(usuario)} ahora es ${nombresRol[rol].toLowerCase()}. Si tenía la sesión abierta, pasa sola a la app de su nuevo rol.`,
			});
			onCambio?.();
		} catch (problema) {
			setAviso({ tono: "error", texto: problema.message });
		} finally {
			setGuardando(null);
		}
	}

	return (
		<section className="mt-6 rounded-[28px] bg-sand-50 p-6 shadow-[inset_0_0_0_1px_var(--color-sand-200)] motion-safe:animate-rise md:p-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-pine-950">
						Todas las cuentas
					</h2>
					<p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
						Elige otro rol y guarda. El cambio vale de inmediato.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={recargar}>
					<ArrowsClockwise aria-hidden="true" className="size-4" />
					Actualizar
				</Button>
			</div>

			<div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
				<TextField
					id="buscar-cuenta"
					label="Buscar"
					type="search"
					placeholder="Nombre, correo o usuario"
					value={busqueda}
					onChange={(event) => setBusqueda(event.target.value)}
				/>
				<div className="btk-field">
					<label htmlFor="filtro-rol" className="btk-field__label">
						Rol
					</label>
					<select
						id="filtro-rol"
						className={inputClasses}
						value={filtroRol}
						onChange={(event) => setFiltroRol(event.target.value)}
					>
						<option value="todos">Todos</option>
						{opcionesRol.map(([valor, nombre]) => (
							<option key={valor} value={valor}>
								{nombre}
							</option>
						))}
					</select>
				</div>
			</div>

			{aviso && (
				<Alert tone={aviso.tono} className="mt-4">
					{aviso.texto}
				</Alert>
			)}

			{estado === "cargando" && (
				<div aria-busy="true" className="mt-6 grid gap-2">
					{[0, 1, 2].map((fila) => (
						<span
							key={fila}
							className="block h-14 animate-pulse rounded-2xl bg-sand-200"
						/>
					))}
					<p className="sr-only">Cargando cuentas</p>
				</div>
			)}

			{estado === "error" && (
				<div className="mt-6">
					<Alert tone="error">{error}</Alert>
					<Button className="mt-4" onClick={recargar}>
						Reintentar
					</Button>
				</div>
			)}

			{estado === "listo" &&
				(visibles.length === 0 ? (
					<p className="mt-6 text-sm text-ink-soft">
						Ninguna cuenta coincide con la búsqueda.
					</p>
				) : (
					<div className="mt-6 overflow-x-auto">
						<table className="w-full min-w-[42rem] border-collapse text-left text-sm">
							<thead>
								<tr className="text-xs font-semibold text-ink-soft">
									<th scope="col" className="py-2 pr-4 font-semibold">
										Cuenta
									</th>
									<th scope="col" className="py-2 pr-4 font-semibold">
										Registro
									</th>
									<th scope="col" className="py-2 pr-4 font-semibold">
										Rol
									</th>
									<th scope="col" className="py-2">
										<span className="sr-only">Guardar</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{visibles.map((usuario) => {
									const nombre = nombreCompleto(usuario);
									const rolElegido = pendientes[usuario.id] ?? usuario.rol;
									const cambiado = rolElegido !== usuario.rol;

									return (
										<tr key={usuario.id} className="border-t border-sand-200">
											<td className="py-3 pr-4">
												<div className="flex flex-wrap items-center gap-2 font-semibold text-pine-950">
													{nombre}
													{usuario.esYo && (
														<span className="rounded-full bg-honey-100 px-2 py-0.5 text-xs font-semibold text-honey-700">
															Tú
														</span>
													)}
													{!usuario.activo && (
														<span className="rounded-full bg-clay-50 px-2 py-0.5 text-xs font-semibold text-clay-700">
															Inactiva
														</span>
													)}
												</div>
												<div className="mt-0.5 text-ink-soft">
													{usuario.email}
													{usuario.nombreUsuario && ` · @${usuario.nombreUsuario}`}
												</div>
											</td>
											<td className="py-3 pr-4 whitespace-nowrap text-ink-soft">
												{formatDate(usuario.fechaRegistro) || "—"}
											</td>
											<td className="py-3 pr-4">
												<select
													aria-label={`Rol de ${nombre}`}
													title={
														usuario.esYo
															? "No puedes cambiar el rol de tu propia cuenta"
															: undefined
													}
													className={cn(inputClasses, "min-w-48")}
													value={rolElegido}
													disabled={usuario.esYo || guardando === usuario.id}
													onChange={(event) =>
														setPendientes((actuales) => ({
															...actuales,
															[usuario.id]: event.target.value,
														}))
													}
												>
													{opcionesRol.map(([valor, nombreRol]) => (
														<option key={valor} value={valor}>
															{nombreRol}
														</option>
													))}
												</select>
											</td>
											<td className="py-3 text-right">
												{cambiado && (
													<Button
														size="sm"
														loading={guardando === usuario.id}
														onClick={() => guardar(usuario)}
													>
														Guardar
													</Button>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				))}
		</section>
	);
}

export default CuentasUsuarios;

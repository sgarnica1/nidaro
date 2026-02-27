import { PerfilClient } from "./perfil-client";

export default function PerfilPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#111111]">Perfil</h1>
        <p className="text-[13px] text-[#6B7280] mt-1">Gestiona tu cuenta y preferencias</p>
      </div>
      <PerfilClient />
    </div>
  );
}

import { redirect } from "next/navigation";

export default function Page() {
  // Quando o usuário abrir a raiz "/", vai direto para a tela de login
  redirect("/login");
}

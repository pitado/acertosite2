import { redirect } from "next/navigation";

export default function Page() {
  // assim que carregar a home, redireciona automaticamente para /groups
  redirect("/groups");
}

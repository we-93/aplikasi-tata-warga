import { redirect } from "next/navigation";

export default function NotulenPageRedirect() {
  redirect("/dashboard/rt/notulen/rapat");
}

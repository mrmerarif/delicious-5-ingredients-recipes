
import { redirect } from "next/navigation";

/**
 * Redirect visitors from the main website address
 * to the default English homepage.
 *
 * Other supported languages:
 * /es    - Spanish
 * /pt-BR - Brazilian Portuguese
 */
export default function HomePage() {
  redirect("/en");
}

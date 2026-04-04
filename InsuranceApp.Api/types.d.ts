declare module "@tailwindcss/vite" {
  import type { Plugin } from "vite";
  const tailwind: () => Plugin;
  export default tailwind;
}

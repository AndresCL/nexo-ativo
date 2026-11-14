import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes utilitárias do Tailwind CSS resolvendo conflitos de especificidade.
 */
export function combinarClasses(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { init } from "@paralleldrive/cuid2";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function cuid() {
	return init({
		length: 16,
	});
}

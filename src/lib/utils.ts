import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateOffset(offsetDays: number, resetTime?: boolean) {
	const currentDate = new Date();
	const newDate = new Date();
	newDate.setDate(currentDate.getDate() + offsetDays);
	if (resetTime) newDate.setHours(0, 0, 0, 0);
	return newDate;
}

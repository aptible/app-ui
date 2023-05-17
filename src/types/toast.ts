import { StatusVariant } from "./helpers";

export interface Toast {
  id: number;
  type: StatusVariant;
  text: string;
  cta?: () => void;
  ctaText?: string;
  isActive: boolean;
  duration?: number;
  dismissAt: string;
}

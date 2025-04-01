
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export type ToasterToast = ToastProps;

export const toast = {
  ...sonnerToast,
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  warning: (message: string, options?: any) => sonnerToast.warning(message, options),
  // Compatibility with shadcn/ui toast
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  custom: (props: any) => sonnerToast.custom(props)
};

export const useToast = () => {
  return {
    toast,
    toasts: [] as ToasterToast[],
    dismiss: sonnerToast.dismiss
  };
};

import React from "react";
import { toast } from "sonner";

interface ToastProps {
  title: string;
  description: string;
  items?: { field: string; message: string };
  type: "success" | "info" | "warning" | "error";
  onDismiss?: () => void;
}

export default function Toaster({
  title,
  description,
  items,
  type,
  callback,
}: ToastProps) {
  const toastOptions = {
    description: (
      <>
        <p className="mt-1 text-sm">{description}</p>
        {items && items.length > 0 && (
          <dl className="mt-2">
            {items.map((item, index) => (
              <div key={index} className="text-sm">
                <dt className="font-semibold text-xs">{item.field}:</dt>
                <dd className="ml-4">{item.message}</dd>
              </div>
            ))}
          </dl>
        )}
      </>
    ),
    duration: 10000,
    position: "top-right",
    className: "z-50",
    onAutoClose: () => {
      console.log("onAutoClose se ha ejecutado");
      if (callback) {
        callback();
      }
    },
  };

  const toastTypeMap = {
    success: toast.success,
    info: toast.info,
    warning: toast.warning,
    error: toast.error,
  };

  const toastFunction = toastTypeMap[type] || toast;

  toastFunction(title, toastOptions);

  return null;
}

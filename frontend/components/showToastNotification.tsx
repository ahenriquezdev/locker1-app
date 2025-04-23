import { toast } from "sonner";
import { ApiResponse } from "@/lib/types";

type ToastOptions = {
  title?: string;
  onDismiss?: () => void;
};

export function showToastNotification(
  state: ApiResponse.Response,
  { title, onDismiss }: ToastOptions = {},
) {
  const { display, message, errors, success } = state;

  if (!display || (!message && (!errors || errors.length === 0))) return;

  const toastId = toast[success ? "success" : "error"](title || "", {
    description: (
      <div>
        {message && <p className="mb-2">{message}</p>}
        <code>
          {errors?.length > 0 &&
            errors.map((item, index) => (
              <div key={index}>
                <strong>{item.field}:</strong> {item.message}
              </div>
            ))}
        </code>
      </div>
    ),
    duration: 5000,
    position: "top-right",
    className: "z-50",
    onAutoClose: () => onDismiss?.(),
    onDismiss: () => onDismiss?.(),
  });

  return toastId;
}

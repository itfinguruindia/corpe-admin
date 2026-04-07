import { useEffect } from "react";
import type { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

let Swal: typeof import("sweetalert2").default | null = null;

const useSwal = () => {
  useEffect(() => {
    // Dynamically import SweetAlert2 on client side
    if (!Swal) {
      import("sweetalert2").then((module) => {
        Swal = module.default;
      });
    }
  }, []);

  const swal = async (
    options: SweetAlertOptions,
  ): Promise<SweetAlertResult> => {
    if (!Swal) {
      // Wait for SweetAlert2 to load
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (Swal) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 50);
      });
    }

    return Swal!.fire(options);
  };

  return swal;
};

export default useSwal;

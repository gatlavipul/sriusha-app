import { useEffect } from "react";

export default function NewProductPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/products";
    }
  }, []);

  return null;
}

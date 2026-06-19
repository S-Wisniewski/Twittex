import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/useAuth";

export function useAuthGate() {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  return (action: () => void): void => {
    if (isLoading) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }
    action();
  };
}

import FloatingDesktop from "./FloatingDesktop";
import { useDesktopArea } from "./useDesktopArea";

export default function Desktop() {
  const { desktop } = useDesktopArea();
  return <FloatingDesktop desktop={desktop} />;
}

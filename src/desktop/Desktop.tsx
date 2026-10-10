import CompactDesktop from "./CompactDesktop";
import FloatingDesktop from "./FloatingDesktop";
import { useDesktopArea } from "./useDesktopArea";

export default function Desktop() {
  const { desktop, compact } = useDesktopArea();
  return compact ? <CompactDesktop desktop={desktop} /> : <FloatingDesktop desktop={desktop} />;
}

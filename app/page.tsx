import TrackerClient from "./TrackerClient";
import { parseWorkbook } from "./utils/workbookParser";

// Server Component — শুধু ডেটা ফেচ (ui-rules.md §১)।
// UI লজিক, state, event handler সব TrackerClient-এ।
export default function Home() {
  const parts = parseWorkbook();
  return <TrackerClient parts={parts} />;
}

import { BasicChat } from "../BasicChat";

type ChatbarProps = {
  onClose: () => void;
};

export function Chatbar({ onClose }: ChatbarProps) {
  return <BasicChat onClose={onClose} />;
}

// Maps unit icon-name strings (from the DB seed) to lucide components.
// Keeping this explicit avoids shipping emoji and keeps the look consistent.
import {
  Calculator,
  BookText,
  Shapes,
  ListChecks,
  FunctionSquare,
  Triangle,
  BarChart3,
  Link as LinkIcon,
  Puzzle,
  PencilLine,
  BookOpen,
  Languages,
  Repeat,
  Newspaper,
  FilePen,
  Circle,
  type LucideIcon,
} from "lucide-react-native";

const MAP: Record<string, LucideIcon> = {
  calculator: Calculator,
  "book-text": BookText,
  shapes: Shapes,
  "list-checks": ListChecks,
  "function-square": FunctionSquare,
  "triangle-ruler": Triangle,
  "bar-chart-3": BarChart3,
  link: LinkIcon,
  puzzle: Puzzle,
  "pencil-line": PencilLine,
  "book-open": BookOpen,
  languages: Languages,
  repeat: Repeat,
  newspaper: Newspaper,
  "file-pen": FilePen,
};

export function unitIcon(name: string | null | undefined): LucideIcon {
  return (name && MAP[name]) || Circle;
}

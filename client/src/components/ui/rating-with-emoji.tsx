import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface RatingWithEmojiProps {
  value: number;
  type: "mood" | "anxiety" | "stress";
}

const getEmoji = (value: number, type: "mood" | "anxiety" | "stress") => {
  if (type === "mood") {
    switch (value) {
      case 1:
        return "😢";
      case 2:
        return "😕";
      case 3:
        return "😐";
      case 4:
        return "🙂";
      case 5:
        return "😄";
      default:
        return "";
    }
  } else if (type === "anxiety") {
    switch (value) {
      case 1:
        return "😌";
      case 2:
        return "🙂";
      case 3:
        return "😐";
      case 4:
        return "😟";
      case 5:
        return "😰";
      default:
        return "";
    }
  } else {
    // stress
    switch (value) {
      case 1:
        return "😌";
      case 2:
        return "🙂";
      case 3:
        return "😐";
      case 4:
        return "😓";
      case 5:
        return "🤯";
      default:
        return "";
    }
  }
};

const getLabel = (value: number, type: "mood" | "anxiety" | "stress") => {
  if (value === 1) {
    return "Very Low";
  } else if (value === 2) {
    return "Low";
  } else if (value === 3) {
    return type === "mood" ? "Neutral" : "Moderate";
  } else if (value === 4) {
    return type === "mood" ? "Good" : "High";
  } else if (value === 5) {
    return "Very High";
  }
  return "";
};

export function RatingWithEmoji({ value, type }: RatingWithEmojiProps) {
  return (
    <FormItem key={value} className="flex flex-col items-center space-y-1">
      <FormControl>
        <RadioGroupItem value={value.toString()} />
      </FormControl>
      <FormLabel className="flex flex-col items-center gap-1">
        <span className="text-xl">{getEmoji(value, type)}</span>
        <span>{getLabel(value, type)}</span>
      </FormLabel>
    </FormItem>
  );
}

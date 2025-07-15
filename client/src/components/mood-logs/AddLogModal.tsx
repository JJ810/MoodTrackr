import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { RatingWithEmoji } from "@/components/ui/rating-with-emoji";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(5),
  anxiety: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.enum(["poor", "fair", "good", "excellent"]),
  sleepDisturbances: z.array(z.string()).optional(),
  physicalActivity: z.array(z.string()),
  activityDuration: z.number().min(0).optional(),
  socialInteractions: z.enum(["none", "minimal", "moderate", "high"]),
  depressionSymptoms: z.array(z.string()).optional(),
  anxietySymptoms: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sleepDisturbanceOptions = [
  { id: "waking-up", label: "Waking up frequently" },
  { id: "nightmares", label: "Nightmares" },
  { id: "insomnia", label: "Difficulty falling asleep" },
  { id: "early-waking", label: "Waking up too early" },
];

const physicalActivityOptions = [
  { id: "walking", label: "Walking" },
  { id: "running", label: "Running" },
  { id: "yoga", label: "Yoga" },
  { id: "strength", label: "Strength training" },
  { id: "cycling", label: "Cycling" },
  { id: "swimming", label: "Swimming" },
  { id: "other", label: "Other" },
];

const depressionSymptomOptions = [
  { id: "fatigue", label: "Fatigue" },
  { id: "lack-of-interest", label: "Lack of interest" },
  { id: "hopelessness", label: "Feelings of hopelessness" },
  { id: "concentration", label: "Difficulty concentrating" },
  { id: "appetite-changes", label: "Changes in appetite" },
  { id: "self-worth", label: "Low self-worth" },
];

const anxietySymptomOptions = [
  { id: "restlessness", label: "Restlessness" },
  { id: "worry", label: "Excessive worry" },
  { id: "tension", label: "Muscle tension" },
  { id: "panic", label: "Panic feelings" },
  { id: "avoidance", label: "Avoidance behaviors" },
  { id: "racing-thoughts", label: "Racing thoughts" },
];

export function AddLogModal({ isOpen, onClose }: AddLogModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      mood: 3,
      anxiety: 3,
      stressLevel: 3,
      sleepDisturbances: [],
      physicalActivity: [],
      depressionSymptoms: [],
      anxietySymptoms: [],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/logs`, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      toast.success("Log added successfully");
      form.reset();
      onClose();
    } catch (error: any) {
      console.error("Error adding log:", error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response?.data?.message;

        if (statusCode === 401 || statusCode === 403) {
          toast.error("Authentication error: Please log in again");
        } else if (statusCode === 409) {
          toast.error("A log already exists for this date");
        } else if (statusCode === 400) {
          toast.error(errorMessage || "Invalid data submitted");
        } else {
          toast.error(
            errorMessage || `Server error (${statusCode}): Failed to add log`
          );
        }
      } else if (error.request) {
        toast.error(
          "No response from server. Please check your internet connection."
        );
      } else {
        toast.error(
          "Failed to send request: " + (error.message || "Unknown error")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Daily Log
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emotional State</h3>

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>Mood Rating</FormLabel>
                      <TooltipWrapper content="How would you rate your overall mood today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <RatingWithEmoji
                            key={value}
                            value={value}
                            type="mood"
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anxiety"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>Anxiety Level</FormLabel>
                      <TooltipWrapper content="How would you rate your anxiety level today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <RatingWithEmoji
                            key={value}
                            value={value}
                            type="anxiety"
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>Stress Level</FormLabel>
                      <TooltipWrapper content="How would you rate your stress level today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <RatingWithEmoji
                            key={value}
                            value={value}
                            type="stress"
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sleep</h3>

              <FormField
                control={form.control}
                name="sleepHours"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Hours of Sleep</FormLabel>
                      <TooltipWrapper content="How many hours did you sleep last night?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          className="pr-16"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                          Hour{field.value !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Sleep Quality</FormLabel>
                      <TooltipWrapper content="How would you rate the quality of your sleep?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sleep quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepDisturbances"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Sleep Disturbances</FormLabel>
                      <TooltipWrapper content="Did you experience any sleep disturbances?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {sleepDisturbanceOptions.map((option) => (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, option.id]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (value) => value !== option.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Physical Activity</h3>

              <FormField
                control={form.control}
                name="physicalActivity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Type of Activity</FormLabel>
                      <TooltipWrapper content="What type of physical activity did you do today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {physicalActivityOptions.map((option) => (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, option.id]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (value) => value !== option.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityDuration"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Duration (minutes)</FormLabel>
                      <TooltipWrapper content="How long did you exercise for?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Interactions</h3>

              <FormField
                control={form.control}
                name="socialInteractions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Social Interaction Level</FormLabel>
                      <TooltipWrapper content="How much did you socialize today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interaction level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Symptoms</h3>

              <FormField
                control={form.control}
                name="depressionSymptoms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Depression Symptoms</FormLabel>
                      <TooltipWrapper content="Did you experience any depression symptoms today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {depressionSymptomOptions.map((option) => (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, option.id]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (value) => value !== option.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anxietySymptoms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Anxiety Symptoms</FormLabel>
                      <TooltipWrapper content="Did you experience any anxiety symptoms today?">
                        <span className="text-muted-foreground text-sm">ⓘ</span>
                      </TooltipWrapper>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {anxietySymptomOptions.map((option) => (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, option.id]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (value) => value !== option.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Log"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddLogModal;

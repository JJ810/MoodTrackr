import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(5),
  anxiety: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
  sleepDisturbances: z.array(z.string()).optional(),
  physicalActivity: z.array(z.string()).optional(),
  activityDuration: z.number().min(0).optional(),
  socialInteractions: z
    .enum(["none", "minimal", "moderate", "high"])
    .optional(),
  depressionSymptoms: z.array(z.string()).optional(),
  anxietySymptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Infer the type from the schema
type FormValues = z.infer<typeof formSchema>;

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export function AddLogModal({ isOpen, onClose, onSuccess }: AddLogModalProps) {
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Log added successfully");
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding log:", error);
      toast.error(error.response?.data?.message || "Failed to add log");
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
                          <FormItem
                            key={value}
                            className="flex flex-col items-center space-y-1"
                          >
                            <FormControl>
                              <RadioGroupItem value={value.toString()} />
                            </FormControl>
                            <FormLabel>
                              {value === 1
                                ? "Very Low"
                                : value === 5
                                ? "Very High"
                                : ""}
                            </FormLabel>
                          </FormItem>
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
                          <FormItem
                            key={value}
                            className="flex flex-col items-center space-y-1"
                          >
                            <FormControl>
                              <RadioGroupItem value={value.toString()} />
                            </FormControl>
                            <FormLabel>
                              {value === 1
                                ? "Very Low"
                                : value === 5
                                ? "Very High"
                                : ""}
                            </FormLabel>
                          </FormItem>
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
                          <FormItem
                            key={value}
                            className="flex flex-col items-center space-y-1"
                          >
                            <FormControl>
                              <RadioGroupItem value={value.toString()} />
                            </FormControl>
                            <FormLabel>
                              {value === 1
                                ? "Very Low"
                                : value === 5
                                ? "Very High"
                                : ""}
                            </FormLabel>
                          </FormItem>
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
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
                      <TooltipWrapper content="How many minutes did you spend on physical activity?">
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

            <FormField
              control={form.control}
              name="socialInteractions"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Social Interactions</FormLabel>
                    <TooltipWrapper content="How much did you interact with others today?">
                      <span className="text-muted-foreground text-sm">ⓘ</span>
                    </TooltipWrapper>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level of social interaction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="extensive">Extensive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Symptoms</h3>

              <FormField
                control={form.control}
                name="depressionSymptoms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Depression Symptoms</FormLabel>
                      <TooltipWrapper content="Did you experience any of these symptoms today?">
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
                      <TooltipWrapper content="Did you experience any of these symptoms today?">
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Additional Notes</FormLabel>
                    <TooltipWrapper content="Any additional thoughts or feelings you want to record">
                      <span className="text-muted-foreground text-sm">ⓘ</span>
                    </TooltipWrapper>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes here..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
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

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export const DashboardCard = ({
  title,
  description,
  buttonText,
  onClick,
  icon,
}: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onClick}>{buttonText}</Button>
      </CardFooter>
    </Card>
  );
};

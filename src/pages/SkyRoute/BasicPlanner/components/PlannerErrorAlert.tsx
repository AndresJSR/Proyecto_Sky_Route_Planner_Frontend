interface PlannerErrorAlertProps {
  message: string | null;
}

export function PlannerErrorAlert({ message }: PlannerErrorAlertProps) {
  if (!message) return null;

  return <div className="sr-alert sr-alert--error">{message}</div>;
}

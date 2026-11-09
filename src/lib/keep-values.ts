import { startTransition, type FormEvent } from "react";

// React clears a form after its action runs. Use as onSubmit so a validation error does not wipe what was typed.
export function keepValues(action: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}

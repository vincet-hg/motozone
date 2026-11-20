"use client";

import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { wrapperClassName?: string };

// A password field with an eye button that shows or hides what was typed.
export function PasswordInput({ className = "", wrapperClassName = "", ...props }: Props) {
  const [shown, setShown] = useState(false);
  return (
    <span className={`relative block ${wrapperClassName}`}>
      <input {...props} type={shown ? "text" : "password"} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
        aria-pressed={shown}
        title={shown ? "დამალვა" : "ჩვენება"}
        className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
};

export function PasswordField({
  id = "password",
  label = "Senha",
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  name = "password",
  required,
  minLength,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn(className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={0}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Toque no ícone do olho para ver a senha enquanto digita.
      </p>
    </div>
  );
}

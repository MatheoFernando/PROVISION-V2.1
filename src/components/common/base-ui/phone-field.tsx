"use client"

import type { ComponentProps } from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

import { cn } from "@/lib/utils"

type NativePhoneInputProps = ComponentProps<typeof PhoneInput>

interface PhoneFieldProps
  extends Omit<NativePhoneInputProps, "value" | "onChange" | "ref"> {
  value: string
  onChange?: (value: string) => void
  size?: "md" | "lg"
  className?: string
}

export function PhoneField({
  value,
  onChange,
  size = "lg",
  className,
  disabled,
  ...props
}: PhoneFieldProps) {
  const resolvedValue = value ?? ""
  const {
    numberInputProps,
    defaultCountry,
    international,
    countryCallingCodeEditable,
    ...rest
  } = props

  return (
    <div
      className={cn(
        " file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input group flex w-full items-center gap-3 rounded-md outline-none focus:outline-none focus-visible:outline-none focus-within:outline-none focus-within:ring-0 pl-3 text-base text-slate-900  border shadow-xs overflow-hidden  transition-all ",
        size === "lg" ? "h-9" : "h-9",
        disabled && "opacity-60",
        className
      )}
    >
      <PhoneInput
        {...rest}
        disabled={disabled}
        defaultCountry={defaultCountry ?? "AO"}
        international={international ?? false}
        value={resolvedValue}
        placeholder="Digite seu telefone"
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        className=" flex w-full items-center gap-3 placeholder:text-xs placeholder:text-slate-400"
        countryCallingCodeEditable={countryCallingCodeEditable ?? false}
        maxLength={11}
        numberInputProps={{
          ...numberInputProps,
          className: cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full  bg-transparent text-base text-slate-900 outline-none focus:outline-none focus-visible:outline-none focus-within:outline-none focus-within:ring-0 ",

            numberInputProps?.className
          ),
        }}
      />
    </div>
  )
}


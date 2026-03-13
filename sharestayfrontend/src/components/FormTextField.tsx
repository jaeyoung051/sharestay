// src/components/FormTextField.tsx
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, Control } from "react-hook-form";

// react-hook-form Controller와 MUI TextField를 묶는 공통 컴포넌트
type Props = TextFieldProps & { name: string; control: Control<any> };

export default function FormTextField({
  name,
  control,
  helperText,
  ...rest
}: Props) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}

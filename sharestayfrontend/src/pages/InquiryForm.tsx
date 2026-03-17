// src/pages/InquiryForm.tsx
import { useForm } from "react-hook-form"; // 변경: React 기본 임포트 제거
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

type FormData = {
  name: string;
  email: string;
  message: string;
};

const InquiryForm = () => {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("문의가 정상적으로 제출되었습니다!");
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            문의하기
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="이름*"
              margin="normal"
              {...register("name")}
            />
            <TextField
              fullWidth
              label="이메일*"
              margin="normal"
              {...register("email")}
            />
            <TextField
              fullWidth
              label="문의 내용"
              margin="normal"
              multiline
              rows={4}
              {...register("message")}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: 20 }}
            >
              제출
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InquiryForm;

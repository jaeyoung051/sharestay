// src/pages/Contact.tsx
import { useState, type ChangeEvent, type FormEvent } from "react"; // 변경: 이벤트 타입만 임포트 (React 기본 임포트 제거)
import "./contact.css"; // 변경: 별도 스타일 시트 적용
import { Link as RouterLink } from "react-router-dom"; // 변경: 홈으로 돌아가기 버튼용 링크 임포트

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // 변경: 타입 임포트 사용
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => { // 변경: 타입 임포트 사용
    e.preventDefault();
    console.log("문의 내용:", form);
    alert("문의가 정상적으로 제출되었습니다!");
    setForm({ name: "", email: "", message: "" }); // 제출 후 초기화
  };

  return (
    <div className="contact-wrapper"> {/* 변경: CSS 클래스 적용 */}
      <div className="contact-container"> {/* 변경: CSS 클래스 적용 */}
        <h1 className="contact-title">문의하기</h1>
        <p className="contact-desc">
          궁금한 내용이나 문의사항을 남겨주시면 운영진이 확인 후 답변드릴게요😊
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              이름 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>
              이메일 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>
              문의 내용 <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="문의 내용을 입력하세요"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            문의 보내기
          </button>
          {/* <button type="submit" className="submit-btn" component={RouterLink} to="/">
            홈으로 돌아가기
          </button> */}
        </form>
      </div>
    </div>
  );
}

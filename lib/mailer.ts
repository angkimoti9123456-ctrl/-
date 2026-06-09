import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 465),
    secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

export async function sendVerificationEmail(to: string, code: string) {
    const from = process.env.MAIL_FROM || process.env.MAIL_USER

    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
        throw new Error("메일 서버 환경변수가 설정되지 않았습니다.")
    }

    await transporter.sendMail({
        from,
        to,
        subject: "학교 게시판 이메일 인증코드",
        text: `인증코드는 ${code} 입니다. 3분 안에 입력해 주세요.`,
        html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>학교 게시판 이메일 인증</h2>
        <p>아래 인증코드를 입력해 주세요.</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
          ${code}
        </div>
        <p>유효시간: 3분</p>
      </div>
    `,
    })
}
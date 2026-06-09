export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { randomInt } from "crypto"
import { saveVerificationCode } from "@/lib/verification-store"
import { sendVerificationEmail } from "@/lib/mailer"

function isValidEmailFormat(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const email = String(body.email ?? "").trim()

        if (!email) {
            return NextResponse.json(
                { ok: false, message: "이메일을 입력하세요." },
                { status: 400 }
            )
        }

        if (!isValidEmailFormat(email)) {
            return NextResponse.json(
                { ok: false, message: "이메일 형식이 올바르지 않습니다." },
                { status: 400 }
            )
        }

        const code = String(randomInt(100000, 1000000))
        saveVerificationCode(email, code, 180_000)

        await sendVerificationEmail(email, code)

        return NextResponse.json({
            ok: true,
            message: "인증코드가 전송되었습니다.",
        })
    } catch (error) {
        console.error("POST /api/auth/email/send-code error:", error)
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}
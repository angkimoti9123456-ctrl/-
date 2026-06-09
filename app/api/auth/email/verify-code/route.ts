export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { checkVerificationCode, clearVerificationCode } from "@/lib/verification-store"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const email = String(body.email ?? "").trim()
        const code = String(body.code ?? "").trim()

        if (!email || !code) {
            return NextResponse.json(
                { ok: false, message: "이메일과 인증코드를 입력하세요." },
                { status: 400 }
            )
        }

        const result = checkVerificationCode(email, code)

        if (!result.ok) {
            return NextResponse.json(
                { ok: false, message: result.message },
                { status: 400 }
            )
        }

        clearVerificationCode(email)

        return NextResponse.json({
            ok: true,
            message: "이메일 인증이 완료되었습니다.",
        })
    } catch (error) {
        console.error("POST /api/auth/email/verify-code error:", error)
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from "next/server"
import { JWT } from "google-auth-library"

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID
const SHEET_NAME = "user"

function getKstNow() {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(new Date())
}

async function getAccessToken() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!SPREADSHEET_ID || !clientEmail || !privateKey) {
        throw new Error("Google Sheets 환경변수가 설정되지 않았습니다.")
    }

    const auth = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    await auth.authorize()

    const token = auth.credentials.access_token
    if (!token) {
        throw new Error("Google access token을 가져오지 못했습니다.")
    }

    return token
}

async function sheetsGetValues(range: string, token: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
        range
    )}`

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.error?.message || "시트 값을 읽지 못했습니다.")
    }

    return data
}

async function sheetsAppendValues(range: string, values: string[][], token: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
        range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            values,
        }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.error?.message || "시트에 값을 저장하지 못했습니다.")
    }

    return data
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const user_id = String(body.user_id ?? "").trim()
        const password = String(body.password ?? "").trim()
        const name = String(body.name ?? "").trim()
        const nickname = String(body.nickname ?? "").trim()
        const email = String(body.email ?? "").trim()

        if (!user_id || !password || !name) {
            return NextResponse.json(
                { ok: false, message: "필수 정보가 누락되었습니다." },
                { status: 400 }
            )
        }

        const token = await getAccessToken()

        const existing = await sheetsGetValues(`${SHEET_NAME}!A:A`, token)

        const existingIds = (existing.values ?? [])
            .flat()
            .map((v: unknown) => String(v).trim())
            .filter((v: string) => v && v !== "user_id")

        if (existingIds.includes(user_id)) {
            return NextResponse.json(
                { ok: false, message: "이미 가입된 학번입니다." },
                { status: 409 }
            )
        }

        const row = [
            user_id,
            password,
            name,
            "STUDENT",
            getKstNow(),
            "",
            "",
            "",
            nickname,
            email,
        ]

        await sheetsAppendValues(`${SHEET_NAME}!A:J`, [row], token)

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("signup save error:", error)
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "회원가입 저장 중 오류가 발생했습니다.",
            },
            { status: 500 }
        )
    }
}
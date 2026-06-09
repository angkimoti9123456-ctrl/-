import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const identifier = String(body.identifier ?? "").trim();
        const password = String(body.password ?? "").trim();

        if (!identifier || !password) {
            return NextResponse.json(
                { ok: false, message: "아이디와 비밀번호를 입력하세요." },
                { status: 400 }
            );
        }

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "User!A1:H",
        });

        const rows = res.data.values ?? [];
        if (rows.length < 2) {
            return NextResponse.json(
                { ok: false, message: "사용자 데이터가 없습니다." },
                { status: 404 }
            );
        }

        const headers = rows[0].map((h) => String(h).trim());
        const users = rows.slice(1).map((row) =>
            Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
        );

        const user = users.find((u: any) => {
            const userId = String(u.user_id ?? "").trim();
            return userId === identifier;
        });

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "계정을 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        if (String(user.password ?? "") !== password) {
            return NextResponse.json(
                { ok: false, message: "비밀번호가 일치하지 않습니다." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            ok: true,
            user: {
                id: String(user.user_id ?? ""),
                nickname: String(user.name ?? ""),
                isAdmin: String(user.role ?? "").toUpperCase() === "ADMIN",
                realName: String(user.name ?? ""),
                studentId: String(user.user_id ?? ""),
                email: "",
                status: String(user.status ?? "ACTIVE"),
                sanctionUntil: String(user.sanction_until ?? ""),
                sanctionReason: String(user.sanction_reason ?? ""),
                lastNicknameChange: "",
            },
        });
    } catch (error) {
        console.error("POST /api/login error:", error);
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

function columnToLetter(column: number) {
    let result = "";
    while (column > 0) {
        const modulo = (column - 1) % 26;
        result = String.fromCharCode(65 + modulo) + result;
        column = Math.floor((column - modulo) / 26);
    }
    return result;
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const userId = String(body.user_id ?? "").trim();
        const nickname = String(body.nickname ?? "").trim();

        if (!userId || !nickname) {
            return NextResponse.json(
                { ok: false, message: "user_id와 nickname이 필요합니다." },
                { status: 400 }
            );
        }

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "User!A1:Z",
        });

        const rows = res.data.values ?? [];
        if (rows.length < 2) {
            return NextResponse.json(
                { ok: false, message: "사용자 데이터가 없습니다." },
                { status: 404 }
            );
        }

        const headers = rows[0].map((h) => String(h).trim());
        const userIdIndex = headers.indexOf("user_id");
        const nicknameIndex = headers.indexOf("nickname");

        if (userIdIndex === -1) {
            return NextResponse.json(
                { ok: false, message: "User 시트에 user_id 열이 없습니다." },
                { status: 400 }
            );
        }

        if (nicknameIndex === -1) {
            return NextResponse.json(
                { ok: false, message: "User 시트에 nickname 열을 추가하세요." },
                { status: 400 }
            );
        }

        const dataRows = rows.slice(1);
        const targetIndex = dataRows.findIndex(
            (row) => String(row[userIdIndex] ?? "").trim() === userId
        );

        if (targetIndex === -1) {
            return NextResponse.json(
                { ok: false, message: "사용자를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const sheetRowNumber = targetIndex + 2;
        const targetRow = [...(dataRows[targetIndex] ?? [])];

        while (targetRow.length < headers.length) {
            targetRow.push("");
        }

        targetRow[nicknameIndex] = nickname;

        const lastColumn = columnToLetter(headers.length);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `User!A${sheetRowNumber}:${lastColumn}${sheetRowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [targetRow],
            },
        });

        return NextResponse.json({
            ok: true,
            user: {
                id: userId,
                nickname,
            },
        });
    } catch (error) {
        console.error("PATCH /api/user/nickname error:", error);
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
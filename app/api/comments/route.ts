import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
const range = "Comment!A2:E";

function formatSeoulDateTime(date = new Date()) {
    const parts = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).format(date);

    return parts.replace("T", " ");
}

function extractNumber(value: string) {
    return Number(value.match(/\d+/)?.[0] ?? 0);
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const postId = url.searchParams.get("post_id");

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values ?? [];

        const comments = rows
            .map((row) => ({
                comment_id: row[0] ?? "",
                post_id: row[1] ?? "",
                author_id: row[2] ?? "",
                content: row[3] ?? "",
                created_at: row[4] ?? "",
            }))
            .filter((comment) => !postId || comment.post_id === postId);

        return NextResponse.json({
            ok: true,
            comments,
        });
    } catch (error) {
        console.error("GET /api/comments error:", error);
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const postId = String(body.post_id ?? "").trim();
        const authorId = String(body.author_id ?? "").trim() || "anonymous";
        const content = String(body.content ?? "").trim();

        if (!postId || !content) {
            return NextResponse.json(
                { ok: false, message: "post_id와 content는 필수입니다." },
                { status: 400 }
            );
        }

        const existing = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Comment!A2:A",
        });

        const ids = (existing.data.values ?? [])
            .map((row) => row[0])
            .filter(Boolean)
            .map((id) => extractNumber(String(id)));

        const nextNumber = ids.length ? Math.max(...ids) + 1 : 1;
        const commentId = `c_${String(nextNumber).padStart(3, "0")}`;
        const createdAt = formatSeoulDateTime();

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Comment!A:E",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[commentId, postId, authorId, content, createdAt]],
            },
        });

        return NextResponse.json(
            {
                ok: true,
                comment: {
                    comment_id: commentId,
                    post_id: postId,
                    author_id: authorId,
                    content,
                    created_at: createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/comments error:", error);
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
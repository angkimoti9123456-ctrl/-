import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
const postRange = "Post!A2:H";
const commentRange = "Comment!A2:E";

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

async function getNicknameMap() {
  const userRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "User!A1:Z",
  });

  const rows = userRes.data.values ?? [];
  if (rows.length < 2) return new Map<string, string>();

  const headers = rows[0].map((h) => String(h).trim());
  const userIdIndex = headers.indexOf("user_id");
  const nicknameIndex = headers.indexOf("nickname");
  const nameIndex = headers.indexOf("name");

  const map = new Map<string, string>();

  for (const row of rows.slice(1)) {
    const userId = String(row[userIdIndex] ?? "").trim();
    if (!userId) continue;

    const nickname =
      String(row[nicknameIndex] ?? "").trim() ||
      String(row[nameIndex] ?? "").trim() ||
      userId;

    map.set(userId, nickname);
  }

  return map;
}

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: postRange,
    });

    const rows = response.data.values ?? [];

    const nicknameMap = await getNicknameMap();

    const posts = rows.map((row) => {
      const authorId = String(row[2] ?? "").trim();

      return {
        post_id: row[0] ?? "",
        type: row[1] ?? "",
        author_id: authorId,
        author_nickname: nicknameMap.get(authorId) ?? authorId,
        title: row[3] ?? "",
        content: row[4] ?? "",
        view_count: Number(row[5] ?? 0),
        due_date: row[6] ?? "",
        created_at: row[7] ?? "",
      };
    });

    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    const type = String(body.type ?? "FREE").trim().toUpperCase();
    const authorId = String(body.author_id ?? "").trim() || "anonymous";

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, message: "제목과 내용을 입력하세요." },
        { status: 400 }
      );
    }

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Post!A2:A",
    });

    const ids = (existing.data.values ?? [])
      .map((row) => row[0])
      .filter(Boolean)
      .map((id) => extractNumber(String(id)));

    const nextNumber = ids.length ? Math.max(...ids) + 1 : 1;
    const postId = `p_${String(nextNumber).padStart(3, "0")}`;
    const createdAt = formatSeoulDateTime();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Post!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[postId, type, authorId, title, content, 0, "", createdAt]],
      },
    });

    return NextResponse.json(
      {
        ok: true,
        post: {
          post_id: postId,
          type,
          author_id: authorId,
          title,
          content,
          view_count: 0,
          due_date: "",
          created_at: createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const postId = String(body.post_id ?? "").trim();

    if (!postId) {
      return NextResponse.json(
        { ok: false, message: "post_id가 필요합니다." },
        { status: 400 }
      );
    }

    const postRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: postRange,
    });

    const postRows = postRes.data.values ?? [];
    const filteredPostRows = postRows.filter((row) => row[0] !== postId);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: postRange,
    });

    if (filteredPostRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: postRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: filteredPostRows,
        },
      });
    }

    const commentRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: commentRange,
    });

    const commentRows = commentRes.data.values ?? [];
    const filteredCommentRows = commentRows.filter((row) => row[1] !== postId);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: commentRange,
    });

    if (filteredCommentRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: commentRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: filteredCommentRows,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
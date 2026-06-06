import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
const range = "Report!A2:G";

function formatSeoulDate(date = new Date()) {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function extractNumber(value: string) {
    return Number(value.match(/\d+/)?.[0] ?? 0);
}

export async function GET() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values ?? [];

        const reports = rows.map((row) => ({
            report_id: row[0] ?? "",
            type: row[1] ?? "",
            target_id: row[2] ?? "",
            title: row[3] ?? "",
            reason: row[4] ?? "",
            reporter: row[5] ?? "",
            date: row[6] ?? "",
            status: row[7] ?? "pending",
        }));

        return NextResponse.json({ ok: true, reports });
    } catch (error) {
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

        const type = String(body.type ?? "").trim();
        const targetId = String(body.target_id ?? "").trim();
        const title = String(body.title ?? "").trim();
        const reason = String(body.reason ?? "").trim();
        const reporter = String(body.reporter ?? "익명").trim() || "익명";

        if (!type || !targetId || !title || !reason) {
            return NextResponse.json(
                { ok: false, message: "필수 값이 비어 있습니다." },
                { status: 400 }
            );
        }

        const existing = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Report!A2:A",
        });

        const ids = (existing.data.values ?? [])
            .map((row) => row[0])
            .filter(Boolean)
            .map((id) => extractNumber(String(id)));

        const nextNumber = ids.length ? Math.max(...ids) + 1 : 1;
        const reportId = `r_${String(nextNumber).padStart(3, "0")}`;
        const date = formatSeoulDate();

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Report!A:H",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[reportId, type, targetId, title, reason, reporter, date, "pending"]],
            },
        });

        return NextResponse.json(
            {
                ok: true,
                report: {
                    report_id: reportId,
                    type,
                    target_id: targetId,
                    title,
                    reason,
                    reporter,
                    date,
                    status: "pending",
                },
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const reportId = String(body.report_id ?? "").trim();
        const status = String(body.status ?? "").trim();

        if (!reportId || !status) {
            return NextResponse.json(
                { ok: false, message: "report_id와 status가 필요합니다." },
                { status: 400 }
            );
        }

        const reportRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Report!A2:H",
        });

        const reportRows = reportRes.data.values ?? [];
        const reportIndex = reportRows.findIndex((row) => row[0] === reportId);

        if (reportIndex === -1) {
            return NextResponse.json(
                { ok: false, message: "신고를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const targetType = String(reportRows[reportIndex][1] ?? "");
        const targetIdRaw = String(reportRows[reportIndex][2] ?? "");
        const reason = String(reportRows[reportIndex][4] ?? "");

        const resolvedTargetId =
            targetType === "post"
                ? `p_${String(targetIdRaw).padStart(3, "0")}`
                : `c_${String(targetIdRaw).padStart(3, "0")}`;

        let offenderId = "";

        if (targetType === "post") {
            const postRes = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "Post!A2:H",
            });

            const postRows = postRes.data.values ?? [];
            const targetPost = postRows.find((row) => row[0] === resolvedTargetId);
            offenderId = String(targetPost?.[2] ?? "");
        } else if (targetType === "comment") {
            const commentRes = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "Comment!A2:E",
            });

            const commentRows = commentRes.data.values ?? [];
            const targetComment = commentRows.find((row) => row[0] === resolvedTargetId);
            offenderId = String(targetComment?.[2] ?? "");
        }

        const updatedReportRows = reportRows.map((row, idx) => {
            if (idx === reportIndex) {
                return [
                    row[0] ?? "",
                    row[1] ?? "",
                    row[2] ?? "",
                    row[3] ?? "",
                    row[4] ?? "",
                    row[5] ?? "",
                    row[6] ?? "",
                    status,
                ];
            }
            return row;
        });

        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: "Report!A2:H",
        });

        if (updatedReportRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Report!A2:H",
                valueInputOption: "USER_ENTERED",
                requestBody: { values: updatedReportRows },
            });
        }

        if (status === "sanctioned" && offenderId) {
            const userRes = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "User!A2:H",
            });

            const userRows = userRes.data.values ?? [];

            const sanctionUntil = new Date();
            sanctionUntil.setDate(sanctionUntil.getDate() + 7);

            const sanctionUntilStr = new Intl.DateTimeFormat("sv-SE", {
                timeZone: "Asia/Seoul",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(sanctionUntil);

            const updatedUserRows = userRows.map((row) => {
                if (row[0] === offenderId) {
                    return [
                        row[0] ?? "",
                        row[1] ?? "",
                        row[2] ?? "",
                        row[3] ?? "",
                        row[4] ?? "",
                        "SANCTIONED",
                        sanctionUntilStr,
                        reason,
                    ];
                }
                return row;
            });

            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: "User!A2:H",
            });

            if (updatedUserRows.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: "User!A2:H",
                    valueInputOption: "USER_ENTERED",
                    requestBody: { values: updatedUserRows },
                });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("PATCH /api/reports error:", error);
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
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
            range: "Post!A2:H",
        });

        const postRows = postRes.data.values ?? [];
        const filteredPostRows = postRows.filter((row) => row[0] !== postId);

        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: "Post!A2:H",
        });

        if (filteredPostRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Post!A2:H",
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: filteredPostRows,
                },
            });
        }

        const commentRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Comment!A2:E",
        });

        const commentRows = commentRes.data.values ?? [];
        const filteredCommentRows = commentRows.filter((row) => row[1] !== postId);

        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: "Comment!A2:E",
        });

        if (filteredCommentRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Comment!A2:E",
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
            {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
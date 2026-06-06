import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        {
          ok: false,
          step: "env",
          message: "환경변수가 비어 있습니다.",
          envCheck: {
            spreadsheetId: !!spreadsheetId,
            clientEmail: !!clientEmail,
            privateKey: !!privateKey,
          },
        },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.authorize();

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const meta = await sheets.spreadsheets.get({ spreadsheetId });

    const sheetTitles =
      meta.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean) ?? [];

    let readResult: any = null;

    if (sheetTitles.length > 0) {
      const targetSheet = sheetTitles.includes("Post") ? "Post" : sheetTitles[0];

      readResult = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${targetSheet}!A1:H5`,
      });
    }

    return NextResponse.json({
      ok: true,
      step: "success",
      spreadsheetTitle: meta.data.properties?.title ?? null,
      sheetTitles,
      sampleValues: readResult?.data.values ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        step: "error",
        message: error?.message ?? String(error),
        code: error?.code,
        status: error?.status,
        response: error?.response?.data ?? null,
      },
      { status: 500 }
    );
  }
}
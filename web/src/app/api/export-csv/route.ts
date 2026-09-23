import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const csvPath = path.resolve(process.cwd(), "..", "output.csv");
    let content = "";
    if (fs.existsSync(csvPath)) {
      content = fs.readFileSync(csvPath, "utf-8");
    } else {
      // Fallback to local copy
      const localPath = path.resolve(process.cwd(), "public", "output.csv");
      if (fs.existsSync(localPath)) {
        content = fs.readFileSync(localPath, "utf-8");
      }
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="output.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}

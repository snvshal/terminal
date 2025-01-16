// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getUserByUsername } from "@/app/actions"
import ReactPDF, { Document } from "@react-pdf/renderer"
import ResumePDF from "@/components/ResumePDF"
import React from "react"

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      )
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create the PDF document with proper structure
    const pdfElement = React.createElement(
      Document,
      {},
      React.createElement(ResumePDF, {
        portfolio: user.portfolio,
      }),
    )

    // Generate PDF stream
    const pdfStream = await ReactPDF.renderToStream(pdfElement)

    // Create readable stream for response
    const responseStream = new ReadableStream({
      start(controller) {
        pdfStream.on("data", (chunk) => {
          controller.enqueue(chunk)
        })
        pdfStream.on("end", () => {
          controller.close()
        })
        pdfStream.on("error", (err) => {
          controller.error(err)
        })
      },
    })

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${username}_resume.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    )
  }
}

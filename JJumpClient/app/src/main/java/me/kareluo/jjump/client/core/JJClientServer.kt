package me.kareluo.jjump.client.core

import android.graphics.Bitmap.CompressFormat
import fi.iki.elonen.NanoHTTPD
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException

/**
 * Created by felix on 2018/1/1 下午5:04.
 */

class JJClientServer(private val config: Configure) : NanoHTTPD(8088) {

    private val screenshot = JJScreenshot(config)

    init {
        try {
            start(10)
        } catch (e: IOException) {
            println(e)
        }
    }

    override fun serve(session: IHTTPSession?): Response {
        if (session?.uri != null) {
            if (session.uri.startsWith("/screenshot")) {
                return fetchScreenshotResponse()
            }
        }
        return newFixedLengthResponse(NanoHTTPD.Response.Status.OK, NanoHTTPD.MIME_HTML, "访问无效")
    }

    private fun fetchScreenshotResponse(): Response {
        return try {
            val bitmap = screenshot.shot()

            if (bitmap == null) {
                NanoHTTPD.newFixedLengthResponse(
                        NanoHTTPD.Response.Status.INTERNAL_ERROR,
                        NanoHTTPD.MIME_HTML,
                        "无法获取屏幕截图"
                )
            } else {
                val oStream = ByteArrayOutputStream()

                bitmap.compress(CompressFormat.WEBP, config.quality, oStream)

                val datas = oStream.toByteArray()

                oStream.close()

                if (datas == null || datas.isEmpty()) {
                    NanoHTTPD.newFixedLengthResponse(
                            NanoHTTPD.Response.Status.INTERNAL_ERROR,
                            NanoHTTPD.MIME_HTML,
                            "图片数据压缩失败"
                    )
                } else {
                    val iStream = ByteArrayInputStream(datas)
                    NanoHTTPD.newFixedLengthResponse(
                            NanoHTTPD.Response.Status.OK,
                            "image/webp",
                            iStream,
                            datas.size.toLong()
                    )
                }
            }
        } catch (e: Exception) {
            NanoHTTPD.newFixedLengthResponse(
                    NanoHTTPD.Response.Status.INTERNAL_ERROR,
                    NanoHTTPD.MIME_HTML,
                    e.message
            )
        }
    }
}
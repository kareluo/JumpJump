package me.kareluo.jjump.client.core

import fi.iki.elonen.NanoWSD
import java.io.IOException
import kotlin.system.exitProcess

/**
 * Created by felix on 2017/8/12 下午3:06.
 */
class JJClientService(val config: Configure) : NanoWSD(8089) {

    init {
        println(config)
        try {
            start(0)
            println("start-service")
        } catch (e: IOException) {
            println(e)
        }
    }

    override fun openWebSocket(handshake: IHTTPSession?): WebSocket {
        println(handshake.toString())
        return ArnoldWebSocket(handshake)
    }

    inner internal class ArnoldWebSocket(handshake: IHTTPSession?)
        : WebSocket(handshake), JJEncoder.EncoderCallback {

        private val encoder = JJEncoder(config)

        init {
            encoder.callback = this
            println("JJClientService: init.")
        }

        override fun onOpen() {
            encoder.start()
            println("JJClientService: onOpen.")
        }

        override fun onClose(code: WebSocketFrame.CloseCode?, reason: String?, initiatedByRemote: Boolean) {
            encoder.stop()
            println("JJClientService: onClose.")
            exitProcess(0)
        }

        override fun onPong(pong: WebSocketFrame?) {
            println("Arnold onPong:frame=$pong")
        }

        override fun onMessage(message: WebSocketFrame?) {
            println("Arnold onMessage:message=${message?.textPayload}")
            if (message?.opCode == WebSocketFrame.OpCode.Text) {
                when (message.textPayload) {
                    "start" -> encoder.start()
                    "stop" -> encoder.stop()
                }
            }
        }

        override fun onException(exception: IOException?) {
            println("onException " + exception)
            exitProcess(0)
        }

        override fun onEncodeFrame(frame: ByteArray) {
            send(frame)
        }
    }
}
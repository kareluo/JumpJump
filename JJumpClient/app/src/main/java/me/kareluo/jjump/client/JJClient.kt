package me.kareluo.jjump.client

import android.os.SystemClock
import me.kareluo.jjump.client.core.Configure
import me.kareluo.jjump.client.core.JJClientService

/**
 * Created by felix on 2018/1/1 下午5:12.
 */

fun main(args: Array<String>) {

//    val config: Configure = try {
//        val dm = Resources.getSystem().displayMetrics
//        println("w=${dm.widthPixels},h=${dm.heightPixels}")
//        Configure(dm.widthPixels, dm.heightPixels)
//    } catch (e: Exception) {
//        Configure()
//    }

    val config = Configure()

    config.quality = 70

    System.out.println("JumpJump")

    if (args.isNotEmpty()) {
        // TODO
    }

    JJClientService(config)

    SystemClock.sleep(10 * 60 * 1000)
}
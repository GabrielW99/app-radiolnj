package com.pguides.app_radiolnj

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import com.pguides.app_radiolnj.R.id.playBtn

class MainActivity : AppCompatActivity() {

    private lateinit var BPlayPause: ImageView
    private lateinit var MPlayer:MediaPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        BPlayPause = findViewById(R.id.playBtn)
        RadioLNJ()
    }

    private fun RadioLNJ(){
        val url = "https://s2.free-shoutcast.com/stream/18018"

        MPlayer = MediaPlayer()
        MPlayer.setDataSource(url)
        MPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC)
        MPlayer.prepareAsync()
        MPlayer.setOnPreparedListener {
            Play(this)
        }
    }
    private fun Play(context: Context){
        BPlayPause.setOnClickListener{
            if(MPlayer.isPlaying){
                MPlayer.pause()
                BPlayPause.setImageResource(R.drawable.ic_baseline_play_circle_outline_24)
                Toast.makeText(context,"Pausado", Toast.LENGTH_SHORT).show()
            }

            else{
                MPlayer.start()
                BPlayPause.setImageResource(R.drawable.ic_baseline_pause_circle_outline_24)
                Toast.makeText(context,"Reproduciendo", Toast.LENGTH_SHORT).show()
            }
        }


    }
}